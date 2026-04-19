from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass

from app.core.config import get_settings
from app.rag.prompt_templates import build_system_prompt
from app.rag.retriever import RetrievedChunk


@dataclass(frozen=True)
class LLMResult:
    answer: str
    model: str
    provider: str
    used_llm: bool


def compact_text(text: str, limit: int = 520) -> str:
    clean = " ".join(line.strip() for line in text.splitlines() if line.strip())
    if len(clean) <= limit:
        return clean
    return clean[:limit].rstrip() + "..."


def build_context(retrieved: list[RetrievedChunk]) -> str:
    lines: list[str] = []
    for index, item in enumerate(retrieved, start=1):
        chunk = item.chunk
        step = f"，步骤：{chunk.step_id}" if chunk.step_id else ""
        lines.append(
            f"[{index}] 实验：{chunk.experiment_id}，文档：{chunk.doc_type}{step}，标题：{chunk.title}\n"
            f"{compact_text(chunk.text)}"
        )
    return "\n\n".join(lines)


def build_local_answer(question: str, retrieved: list[RetrievedChunk], *, query_type: str | None = None) -> str:
    if not retrieved:
        return "我在当前知识库中还没有检索到足够相关的内容。可以换一种问法，或先补充对应实验的知识库文档。"

    first = retrieved[0].chunk
    type_label = {
        "operation": "操作步骤",
        "materials": "材料准备",
        "concepts": "原理解释",
        "safety": "安全提醒",
        "report": "报告写作",
    }.get(query_type or "", "知识库")
    lines = [
        f"我根据知识库按“{type_label}”场景整理成下面的回答：",
        "",
    ]

    if first.step_id:
        lines.append(f"这个问题主要关联 `{first.experiment_id}` 的 `{first.step_id}`。")
    else:
        lines.append(f"这个问题主要关联 `{first.experiment_id}` 的 `{first.doc_type}` 文档。")

    lines.append("")
    for index, item in enumerate(retrieved, start=1):
        chunk = item.chunk
        step = f" / {chunk.step_id}" if chunk.step_id else ""
        lines.append(f"{index}. {chunk.title}（{chunk.doc_type}{step}）：{compact_text(chunk.text, 260)}")

    lines.extend(
        [
            "",
            "如果你是在课堂操作中使用，可以先按最相关的第一条完成当前任务，再根据后面的来源补充材料、原理或记录要求。",
        ]
    )
    return "\n".join(lines)


def synthesize_rag_answer(
    question: str,
    retrieved: list[RetrievedChunk],
    *,
    query_type: str | None = None,
) -> LLMResult:
    settings = get_settings()
    api_key = settings.llm_api_key
    base_url = settings.llm_base_url
    model = settings.llm_model
    provider = settings.llm_provider

    if not api_key or not base_url:
        return LLMResult(
            answer=build_local_answer(question, retrieved, query_type=query_type),
            model="local-synthesis-v1",
            provider="local",
            used_llm=False,
        )

    context = build_context(retrieved)
    messages = [
        {
            "role": "system",
            "content": build_system_prompt(query_type),
        },
        {
            "role": "user",
            "content": f"用户问题：{question}\n\n知识库上下文：\n{context}",
        },
    ]
    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": settings.llm_temperature,
            "max_tokens": settings.llm_max_tokens,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=settings.llm_timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="ignore")
        if settings.llm_allow_local_fallback:
            return LLMResult(
                answer=build_local_answer(question, retrieved, query_type=query_type),
                model="local-synthesis-v1",
                provider="local",
                used_llm=False,
            )
        raise RuntimeError(f"LLM request failed: HTTP {error.code}; {detail}") from error

    content = (
        body.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
    if not content:
        content = build_local_answer(question, retrieved, query_type=query_type)
        return LLMResult(answer=content, model="local-synthesis-v1", provider="local", used_llm=False)

    return LLMResult(answer=content, model=model, provider=provider, used_llm=True)
