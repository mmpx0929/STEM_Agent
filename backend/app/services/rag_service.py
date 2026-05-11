from __future__ import annotations

from typing import Any
from collections.abc import Iterator

from app.rag.context_builder import build_retrieval_debug, build_sources
from app.rag.context_normalizer import normalize_context
from app.rag.kb_router import decide_route
from app.rag.index_manager import get_chunks, get_index_status, rebuild_index
from app.rag.query_analyzer import analyze_query
from app.rag.query_rewriter import rewrite_query
from app.rag.retriever_cache import get_cached_retrieval, get_retriever_bundle, set_cached_retrieval
from app.rag.reranker import rerank_chunks
from app.services.llm_service import LLMResult, stream_rag_answer, synthesize_rag_answer


def query_knowledge_base(
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
    top_k: int = 5,
) -> dict[str, Any]:
    if not get_chunks(auto_rebuild=True):
        rebuild_index()
    normalized = normalize_context(
        question=question,
        experiment_id=experiment_id,
        doc_type=doc_type,
        step_id=step_id,
        context_step_id=context_step_id,
        scene=scene,
        page_context=page_context,
        history=history,
        messages=messages,
    )
    route = decide_route(normalized)
    rewritten = rewrite_query(normalized, route)

    if route.route == "llm_only":
        answer = synthesize_rag_answer(question, [], query_type="general")
        return {
            "answer": answer.answer,
            "sources": [],
            "retrieval": {
                "retriever": "modular_hybrid_rag_v2",
                "route": route.route,
                "matched": 0,
                "normalized_context": normalized.to_dict(),
                "route_decision": route.to_dict(),
                "rewritten_query": rewritten.to_dict(),
                "llm": {"used_llm": answer.used_llm, "provider": answer.provider, "model": answer.model},
            },
        }

    if route.route == "clarify":
        return {
            "answer": "我需要先确认你说的是哪一个实验。请告诉我实验名称或从当前实验页面重新提问。",
            "sources": [],
            "retrieval": {
                "retriever": "modular_hybrid_rag_v2",
                "route": route.route,
                "matched": 0,
                "normalized_context": normalized.to_dict(),
                "route_decision": route.to_dict(),
                "rewritten_query": rewritten.to_dict(),
                "llm": {"used_llm": False, "provider": "local", "model": "clarify"},
            },
        }

    query_context = analyze_query(
        question=rewritten.retrieval_query,
        experiment_id=rewritten.filters.get("experiment_id"),
        doc_type=rewritten.filters.get("doc_type"),
        step_id=rewritten.filters.get("step_id"),
        context_step_id=normalized.current_step_id,
        scene=normalized.scene,
        page_context=normalized.page_context_summary,
    )

    bundle = get_retriever_bundle()
    cached = get_cached_retrieval(
        fingerprint=bundle.fingerprint,
        retrieval_query=rewritten.retrieval_query,
        filters=rewritten.filters,
        top_k=top_k,
    )
    query_cache_hit = cached is not None
    if cached is None:
        retrieval = bundle.hybrid_retriever.retrieve(query_context, top_k=top_k)
        if not retrieval["fused_results"] and rewritten.filters.get("step_id"):
            fallback_context = analyze_query(
                question=rewritten.retrieval_query,
                experiment_id=rewritten.filters.get("experiment_id"),
                doc_type=rewritten.filters.get("doc_type"),
                step_id=None,
                context_step_id=normalized.current_step_id,
                scene=normalized.scene,
                page_context=normalized.page_context_summary,
            )
            retrieval = bundle.hybrid_retriever.retrieve(fallback_context, top_k=top_k)
        retrieved = rerank_chunks(
            rewritten.retrieval_query,
            retrieval["fused_results"],
            top_k=top_k,
            doc_type=query_context.doc_type,
            step_id=query_context.step_id,
            context_step_id=query_context.context_step_id,
        )
        cached = {
            "vector_results": retrieval["vector_results"],
            "sparse_results": retrieval["sparse_results"],
            "fused_results": retrieval["fused_results"],
            "retrieved": retrieved,
        }
        set_cached_retrieval(
            fingerprint=bundle.fingerprint,
            retrieval_query=rewritten.retrieval_query,
            filters=rewritten.filters,
            top_k=top_k,
            value=cached,
        )
    retrieved = cached["retrieved"]
    llm_result = synthesize_rag_answer(
        question,
        retrieved,
        query_type=query_context.query_type,
    )
    sources = build_sources(retrieved)

    result = {
        "answer": llm_result.answer,
        "sources": sources,
        "retrieval": build_retrieval_debug(
            context=query_context,
            vector_count=len(cached["vector_results"]),
            sparse_count=len(cached["sparse_results"]),
            fused_count=len(cached["fused_results"]),
            reranked_count=len(retrieved),
            top_k=top_k,
            total_chunks=len(bundle.chunks),
            llm_result=llm_result,
        )
    }
    result["retrieval"].update(
        {
            "retriever": "modular_hybrid_rag_v2",
            "route": route.route,
            "normalized_context": normalized.to_dict(),
            "route_decision": route.to_dict(),
            "rewritten_query": rewritten.to_dict(),
            "cache": {
                "retriever_cache_hit": bundle.cache_hit,
                "query_cache_hit": query_cache_hit,
                "fingerprint": bundle.fingerprint,
            },
        }
    )
    return result


def prepare_rag_generation(
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
    top_k: int = 5,
) -> dict[str, Any]:
    result = query_knowledge_base(
        question=question,
        experiment_id=experiment_id,
        doc_type=doc_type,
        step_id=step_id,
        context_step_id=context_step_id,
        scene=scene,
        page_context=page_context,
        history=history,
        messages=messages,
        top_k=top_k,
    )
    return result


def prepare_retrieval_for_generation(
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
    top_k: int = 5,
) -> dict[str, Any]:
    if not get_chunks(auto_rebuild=True):
        rebuild_index()
    normalized = normalize_context(
        question=question,
        experiment_id=experiment_id,
        doc_type=doc_type,
        step_id=step_id,
        context_step_id=context_step_id,
        scene=scene,
        page_context=page_context,
        history=history,
        messages=messages,
    )
    route = decide_route(normalized)
    rewritten = rewrite_query(normalized, route)
    if route.route != "kb":
        return {
            "route": route.route,
            "retrieved": [],
            "sources": [],
            "retrieval": {
                "retriever": "modular_hybrid_rag_v2",
                "route": route.route,
                "matched": 0,
                "normalized_context": normalized.to_dict(),
                "route_decision": route.to_dict(),
                "rewritten_query": rewritten.to_dict(),
            },
        }

    query_context = analyze_query(
        question=rewritten.retrieval_query,
        experiment_id=rewritten.filters.get("experiment_id"),
        doc_type=rewritten.filters.get("doc_type"),
        step_id=rewritten.filters.get("step_id"),
        context_step_id=normalized.current_step_id,
        scene=normalized.scene,
        page_context=normalized.page_context_summary,
    )
    bundle = get_retriever_bundle()
    cached = get_cached_retrieval(
        fingerprint=bundle.fingerprint,
        retrieval_query=rewritten.retrieval_query,
        filters=rewritten.filters,
        top_k=top_k,
    )
    query_cache_hit = cached is not None
    if cached is None:
        retrieval = bundle.hybrid_retriever.retrieve(query_context, top_k=top_k)
        if not retrieval["fused_results"] and rewritten.filters.get("step_id"):
            fallback_context = analyze_query(
                question=rewritten.retrieval_query,
                experiment_id=rewritten.filters.get("experiment_id"),
                doc_type=rewritten.filters.get("doc_type"),
                step_id=None,
                context_step_id=normalized.current_step_id,
                scene=normalized.scene,
                page_context=normalized.page_context_summary,
            )
            retrieval = bundle.hybrid_retriever.retrieve(fallback_context, top_k=top_k)
        retrieved = rerank_chunks(
            rewritten.retrieval_query,
            retrieval["fused_results"],
            top_k=top_k,
            doc_type=query_context.doc_type,
            step_id=query_context.step_id,
            context_step_id=query_context.context_step_id,
        )
        cached = {
            "vector_results": retrieval["vector_results"],
            "sparse_results": retrieval["sparse_results"],
            "fused_results": retrieval["fused_results"],
            "retrieved": retrieved,
        }
        set_cached_retrieval(
            fingerprint=bundle.fingerprint,
            retrieval_query=rewritten.retrieval_query,
            filters=rewritten.filters,
            top_k=top_k,
            value=cached,
        )

    class _StreamLLMInfo:
        used_llm = False
        provider = "pending"
        model = "stream"

    retrieved = cached["retrieved"]
    retrieval_debug = build_retrieval_debug(
        context=query_context,
        vector_count=len(cached["vector_results"]),
        sparse_count=len(cached["sparse_results"]),
        fused_count=len(cached["fused_results"]),
        reranked_count=len(retrieved),
        top_k=top_k,
        total_chunks=len(bundle.chunks),
        llm_result=_StreamLLMInfo(),
    )
    retrieval_debug.update(
        {
            "retriever": "modular_hybrid_rag_v2",
            "route": route.route,
            "normalized_context": normalized.to_dict(),
            "route_decision": route.to_dict(),
            "rewritten_query": rewritten.to_dict(),
            "cache": {
                "retriever_cache_hit": bundle.cache_hit,
                "query_cache_hit": query_cache_hit,
                "fingerprint": bundle.fingerprint,
            },
        }
    )
    return {
        "route": route.route,
        "retrieved": retrieved,
        "sources": build_sources(retrieved),
        "retrieval": retrieval_debug,
    }


def stream_query_knowledge_base(
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
    top_k: int = 5,
) -> Iterator[dict[str, Any]]:
    result = prepare_retrieval_for_generation(
        question=question,
        experiment_id=experiment_id,
        doc_type=doc_type,
        step_id=step_id,
        context_step_id=context_step_id,
        scene=scene,
        page_context=page_context,
        history=history,
        messages=messages,
        top_k=top_k,
    )
    retrieval = result.get("retrieval") or {}
    route = result.get("route") or retrieval.get("route")
    yield {"event": "metadata", "data": {"retrieval": retrieval, "sources": result.get("sources") or []}}

    if route == "clarify":
        answer = "我需要先确认你说的是哪一个实验。请告诉我实验名称或从当前实验页面重新提问。"
        for index in range(0, len(answer), 8):
            yield {"event": "token", "data": {"content": answer[index : index + 8]}}
        yield {"event": "done", "data": {"answer": answer, "llm": {"used_llm": False, "provider": "local", "model": "clarify"}}}
        return
    retrieved = result.get("retrieved") or []

    query_type = (retrieval.get("query") or {}).get("type")
    final_info: LLMResult | None = None
    final_answer = []
    for token, info in stream_rag_answer(question, retrieved, query_type=query_type):
        if info is not None:
            final_info = info
            continue
        final_answer.append(token)
        yield {"event": "token", "data": {"content": token}}
    llm = {
        "used_llm": final_info.used_llm if final_info else False,
        "provider": final_info.provider if final_info else "local",
        "model": final_info.model if final_info else "unknown",
    }
    yield {"event": "done", "data": {"answer": "".join(final_answer), "llm": llm}}


__all__ = ["get_index_status", "query_knowledge_base", "rebuild_index", "stream_query_knowledge_base"]
