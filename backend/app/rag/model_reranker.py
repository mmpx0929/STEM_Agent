from __future__ import annotations

import json
import re
import urllib.error
import urllib.request

from app.core.config import get_settings
from app.rag.retriever import RetrievedChunk


def _compact(text: str, limit: int = 260) -> str:
    clean = " ".join(line.strip() for line in text.splitlines() if line.strip())
    if len(clean) <= limit:
        return clean
    return clean[:limit].rstrip() + "..."


def _extract_json_array(text: str) -> list[str]:
    match = re.search(r"\[[\s\S]*\]", text)
    if not match:
        return []
    try:
        value = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []
    if not isinstance(value, list):
        return []
    return [str(item) for item in value]


def model_rerank(question: str, candidates: list[RetrievedChunk], *, top_k: int) -> list[RetrievedChunk]:
    settings = get_settings()
    if settings.reranker_provider not in {"llm", "openai_compatible", "dashscope"}:
        raise RuntimeError("Model reranker is disabled.")
    api_key = settings.reranker_api_key or settings.llm_api_key
    base_url = settings.reranker_base_url or settings.llm_base_url
    model = settings.reranker_model
    if not api_key or not base_url:
        raise RuntimeError("Reranker API key/base URL is missing.")

    limited = candidates[: max(top_k, min(settings.reranker_top_n, len(candidates)))]
    candidate_lines = []
    for item in limited:
        chunk = item.chunk
        candidate_lines.append(
            f"- chunk_id: {chunk.chunk_id}\n"
            f"  metadata: experiment={chunk.experiment_id}, doc_type={chunk.doc_type}, step={chunk.step_id}, title={chunk.title}\n"
            f"  text: {_compact(chunk.text)}"
        )

    messages = [
        {
            "role": "system",
            "content": (
                "你是 RAG 检索结果重排器。只根据用户问题和候选 chunk 判断相关性。"
                "返回 JSON 数组，元素必须是 chunk_id，按相关性从高到低排序。不要输出解释。"
            ),
        },
        {
            "role": "user",
            "content": f"用户问题：{question}\n\n候选 chunks：\n" + "\n".join(candidate_lines),
        },
    ]
    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": 0,
            "max_tokens": 300,
        },
        ensure_ascii=False,
    ).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}/chat/completions",
        data=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=settings.reranker_timeout) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Reranker request failed: HTTP {error.code}; {detail}") from error

    content = (
        body.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
    ordered_ids = _extract_json_array(content)
    by_id = {item.chunk.chunk_id: item for item in limited}
    ordered = [by_id[chunk_id] for chunk_id in ordered_ids if chunk_id in by_id]
    seen = {item.chunk.chunk_id for item in ordered}
    ordered.extend(item for item in limited if item.chunk.chunk_id not in seen)
    return ordered[:top_k]
