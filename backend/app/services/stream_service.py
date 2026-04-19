from __future__ import annotations

import json
import time
from collections.abc import Iterator
from datetime import datetime, timezone
from typing import Any

from app.schemas.chat import ChatRequest
from app.services.rag_service import query_knowledge_base


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _chunks(text: str, size: int = 8) -> Iterator[str]:
    clean = text or ""
    for index in range(0, len(clean), size):
        yield clean[index : index + size]


def stream_chat_response(payload: ChatRequest) -> Iterator[str]:
    message = (payload.message or "").strip()
    scene = payload.scene or "general"
    timestamp = int(datetime.now(timezone.utc).timestamp() * 1000)

    if not message:
        yield _sse(
            "error",
            {
                "success": False,
                "error": "消息内容不能为空",
                "timestamp": timestamp,
            },
        )
        yield _sse("done", {"success": False, "timestamp": timestamp})
        return

    yield _sse(
        "status",
        {
            "stage": "retrieval",
            "message": "正在检索实验知识库",
            "timestamp": timestamp,
        },
    )

    rag_result = query_knowledge_base(
        question=message,
        experiment_id=payload.experiment_id,
        step_id=payload.step_id,
        context_step_id=payload.current_step,
        scene=scene,
        page_context=payload.pageContext,
        top_k=3,
    )
    sources = rag_result.get("sources") or []
    retrieval = rag_result.get("retrieval") or {}
    llm_info = retrieval.get("llm") or {}
    platform = "fastapi-rag-llm" if llm_info.get("used_llm") else "fastapi-rag-local"
    model = llm_info.get("model") or "hybrid-rag-v1"
    answer = rag_result.get("answer") or ""

    yield _sse(
        "metadata",
        {
            "success": True,
            "platform": platform,
            "model": model,
            "scene": scene,
            "retrieval": retrieval,
            "timestamp": timestamp,
        },
    )

    for token in _chunks(answer):
        yield _sse("token", {"content": token})
        time.sleep(0.015)

    yield _sse(
        "sources",
        {
            "sources": sources,
        },
    )
    yield _sse(
        "done",
        {
            "success": True,
            "message": answer,
            "platform": platform,
            "model": model,
            "scene": scene,
            "sources": sources,
            "retrieval": retrieval,
            "timestamp": timestamp,
        },
    )
