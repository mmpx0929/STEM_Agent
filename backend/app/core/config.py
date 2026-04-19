from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _env(name: str, default: str = "") -> str:
    return os.getenv(name, default).strip()


def _env_int(name: str, default: int) -> int:
    raw = _env(name)
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    raw = _env(name)
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _env_bool(name: str, default: bool) -> bool:
    raw = _env(name)
    if not raw:
        return default
    return raw.lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    backend_dir: Path
    knowledge_base_dir: Path
    index_dir: Path
    chunks_path: Path
    vectors_path: Path
    sparse_index_path: Path
    index_metadata_path: Path

    vector_backend: str
    vector_allow_local_fallback: bool
    sparse_backend: str
    fusion_strategy: str
    rrf_k: int
    default_top_k: int
    candidate_multiplier: int
    min_candidate_k: int

    embedding_provider: str
    embedding_base_url: str
    embedding_api_key: str
    embedding_model: str
    embedding_dim: int
    embedding_batch_size: int
    embedding_timeout: float
    embedding_allow_local_fallback: bool

    llm_provider: str
    llm_base_url: str
    llm_api_key: str
    llm_model: str
    llm_temperature: float
    llm_max_tokens: int
    llm_timeout: float
    llm_allow_local_fallback: bool

    reranker_provider: str
    reranker_base_url: str
    reranker_api_key: str
    reranker_model: str
    reranker_top_n: int
    reranker_timeout: float
    reranker_allow_local_fallback: bool


def get_settings() -> Settings:
    backend_dir = Path(__file__).resolve().parents[2]
    knowledge_base_dir = backend_dir / "knowledge_base"
    index_dir = knowledge_base_dir / "index"
    return Settings(
        backend_dir=backend_dir,
        knowledge_base_dir=knowledge_base_dir,
        index_dir=index_dir,
        chunks_path=index_dir / "chunks.jsonl",
        vectors_path=index_dir / "vectors.jsonl",
        sparse_index_path=index_dir / "bm25.json",
        index_metadata_path=index_dir / "metadata.json",
        vector_backend=_env("STEM_VECTOR_BACKEND", "faiss"),
        vector_allow_local_fallback=_env_bool("STEM_VECTOR_ALLOW_LOCAL_FALLBACK", True),
        sparse_backend=_env("STEM_SPARSE_BACKEND", "bm25"),
        fusion_strategy=_env("STEM_FUSION_STRATEGY", "rrf"),
        rrf_k=_env_int("STEM_RRF_K", 60),
        default_top_k=_env_int("STEM_RAG_TOP_K", 5),
        candidate_multiplier=_env_int("STEM_RAG_CANDIDATE_MULTIPLIER", 6),
        min_candidate_k=_env_int("STEM_RAG_MIN_CANDIDATE_K", 18),
        embedding_provider=_env("STEM_EMBEDDING_PROVIDER", "local"),
        embedding_base_url=_env("STEM_EMBEDDING_BASE_URL"),
        embedding_api_key=_env("STEM_EMBEDDING_API_KEY"),
        embedding_model=_env("STEM_EMBEDDING_MODEL", "local-feature-hash-v1"),
        embedding_dim=_env_int("STEM_EMBEDDING_DIM", 384),
        embedding_batch_size=_env_int("STEM_EMBEDDING_BATCH_SIZE", 10),
        embedding_timeout=_env_float("STEM_EMBEDDING_TIMEOUT", 30.0),
        embedding_allow_local_fallback=_env_bool("STEM_EMBEDDING_ALLOW_LOCAL_FALLBACK", True),
        llm_provider=_env("STEM_LLM_PROVIDER", "openai_compatible"),
        llm_base_url=_env("STEM_LLM_BASE_URL"),
        llm_api_key=_env("STEM_LLM_API_KEY"),
        llm_model=_env("STEM_LLM_MODEL", "qwen-turbo"),
        llm_temperature=_env_float("STEM_LLM_TEMPERATURE", 0.3),
        llm_max_tokens=_env_int("STEM_LLM_MAX_TOKENS", 700),
        llm_timeout=_env_float("STEM_LLM_TIMEOUT", 45.0),
        llm_allow_local_fallback=_env_bool("STEM_LLM_ALLOW_LOCAL_FALLBACK", True),
        reranker_provider=_env("STEM_RERANKER_PROVIDER", "local"),
        reranker_base_url=_env("STEM_RERANKER_BASE_URL"),
        reranker_api_key=_env("STEM_RERANKER_API_KEY"),
        reranker_model=_env("STEM_RERANKER_MODEL", "qwen-plus"),
        reranker_top_n=_env_int("STEM_RERANKER_TOP_N", 20),
        reranker_timeout=_env_float("STEM_RERANKER_TIMEOUT", 45.0),
        reranker_allow_local_fallback=_env_bool("STEM_RERANKER_ALLOW_LOCAL_FALLBACK", True),
    )
