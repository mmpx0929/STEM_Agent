from fastapi import APIRouter

from app.schemas.rag import KBRebuildResponse, RAGQueryRequest, RAGResponse
from app.services.rag_service import get_index_status, query_knowledge_base, rebuild_index


router = APIRouter(tags=["rag"])


@router.get("/api/v1/kb/status")
def kb_status():
    return get_index_status()


@router.post("/api/v1/kb/rebuild", response_model=KBRebuildResponse)
def kb_rebuild():
    return rebuild_index()


@router.post("/api/v1/rag/query", response_model=RAGResponse)
def rag_query(payload: RAGQueryRequest):
    return query_knowledge_base(
        question=payload.question,
        experiment_id=payload.experiment_id,
        doc_type=payload.doc_type,
        step_id=payload.step_id,
        context_step_id=payload.context_step_id,
        scene=payload.scene,
        page_context=payload.page_context,
        top_k=payload.top_k,
    )
