from __future__ import annotations

from app.core.config import get_settings
from app.rag.bm25_retriever import BM25Retriever
from app.rag.query_analyzer import QueryContext
from app.rag.retriever import RetrievedChunk
from app.rag.splitter import Chunk
from app.rag.vector_store import VectorStore


def reciprocal_rank_fusion(
    result_groups: list[list[RetrievedChunk]],
    *,
    rrf_k: int = 60,
) -> list[RetrievedChunk]:
    scores: dict[str, float] = {}
    chunks: dict[str, Chunk] = {}

    for results in result_groups:
        for rank, item in enumerate(results, start=1):
            chunk_id = item.chunk.chunk_id
            chunks[chunk_id] = item.chunk
            scores[chunk_id] = scores.get(chunk_id, 0.0) + 1.0 / (rrf_k + rank)

    fused = [
        RetrievedChunk(chunk=chunks[chunk_id], score=round(score, 6))
        for chunk_id, score in scores.items()
    ]
    fused.sort(key=lambda item: item.score, reverse=True)
    return fused


class HybridRetriever:
    def __init__(self, chunks: list[Chunk]):
        self.settings = get_settings()
        self.chunks = chunks
        self.vector_store = VectorStore.load_or_build(self.settings.vectors_path, chunks)
        self.sparse_retriever = BM25Retriever(chunks)

    def retrieve(self, context: QueryContext, *, top_k: int) -> dict:
        candidate_k = max(top_k * self.settings.candidate_multiplier, self.settings.min_candidate_k)
        vector_results = self.vector_store.search(
            context.rewritten_query,
            experiment_id=context.experiment_id,
            doc_type=context.doc_type,
            step_id=context.step_id,
            context_step_id=context.context_step_id if context.is_context_dependent else None,
            top_k=candidate_k,
        )
        sparse_results = self.sparse_retriever.search(
            context.rewritten_query,
            experiment_id=context.experiment_id,
            doc_type=context.doc_type,
            step_id=context.step_id,
            top_k=candidate_k,
        )
        fused_results = reciprocal_rank_fusion(
            [vector_results, sparse_results],
            rrf_k=self.settings.rrf_k,
        )
        return {
            "vector_results": vector_results,
            "sparse_results": sparse_results,
            "fused_results": fused_results,
            "candidate_k": candidate_k,
            "fusion_strategy": "rrf",
        }
