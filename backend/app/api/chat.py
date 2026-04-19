from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.chat import ChatRequest, ChatResponse
from app.services.rag_service import query_knowledge_base
from app.services.stream_service import stream_chat_response


router = APIRouter(tags=["chat"])


def build_fake_answer(payload: ChatRequest) -> str:
    message = (payload.message or "").strip()
    scene = (payload.scene or "general").strip() or "general"

    if scene == "principle":
        focus = "我会先从实验现象和科学原理帮你拆解。"
    elif scene == "planning":
        focus = "我会先帮你明确目标、变量、材料和步骤。"
    elif scene == "virtualLab":
        focus = "我会先引导你完成虚拟搭建，再提醒你观察关键现象。"
    elif scene == "dataAnalysis":
        focus = "我会先帮你整理观察记录，再比较不同条件下的变化。"
    elif scene == "experimentSummary":
        focus = "我会先帮你把现象、原因、结论和改进建议整理成报告思路。"
    else:
        focus = "我会先根据你当前的问题给出一个清晰、适合小朋友理解的引导。"

    if message:
        return (
            "这是来自 FastAPI 后端的 Phase 1 假回复，说明前端到后端的链路已经可以打通。\n\n"
            f"我收到的问题是：{message}\n"
            f"当前场景是：{scene}\n\n"
            f"{focus}\n\n"
            "下一阶段接入 RAG 后，我会根据实验流程知识库检索资料，并返回引用来源。"
        )

    return (
        "这是来自 FastAPI 后端的 Phase 1 假回复。"
        "当前接口已经可用，下一步可以接入 RAG 和 Agent。"
    )


def make_chat_response(payload: ChatRequest) -> ChatResponse:
    message = (payload.message or "").strip()
    if message:
        rag_result = query_knowledge_base(
            question=message,
            experiment_id=payload.experiment_id,
            step_id=payload.step_id,
            context_step_id=payload.current_step,
            scene=payload.scene,
            page_context=payload.pageContext,
            top_k=3,
        )
        sources = rag_result.get("sources") or []
        llm_info = (rag_result.get("retrieval") or {}).get("llm") or {}
        if sources:
            return ChatResponse(
                success=True,
                message=rag_result["answer"],
                platform="fastapi-rag-llm" if llm_info.get("used_llm") else "fastapi-rag-local",
                model=llm_info.get("model") or "hybrid-rag-v1",
                scene=payload.scene or "general",
                timestamp=int(datetime.now(timezone.utc).timestamp() * 1000),
                sources=sources,
            )

    return ChatResponse(
        success=True,
        message=build_fake_answer(payload),
        platform="fastapi-fake",
        model="phase-1-fake-model",
        scene=payload.scene or "general",
        timestamp=int(datetime.now(timezone.utc).timestamp() * 1000),
    )


@router.post("/api/ai/chat", response_model=ChatResponse)
def compatible_chat(payload: ChatRequest):
    """Compatible endpoint for the current frontend PROXY_CONFIG.chatPath."""
    return make_chat_response(payload)


@router.post("/api/ai/chat/stream")
def compatible_chat_stream(payload: ChatRequest):
    """SSE endpoint for H5 streaming chat UI."""
    return StreamingResponse(
        stream_chat_response(payload),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/api/v1/chat", response_model=ChatResponse)
def standard_chat(payload: ChatRequest):
    """Standard chat endpoint for later RAG and Agent integration."""
    return make_chat_response(payload)
