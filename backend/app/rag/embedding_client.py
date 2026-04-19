from __future__ import annotations

import hashlib
import json
import math
import urllib.error
import urllib.request
from dataclasses import dataclass
from typing import Iterable

from app.core.config import get_settings
from app.rag.retriever import normalize_text, tokenize


LOCAL_EMBEDDING_DIM = 384

SEMANTIC_GROUPS = [
    ["虚拟操作", "虚拟实验", "虚拟搭建", "拖拽材料", "在线操作", "仿真操作"],
    ["材料", "工具", "清单", "需要什么", "准备什么", "器材"],
    ["原理", "为什么", "原因", "离心", "离心力", "科学概念"],
    ["数据", "记录", "表格", "现象", "分析", "观察结果"],
    ["报告", "总结", "结论", "反思", "改进建议"],
    ["安全", "危险", "风险", "注意事项", "防护"],
    ["步骤", "流程", "怎么做", "如何做", "操作方法", "引导"],
]


@dataclass(frozen=True)
class EmbeddingConfig:
    provider: str
    model: str
    dimension: int


def get_embedding_config() -> EmbeddingConfig:
    settings = get_settings()
    return EmbeddingConfig(
        provider=settings.embedding_provider.lower(),
        model=settings.embedding_model,
        dimension=settings.embedding_dim,
    )


def _stable_index(token: str, dimension: int) -> tuple[int, float]:
    digest = hashlib.sha256(token.encode("utf-8")).digest()
    index = int.from_bytes(digest[:4], "big") % dimension
    sign = 1.0 if digest[4] % 2 == 0 else -1.0
    return index, sign


def _normalize_vector(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        return vector
    return [round(value / norm, 8) for value in vector]


def _semantic_tokens(text: str) -> list[str]:
    normalized = normalize_text(text)
    tokens: list[str] = []
    for group in SEMANTIC_GROUPS:
        if any(normalize_text(word) in normalized for word in group):
            # Put synonymous expressions into one shared feature bucket.
            tokens.extend(f"semantic::{word}" for word in group)
    return tokens


def local_embed(text: str, *, dimension: int = LOCAL_EMBEDDING_DIM) -> list[float]:
    vector = [0.0] * dimension
    tokens = tokenize(text)
    tokens.extend(_semantic_tokens(text))

    for token in tokens:
        index, sign = _stable_index(token, dimension)
        vector[index] += sign

    return _normalize_vector(vector)


def cosine(left: list[float], right: list[float]) -> float:
    if not left or not right or len(left) != len(right):
        return 0.0
    return sum(a * b for a, b in zip(left, right))


class EmbeddingClient:
    def __init__(self, config: EmbeddingConfig | None = None):
        self.config = config or get_embedding_config()

    @property
    def provider(self) -> str:
        return self.config.provider

    @property
    def model(self) -> str:
        return self.config.model

    @property
    def dimension(self) -> int:
        return self.config.dimension

    def embed_texts(self, texts: Iterable[str]) -> list[list[float]]:
        text_list = list(texts)
        if self.provider in {"openai", "openai_compatible", "dashscope"}:
            try:
                return self._embed_openai_compatible_batched(text_list)
            except Exception:
                if not get_settings().embedding_allow_local_fallback:
                    raise
        return [local_embed(text, dimension=self.dimension) for text in text_list]

    def _embed_openai_compatible_batched(self, texts: list[str]) -> list[list[float]]:
        settings = get_settings()
        batch_size = max(1, settings.embedding_batch_size)
        vectors: list[list[float]] = []
        for start in range(0, len(texts), batch_size):
            vectors.extend(self._embed_openai_compatible(texts[start : start + batch_size]))
        return vectors

    def _embed_openai_compatible(self, texts: list[str]) -> list[list[float]]:
        settings = get_settings()
        api_key = settings.embedding_api_key
        base_url = settings.embedding_base_url
        if not api_key or not base_url:
            raise RuntimeError("STEM_EMBEDDING_API_KEY and STEM_EMBEDDING_BASE_URL are required.")

        url = f"{base_url.rstrip('/')}/embeddings"
        body = {"model": self.model, "input": texts}
        if settings.embedding_dim > 0:
            body["dimensions"] = settings.embedding_dim
        payload = json.dumps(body).encode("utf-8")
        request = urllib.request.Request(
            url,
            data=payload,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=settings.embedding_timeout) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"Embedding request failed: HTTP {error.code}; {detail}") from error

        data = body.get("data") or []
        vectors = [item.get("embedding") for item in sorted(data, key=lambda item: item.get("index", 0))]
        if len(vectors) != len(texts) or any(not isinstance(vector, list) for vector in vectors):
            raise RuntimeError("Embedding response shape is invalid.")
        return vectors
