from __future__ import annotations

from dataclasses import asdict, dataclass

from app.rag.retriever import infer_doc_type, infer_step_id, normalize_text


EXPERIMENT_ALIASES = {
    "science-01": [
        "science-01",
        "s01",
        "s-01",
        "科学实验1",
        "科学实验一",
        "科学探究1",
        "科学探究一",
        "实验1",
        "实验一",
        "旋转飞椅",
        "洗衣机甩干",
        "洗衣机为什么能把衣服甩干",
    ],
    "engineering-01": [
        "engineering-01",
        "e01",
        "e-01",
        "工程实验1",
        "工程实验一",
        "工程实践1",
        "工程实践一",
        "手动离心甩干机",
        "手动甩干机",
        "袜子脱水",
        "袜子甩干",
    ],
}

VIRTUAL_OPERATION_KEYWORDS = ["虚拟操作", "虚拟实验", "虚拟搭建", "虚拟仿真", "在线操作", "拖拽材料"]
DATA_ANALYSIS_KEYWORDS = ["数据记录", "记录数据", "数据分析", "分析数据", "现象记录"]
REPORT_KEYWORDS = ["报告", "总结", "结论", "反思"]
CONTEXT_DEPENDENT_KEYWORDS = ["这里", "这个", "这一步", "当前", "现在", "怎么弄", "怎么操作", "下一步"]


@dataclass(frozen=True)
class QueryContext:
    question: str
    experiment_id: str | None
    doc_type: str | None
    step_id: str | None
    context_step_id: str | None
    scene: str | None
    page_context: str | None
    query_type: str
    is_context_dependent: bool
    rewritten_query: str

    def to_dict(self) -> dict:
        return asdict(self)


def resolve_experiment_id(question: str, experiment_id: str | None) -> str | None:
    if experiment_id:
        return experiment_id

    normalized_question = normalize_text(question)
    for target_id, aliases in EXPERIMENT_ALIASES.items():
        if any(normalize_text(alias) in normalized_question for alias in aliases):
            return target_id
    return None


def resolve_step_id(question: str, experiment_id: str | None, step_id: str | None) -> str | None:
    if step_id:
        return step_id

    explicit_step = infer_step_id(question)
    if explicit_step:
        return explicit_step

    normalized_question = normalize_text(question)
    has_virtual_intent = any(normalize_text(keyword) in normalized_question for keyword in VIRTUAL_OPERATION_KEYWORDS)
    has_data_intent = any(normalize_text(keyword) in normalized_question for keyword in DATA_ANALYSIS_KEYWORDS)
    has_report_intent = any(normalize_text(keyword) in normalized_question for keyword in REPORT_KEYWORDS)

    if experiment_id and experiment_id.startswith("science-"):
        if has_virtual_intent:
            return "step8"
        if has_data_intent:
            return "step9"
        if has_report_intent:
            return "step10"

    if experiment_id and experiment_id.startswith("engineering-"):
        if has_virtual_intent:
            return "step6"
        if has_data_intent:
            return "step7"
        if has_report_intent:
            return "step9"

    return None


def resolve_query_type(question: str, doc_type: str | None, step_id: str | None) -> str:
    normalized_question = normalize_text(question)
    if any(normalize_text(keyword) in normalized_question for keyword in REPORT_KEYWORDS):
        return "report"
    if doc_type in {"materials", "safety", "concepts", "qa"}:
        return doc_type
    if doc_type == "flow" and step_id:
        return "operation"
    if doc_type == "flow":
        return "flow"
    return "general"


def is_context_dependent(question: str, doc_type: str | None, step_id: str | None) -> bool:
    if step_id or doc_type in {"materials", "safety", "concepts", "qa"}:
        return False
    normalized_question = normalize_text(question)
    return any(normalize_text(keyword) in normalized_question for keyword in CONTEXT_DEPENDENT_KEYWORDS)


def rewrite_query(question: str, context: QueryContext | None = None) -> str:
    if context is None:
        return question
    parts = [question]
    if context.experiment_id:
        parts.append(context.experiment_id)
    if context.doc_type:
        parts.append(context.doc_type)
    if context.step_id:
        parts.append(context.step_id)
    return " ".join(parts)


def analyze_query(
    *,
    question: str,
    experiment_id: str | None = None,
    doc_type: str | None = None,
    step_id: str | None = None,
    context_step_id: str | None = None,
    scene: str | None = None,
    page_context: str | None = None,
) -> QueryContext:
    resolved_experiment_id = resolve_experiment_id(question, experiment_id)
    inferred_doc_type = infer_doc_type(question)
    resolved_step_id = resolve_step_id(question, resolved_experiment_id, step_id)
    resolved_doc_type = doc_type or inferred_doc_type
    has_report_intent = any(normalize_text(keyword) in normalize_text(question) for keyword in REPORT_KEYWORDS)
    if has_report_intent and not step_id and not infer_step_id(question):
        resolved_step_id = None
    if not resolved_doc_type and has_report_intent:
        resolved_doc_type = "flow"
    if resolved_step_id and not resolved_doc_type:
        resolved_doc_type = "flow"
    query_type = resolve_query_type(question, resolved_doc_type, resolved_step_id)
    context_dependent = is_context_dependent(question, resolved_doc_type, resolved_step_id)

    context = QueryContext(
        question=question,
        experiment_id=resolved_experiment_id,
        doc_type=resolved_doc_type,
        step_id=resolved_step_id,
        context_step_id=context_step_id,
        scene=scene,
        page_context=page_context,
        query_type=query_type,
        is_context_dependent=context_dependent,
        rewritten_query=question,
    )
    return QueryContext(
        **{
            **context.to_dict(),
            "rewritten_query": rewrite_query(question, context),
        }
    )
