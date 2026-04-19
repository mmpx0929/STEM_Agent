from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from app.core.config import get_settings
from app.rag.embedding_client import EmbeddingClient, cosine
from app.rag.retriever import RetrievedChunk
from app.rag.splitter import Chunk


def chunk_embedding_text(chunk: Chunk) -> str:
    metadata = " ".join(
        value
        for value in [
            chunk.experiment_id,
            chunk.experiment_type,
            chunk.experiment_title,
            chunk.doc_type,
            chunk.step_id or "",
            chunk.title,
        ]
        if value
    )
    return f"{metadata}\n\n{chunk.text}"


def write_vectors(path: Path, chunks: list[Chunk], vectors: list[list[float]], client: EmbeddingClient) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        for chunk, vector in zip(chunks, vectors):
            row = {
                "chunk_id": chunk.chunk_id,
                "provider": client.provider,
                "model": client.model,
                "dimension": len(vector),
                "embedding": vector,
            }
            file.write(json.dumps(row, ensure_ascii=False) + "\n")


def read_vectors(path: Path, chunks: list[Chunk], client: EmbeddingClient) -> dict[str, list[float]]:
    if not path.exists():
        return {}

    expected_ids = {chunk.chunk_id for chunk in chunks}
    vectors: dict[str, list[float]] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        chunk_id = str(row.get("chunk_id") or "")
        vector = row.get("embedding")
        if (
            chunk_id in expected_ids
            and row.get("provider") == client.provider
            and row.get("model") == client.model
            and isinstance(vector, list)
        ):
            vectors[chunk_id] = [float(value) for value in vector]

    if set(vectors) != expected_ids:
        return {}
    return vectors


def build_vector_index(path: Path, chunks: list[Chunk], client: EmbeddingClient | None = None) -> dict[str, list[float]]:
    embedding_client = client or EmbeddingClient()
    texts = [chunk_embedding_text(chunk) for chunk in chunks]
    vectors = embedding_client.embed_texts(texts)
    write_vectors(path, chunks, vectors, embedding_client)
    return {chunk.chunk_id: vector for chunk, vector in zip(chunks, vectors)}


class VectorStore:
    def __init__(self, chunks: Iterable[Chunk], vectors: dict[str, list[float]], client: EmbeddingClient | None = None):
        self.chunks = list(chunks)
        self.vectors = vectors
        self.client = client or EmbeddingClient()

    @classmethod
    def load_or_build(cls, path: Path, chunks: list[Chunk], client: EmbeddingClient | None = None) -> "VectorStore":
        settings = get_settings()
        if settings.vector_backend == "faiss":
            try:
                from app.rag.faiss_vector_store import FaissVectorStore

                return FaissVectorStore.load_or_build(path, chunks, client)  # type: ignore[return-value]
            except Exception:
                if not settings.vector_allow_local_fallback:
                    raise

        embedding_client = client or EmbeddingClient()
        vectors = read_vectors(path, chunks, embedding_client)
        if not vectors:
            vectors = build_vector_index(path, chunks, embedding_client)
        return cls(chunks, vectors, embedding_client)

    def search(
        self,
        question: str,
        *,
        experiment_id: str | None = None,
        doc_type: str | None = None,
        step_id: str | None = None,
        context_step_id: str | None = None,
        top_k: int = 20,
    ) -> list[RetrievedChunk]:
        query_vector = self.client.embed_texts([question])[0]
        results: list[RetrievedChunk] = []

        for chunk in self.chunks:
            if experiment_id and chunk.experiment_id != experiment_id:
                continue
            if doc_type and chunk.doc_type != doc_type:
                continue
            if step_id and chunk.step_id != step_id:
                continue

            score = cosine(query_vector, self.vectors.get(chunk.chunk_id, []))
            if experiment_id and chunk.experiment_id == experiment_id:
                score += 0.04
            if doc_type and chunk.doc_type == doc_type:
                score += 0.06
            if context_step_id and chunk.step_id == context_step_id:
                score += 0.08

            if score > 0:
                results.append(RetrievedChunk(chunk=chunk, score=round(score, 6)))

        results.sort(key=lambda item: item.score, reverse=True)
        return results[: max(1, min(top_k, 50))]
