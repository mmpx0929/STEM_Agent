from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from app.rag.context_normalizer import NormalizedContext
from app.rag.kb_router import RouteDecision
from app.rag.query_analyzer import resolve_query_type


@dataclass(frozen=True)
class RewrittenQuery:
    original_query: str
    standalone_query: str
    retrieval_query: str
    query_type: str
    use_kb: bool
    filters: dict[str, str]
    rewrite_confidence: float
    route_reason: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _compact(text: str, limit: int = 500) -> str:
    clean = " ".join(part.strip() for part in text.splitlines() if part.strip())
    return clean[:limit].rstrip()


def rewrite_query(context: NormalizedContext, route: RouteDecision) -> RewrittenQuery:
    filters = dict(route.expected_filters)
    doc_type = filters.get("doc_type") or context.doc_type
    step_id = filters.get("step_id") or context.resolved_step_id
    query_type = resolve_query_type(context.user_query, doc_type, step_id)

    parts = []
    if context.resolved_experiment_id:
        parts.append(context.resolved_experiment_id)
    if context.canonical_title:
        parts.append(context.canonical_title)
    if doc_type:
        parts.append(doc_type)
    if step_id:
        parts.append(step_id)
    if context.page_context_summary:
        parts.append(context.page_context_summary)
    parts.append(context.user_query)
    standalone_query = _compact(" ".join(parts), limit=500)

    retrieval_parts = []
    if context.resolved_experiment_id:
        retrieval_parts.append(f"实验ID：{context.resolved_experiment_id}")
    if context.canonical_title:
        retrieval_parts.append(f"实验名称：{context.canonical_title}")
    if doc_type:
        retrieval_parts.append(f"文档类型：{doc_type}")
    if step_id:
        retrieval_parts.append(f"步骤：{step_id}")
    if context.page_context_summary:
        retrieval_parts.append(f"页面上下文：{context.page_context_summary}")
    retrieval_parts.append(f"问题：{context.user_query}")
    retrieval_query = _compact(" ".join(retrieval_parts), limit=500)

    return RewrittenQuery(
        original_query=context.user_query,
        standalone_query=standalone_query,
        retrieval_query=retrieval_query or context.user_query,
        query_type=query_type,
        use_kb=route.use_kb,
        filters=filters,
        rewrite_confidence=context.context_confidence,
        route_reason=route.reason,
    )
