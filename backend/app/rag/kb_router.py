from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Literal

from app.rag.context_normalizer import NormalizedContext
from app.rag.retriever import normalize_text


RouteName = Literal["kb", "llm_only", "clarify"]

STRONG_KB_KEYWORDS = [
    "实验", "材料", "步骤", "流程", "原理", "安全", "注意", "报告", "结论", "反思", "测试", "数据", "搭建",
    "甩干机", "洗衣机", "旋转飞椅", "电机", "波轮", "离心力", "五角星", "变量", "记录", "工程实践",
]
LLM_ONLY_KEYWORDS = ["你好", "谢谢", "你是谁", "什么模型", "讲个笑话", "天气", "翻译", "润色", "鼓励语"]
EXPERIMENT_REQUIRED_WORDS = ["这个实验", "这一步", "当前步骤", "这里怎么", "下一步"]


@dataclass(frozen=True)
class RouteDecision:
    use_kb: bool
    route: RouteName
    reason: str
    confidence: float
    expected_doc_type: str | None
    expected_filters: dict[str, str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def decide_route(context: NormalizedContext) -> RouteDecision:
    normalized = normalize_text(context.user_query)
    filters: dict[str, str] = {}
    if context.resolved_experiment_id:
        filters["experiment_id"] = context.resolved_experiment_id
    if context.doc_type:
        filters["doc_type"] = context.doc_type
    if context.resolved_step_id and (context.doc_type in {None, "flow"}):
        filters["step_id"] = context.resolved_step_id

    has_kb_signal = any(normalize_text(keyword) in normalized for keyword in STRONG_KB_KEYWORDS)
    has_llm_only_signal = any(normalize_text(keyword) in normalized for keyword in LLM_ONLY_KEYWORDS)
    explicit_no_kb = any(phrase in context.user_query for phrase in ["不需要结合实验", "不用结合实验", "不查知识库", "不用知识库"])
    requires_context = any(normalize_text(keyword) in normalized for keyword in EXPERIMENT_REQUIRED_WORDS) or context.is_followup

    if requires_context and not context.resolved_experiment_id:
        return RouteDecision(
            use_kb=False,
            route="clarify",
            reason="context_required_without_experiment",
            confidence=0.82,
            expected_doc_type=context.doc_type,
            expected_filters=filters,
        )

    if explicit_no_kb:
        return RouteDecision(
            use_kb=False,
            route="llm_only",
            reason="explicit_no_kb",
            confidence=0.94,
            expected_doc_type=None,
            expected_filters={},
        )

    if has_llm_only_signal and not has_kb_signal:
        return RouteDecision(
            use_kb=False,
            route="llm_only",
            reason="llm_only_intent",
            confidence=0.9,
            expected_doc_type=None,
            expected_filters={},
        )

    if has_kb_signal or context.resolved_experiment_id or context.doc_type or context.resolved_step_id:
        return RouteDecision(
            use_kb=True,
            route="kb",
            reason="kb_intent_or_context",
            confidence=0.88 if has_kb_signal else 0.74,
            expected_doc_type=context.doc_type,
            expected_filters=filters,
        )

    return RouteDecision(
        use_kb=False,
        route="llm_only",
        reason="no_kb_signal",
        confidence=0.72,
        expected_doc_type=None,
        expected_filters={},
    )
