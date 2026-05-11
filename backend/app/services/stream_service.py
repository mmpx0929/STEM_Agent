from __future__ import annotations

import json
import time
from collections.abc import Iterator
from datetime import datetime, timezone
from typing import Any

from app.schemas.chat import ChatRequest
from app.services.rag_service import stream_query_knowledge_base


def _sse(event: str, data: dict[str, Any]) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


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
            "stage": "normalize",
            "message": "正在理解问题和页面上下文",
            "timestamp": timestamp,
        },
    )

    yield _sse(
        "status",
        {
            "stage": "retrieval",
            "message": "正在检索实验知识库或判断是否需要检索",
            "timestamp": timestamp,
        },
    )

    sources: list[dict[str, Any]] = []
    retrieval: dict[str, Any] = {}
    answer_parts: list[str] = []
    llm_info: dict[str, Any] = {}
    for item in stream_query_knowledge_base(
        question=message,
        experiment_id=payload.experiment_id,
        step_id=payload.step_id,
        context_step_id=payload.current_step,
        scene=scene,
        page_context=payload.pageContext,
        history=payload.history,
        messages=payload.messages,
        top_k=3,
    ):
        event = item["event"]
        data = item["data"]
        if event == "metadata":
            retrieval = data.get("retrieval") or {}
            sources = data.get("sources") or []
            yield _sse(
                "metadata",
                {
                    "success": True,
                    "platform": "fastapi-rag-stream",
                    "model": "pending",
                    "scene": scene,
                    "retrieval": retrieval,
                    "timestamp": timestamp,
                },
            )
            yield _sse("status", {"stage": "generation", "message": "正在生成回答", "timestamp": timestamp})
        elif event == "token":
            content = data.get("content") or ""
            answer_parts.append(content)
            yield _sse("token", {"content": content})
            time.sleep(0.001)
        elif event == "done":
            llm_info = data.get("llm") or {}

    answer = "".join(answer_parts)
    platform = "fastapi-rag-llm" if llm_info.get("used_llm") else "fastapi-rag-local"
    model = llm_info.get("model") or "hybrid-rag-v1"
    yield _sse("sources", {"sources": sources})
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
