from __future__ import annotations

from collections import Counter

from app.core.config import get_settings
from app.rag.model_reranker import model_rerank
from app.rag.retriever import RetrievedChunk, cosine_from_counters, infer_doc_type, infer_step_id, normalize_text, tokenize


CONTEXT_DEPENDENT_WORDS = [
    "这里",
    "这个",
    "这一步",
    "当前",
    "现在",
    "怎么弄",
    "怎么操作",
    "怎么做",
    "下一步",
]


def is_context_dependent_question(question: str) -> bool:
    normalized = normalize_text(question)
    if infer_step_id(question) or infer_doc_type(question) in {"materials", "safety", "concepts"}:
        return False
    return any(normalize_text(word) in normalized for word in CONTEXT_DEPENDENT_WORDS)


def rerank_chunks(
    question: str,
    candidates: list[RetrievedChunk],
    *,
    top_k: int,
    doc_type: str | None = None,
    step_id: str | None = None,
    context_step_id: str | None = None,
) -> list[RetrievedChunk]:
    if not candidates:
        return []

    settings = get_settings()
    if settings.reranker_provider in {"llm", "openai_compatible", "dashscope"}:
        try:
            return model_rerank(question, candidates, top_k=top_k)
        except Exception:
            if not settings.reranker_allow_local_fallback:
                raise

    query_vector = Counter(tokenize(question))
    inferred_doc_type = doc_type or infer_doc_type(question)
    inferred_step_id = step_id or infer_step_id(question)
    context_dependent = is_context_dependent_question(question)
    reranked: list[RetrievedChunk] = []

    for item in candidates:
        chunk = item.chunk
        chunk_vector = Counter(tokenize(" ".join([chunk.title, chunk.text])))
        lexical_score = cosine_from_counters(query_vector, chunk_vector)
        score = item.score * 0.65 + lexical_score * 0.45

        title_norm = normalize_text(chunk.title)
        question_norm = normalize_text(question)
        if title_norm and title_norm in question_norm:
            score += 0.2
        if inferred_doc_type and chunk.doc_type == inferred_doc_type:
            score += 0.25
        if inferred_step_id and chunk.step_id == inferred_step_id:
            score += 0.4
        if context_step_id and context_dependent and chunk.step_id == context_step_id:
            score += 0.12
        if context_step_id and not context_dependent and chunk.step_id == context_step_id:
            score += 0.03

        reranked.append(RetrievedChunk(chunk=chunk, score=round(score, 6)))

    reranked.sort(key=lambda item: item.score, reverse=True)
    return reranked[: max(1, min(top_k, 20))]
