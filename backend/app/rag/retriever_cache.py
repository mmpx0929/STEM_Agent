from __future__ import annotations

import hashlib
import json
import time
from collections import OrderedDict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.core.config import get_settings
from app.rag.hybrid_retriever import HybridRetriever
from app.rag.index_manager import read_chunks
from app.rag.retriever import RetrievedChunk


@dataclass
class RetrieverBundle:
    fingerprint: str
    chunks: list
    hybrid_retriever: HybridRetriever
    created_at: float
    cache_hit: bool


_bundle: RetrieverBundle | None = None
_query_cache: OrderedDict[str, tuple[float, dict[str, list[RetrievedChunk]]]] = OrderedDict()
_QUERY_CACHE_TTL = 600
_QUERY_CACHE_MAX = 128


def _file_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"path": str(path), "exists": False}
    stat = path.stat()
    return {"path": str(path), "exists": True, "mtime": stat.st_mtime, "size": stat.st_size}


def current_index_fingerprint() -> str:
    settings = get_settings()
    metadata = {}
    if settings.index_metadata_path.exists():
        try:
            metadata = json.loads(settings.index_metadata_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            metadata = {}
    payload = {
        "chunks": _file_state(settings.chunks_path),
        "vectors": _file_state(settings.vectors_path),
        "sparse": _file_state(settings.sparse_index_path),
        "metadata": _file_state(settings.index_metadata_path),
        "chunk_count": metadata.get("chunk_count"),
        "vector_backend": settings.vector_backend,
        "sparse_backend": settings.sparse_backend,
        "embedding_model": settings.embedding_model,
        "reranker_provider": settings.reranker_provider,
        "reranker_model": settings.reranker_model,
    }
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


def invalidate_retriever_cache() -> None:
    global _bundle
    _bundle = None
    _query_cache.clear()


def get_retriever_bundle() -> RetrieverBundle:
    global _bundle
    fingerprint = current_index_fingerprint()
    if _bundle and _bundle.fingerprint == fingerprint:
        _bundle.cache_hit = True
        return _bundle
    chunks = read_chunks()
    _bundle = RetrieverBundle(
        fingerprint=fingerprint,
        chunks=chunks,
        hybrid_retriever=HybridRetriever(chunks),
        created_at=time.time(),
        cache_hit=False,
    )
    return _bundle


def _query_cache_key(*, fingerprint: str, retrieval_query: str, filters: dict[str, str], top_k: int) -> str:
    payload = {"fingerprint": fingerprint, "query": retrieval_query, "filters": filters, "top_k": top_k}
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode("utf-8")).hexdigest()


def get_cached_retrieval(*, fingerprint: str, retrieval_query: str, filters: dict[str, str], top_k: int) -> dict[str, list[RetrievedChunk]] | None:
    key = _query_cache_key(fingerprint=fingerprint, retrieval_query=retrieval_query, filters=filters, top_k=top_k)
    item = _query_cache.get(key)
    if not item:
        return None
    created_at, value = item
    if time.time() - created_at > _QUERY_CACHE_TTL:
        _query_cache.pop(key, None)
        return None
    _query_cache.move_to_end(key)
    return value


def set_cached_retrieval(
    *,
    fingerprint: str,
    retrieval_query: str,
    filters: dict[str, str],
    top_k: int,
    value: dict[str, list[RetrievedChunk]],
) -> None:
    key = _query_cache_key(fingerprint=fingerprint, retrieval_query=retrieval_query, filters=filters, top_k=top_k)
    _query_cache[key] = (time.time(), value)
    _query_cache.move_to_end(key)
    while len(_query_cache) > _QUERY_CACHE_MAX:
        _query_cache.popitem(last=False)
