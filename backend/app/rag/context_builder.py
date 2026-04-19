from __future__ import annotations

from app.rag.query_analyzer import QueryContext
from app.rag.retriever import RetrievedChunk


def source_from_retrieved(item: RetrievedChunk) -> dict:
    chunk = item.chunk
    return {
        "chunk_id": chunk.chunk_id,
        "experiment_id": chunk.experiment_id,
        "experiment_type": chunk.experiment_type,
        "doc_type": chunk.doc_type,
        "step_id": chunk.step_id,
        "title": chunk.title,
        "source": chunk.source,
        "score": item.score,
    }


def build_sources(retrieved: list[RetrievedChunk]) -> list[dict]:
    return [source_from_retrieved(item) for item in retrieved]


def build_retrieval_debug(
    *,
    context: QueryContext,
    vector_count: int,
    sparse_count: int,
    fused_count: int,
    reranked_count: int,
    top_k: int,
    total_chunks: int,
    llm_result,
) -> dict:
    return {
        "retriever": "modular_hybrid_rag_v1",
        "vector_candidates": vector_count,
        "sparse_candidates": sparse_count,
        "fused_candidates": fused_count,
        "reranked_candidates": reranked_count,
        "top_k": top_k,
        "matched": reranked_count,
        "total_chunks": total_chunks,
        "query": {
            "type": context.query_type,
            "experiment_id": context.experiment_id,
            "doc_type": context.doc_type,
            "step_id": context.step_id,
            "context_step_id": context.context_step_id,
            "is_context_dependent": context.is_context_dependent,
            "rewritten_query": context.rewritten_query,
        },
        "llm": {
            "used_llm": llm_result.used_llm,
            "provider": llm_result.provider,
            "model": llm_result.model,
        },
        "filters": {
            "resolved": {
                "experiment_id": context.experiment_id,
                "doc_type": context.doc_type,
                "step_id": context.step_id,
                "context_step_id": context.context_step_id,
                "scene": context.scene,
                "page_context": context.page_context,
            },
        },
    }
