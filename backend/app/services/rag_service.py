from __future__ import annotations

from typing import Any

from app.rag.context_builder import build_retrieval_debug, build_sources
from app.rag.hybrid_retriever import HybridRetriever
from app.rag.index_manager import get_chunks, get_index_status, rebuild_index
from app.rag.query_analyzer import analyze_query
from app.rag.reranker import rerank_chunks
from app.services.llm_service import synthesize_rag_answer


def query_knowledge_base(
    *,
    question: str,
    experiment_id: str | None = None,
    doc_type: str | None = None,
    step_id: str | None = None,
    context_step_id: str | None = None,
    scene: str | None = None,
    page_context: str | None = None,
    top_k: int = 5,
) -> dict[str, Any]:
    chunks = get_chunks(auto_rebuild=True)
    query_context = analyze_query(
        question=question,
        experiment_id=experiment_id,
        doc_type=doc_type,
        step_id=step_id,
        context_step_id=context_step_id,
        scene=scene,
        page_context=page_context,
    )

    retrieval = HybridRetriever(chunks).retrieve(query_context, top_k=top_k)
    retrieved = rerank_chunks(
        question,
        retrieval["fused_results"],
        top_k=top_k,
        doc_type=query_context.doc_type,
        step_id=query_context.step_id,
        context_step_id=query_context.context_step_id,
    )
    llm_result = synthesize_rag_answer(
        question,
        retrieved,
        query_type=query_context.query_type,
    )
    sources = build_sources(retrieved)

    return {
        "answer": llm_result.answer,
        "sources": sources,
        "retrieval": build_retrieval_debug(
            context=query_context,
            vector_count=len(retrieval["vector_results"]),
            sparse_count=len(retrieval["sparse_results"]),
            fused_count=len(retrieval["fused_results"]),
            reranked_count=len(retrieved),
            top_k=top_k,
            total_chunks=len(chunks),
            llm_result=llm_result,
        ),
    }


__all__ = ["get_index_status", "query_knowledge_base", "rebuild_index"]
