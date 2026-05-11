from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from app.rag.experiment_registry import ExperimentInfo, get_experiment_info, resolve_experiment
from app.rag.retriever import infer_doc_type, infer_step_id, normalize_text


FOLLOWUP_KEYWORDS = ["这个", "这里", "这一步", "当前", "现在", "下一步", "怎么弄", "怎么操作", "怎么做", "为什么这样", "材料够吗"]


@dataclass(frozen=True)
class NormalizedContext:
    user_query: str
    frontend_experiment_id: str | None
    resolved_experiment_id: str | None
    experiment_type: str | None
    canonical_title: str | None
    display_title: str | None
    doc_type: str | None
    frontend_step_id: str | None
    current_step_id: str | None
    resolved_step_id: str | None
    scene: str
    page_context_summary: str | None
    history_summary: str | None
    is_followup: bool
    context_confidence: float
    warnings: tuple[str, ...]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def summarize_text(text: str | None, *, limit: int = 500) -> str | None:
    if not text:
        return None
    clean = " ".join(line.strip() for line in str(text).splitlines() if line.strip())
    if not clean:
        return None
    return clean[:limit].rstrip()


def summarize_history(history: list[dict[str, Any]] | None, messages: list[dict[str, Any]] | None) -> str | None:
    rows = list(history or []) + list(messages or [])
    if not rows:
        return None
    parts: list[str] = []
    for row in rows[-4:]:
        role = str(row.get("role") or row.get("sender") or "")
        content = str(row.get("content") or row.get("message") or "")
        if content:
            parts.append(f"{role}:{content}")
    return summarize_text(" | ".join(parts), limit=300)


def is_followup_query(question: str, *, has_explicit_context: bool) -> bool:
    normalized = normalize_text(question)
    has_word = any(normalize_text(keyword) in normalized for keyword in FOLLOWUP_KEYWORDS)
    return has_word and not has_explicit_context


def normalize_context(
    *,
    question: str,
    experiment_id: str | None = None,
    doc_type: str | None = None,
    step_id: str | None = None,
    context_step_id: str | None = None,
    scene: str | None = None,
    page_context: str | None = None,
    history: list[dict[str, Any]] | None = None,
    messages: list[dict[str, Any]] | None = None,
) -> NormalizedContext:
    user_query = (question or "").strip()
    warnings: list[str] = []
    raw_explicit_info = resolve_experiment(user_query)
    frontend_info = get_experiment_info(experiment_id)
    info: ExperimentInfo | None = resolve_experiment(user_query, frontend_experiment_id=experiment_id) or frontend_info

    if raw_explicit_info and frontend_info and info and info.experiment_id == raw_explicit_info.experiment_id and raw_explicit_info.experiment_id != frontend_info.experiment_id:
        warnings.append(f"context_override:{frontend_info.experiment_id}->{raw_explicit_info.experiment_id}")
    elif experiment_id and not frontend_info:
        warnings.append(f"unknown_frontend_experiment:{experiment_id}")

    inferred_doc_type = doc_type or infer_doc_type(user_query)
    explicit_step = infer_step_id(user_query)
    resolved_step = step_id or explicit_step
    current_step = context_step_id
    has_explicit_context = bool(raw_explicit_info or inferred_doc_type or resolved_step)
    has_followup_word = any(normalize_text(keyword) in normalize_text(user_query) for keyword in FOLLOWUP_KEYWORDS)
    followup = is_followup_query(user_query, has_explicit_context=has_explicit_context)
    if not resolved_step and current_step and (followup or has_followup_word):
        resolved_step = current_step

    confidence = 0.25
    if info:
        confidence += 0.35
    if raw_explicit_info:
        confidence += 0.2
    if inferred_doc_type:
        confidence += 0.1
    if resolved_step:
        confidence += 0.1

    return NormalizedContext(
        user_query=user_query,
        frontend_experiment_id=experiment_id,
        resolved_experiment_id=info.experiment_id if info else None,
        experiment_type=info.experiment_type if info else None,
        canonical_title=info.canonical_title if info else None,
        display_title=info.display_title if info else None,
        doc_type=inferred_doc_type,
        frontend_step_id=step_id,
        current_step_id=current_step,
        resolved_step_id=resolved_step,
        scene=(scene or "general").strip() or "general",
        page_context_summary=summarize_text(page_context),
        history_summary=summarize_history(history, messages),
        is_followup=followup,
        context_confidence=min(round(confidence, 3), 1.0),
        warnings=tuple(warnings),
    )
