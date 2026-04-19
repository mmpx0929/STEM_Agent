from __future__ import annotations

import json
from pathlib import Path

from app.rag.embedding_client import EmbeddingClient
from app.rag.retriever import RetrievedChunk
from app.rag.splitter import Chunk
from app.rag.vector_store import chunk_embedding_text, read_vectors, write_vectors


FAISS_INDEX_SUFFIX = ".faiss"
FAISS_META_SUFFIX = ".faiss.meta.json"


class FaissVectorStore:
    def __init__(self, chunks: list[Chunk], client: EmbeddingClient | None = None):
        self.chunks = chunks
        self.client = client or EmbeddingClient()
        try:
            import faiss  # type: ignore
            import numpy as np  # type: ignore
        except ImportError as error:
            raise RuntimeError(
                "FAISS backend requires faiss and numpy. Install a compatible faiss-cpu package "
                "or set STEM_VECTOR_BACKEND=local_jsonl."
            ) from error
        self.faiss = faiss
        self.np = np
        self.index = None
        self.chunk_ids: list[str] = []
        self.chunk_map = {chunk.chunk_id: chunk for chunk in chunks}

    @classmethod
    def load_or_build(cls, path: Path, chunks: list[Chunk], client: EmbeddingClient | None = None) -> "FaissVectorStore":
        store = cls(chunks, client)
        index_path = Path(str(path) + FAISS_INDEX_SUFFIX)
        meta_path = Path(str(path) + FAISS_META_SUFFIX)
        expected_ids = [chunk.chunk_id for chunk in chunks]

        if index_path.exists() and meta_path.exists():
            metadata = json.loads(meta_path.read_text(encoding="utf-8"))
            if (
                metadata.get("chunk_ids") == expected_ids
                and metadata.get("provider") == store.client.provider
                and metadata.get("model") == store.client.model
            ):
                store.index = store.faiss.read_index(str(index_path))
                store.chunk_ids = expected_ids
                return store

        vectors = read_vectors(path, chunks, store.client)
        if not vectors:
            texts = [chunk_embedding_text(chunk) for chunk in chunks]
            embedded = store.client.embed_texts(texts)
            vectors = {chunk.chunk_id: vector for chunk, vector in zip(chunks, embedded)}
            write_vectors(path, chunks, embedded, store.client)

        matrix = store.np.array([vectors[chunk.chunk_id] for chunk in chunks], dtype="float32")
        if matrix.ndim != 2 or matrix.shape[0] == 0:
            raise RuntimeError("FAISS vector matrix is empty or invalid.")
        store.index = store.faiss.IndexFlatIP(matrix.shape[1])
        store.index.add(matrix)
        store.chunk_ids = expected_ids
        store.faiss.write_index(store.index, str(index_path))
        meta_path.write_text(
            json.dumps(
                {
                    "chunk_ids": expected_ids,
                    "provider": store.client.provider,
                    "model": store.client.model,
                    "dimension": int(matrix.shape[1]),
                },
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )
        return store

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
        if self.index is None:
            return []

        query_vector = self.np.array(self.client.embed_texts([question]), dtype="float32")
        search_k = min(max(top_k * 4, top_k), len(self.chunk_ids))
        scores, indices = self.index.search(query_vector, search_k)
        results: list[RetrievedChunk] = []

        for score, index in zip(scores[0], indices[0]):
            if index < 0:
                continue
            chunk = self.chunk_map[self.chunk_ids[int(index)]]
            if experiment_id and chunk.experiment_id != experiment_id:
                continue
            if doc_type and chunk.doc_type != doc_type:
                continue
            if step_id and chunk.step_id != step_id:
                continue
            adjusted_score = float(score)
            if experiment_id and chunk.experiment_id == experiment_id:
                adjusted_score += 0.04
            if doc_type and chunk.doc_type == doc_type:
                adjusted_score += 0.06
            if context_step_id and chunk.step_id == context_step_id:
                adjusted_score += 0.08
            results.append(RetrievedChunk(chunk=chunk, score=round(adjusted_score, 6)))
            if len(results) >= top_k:
                break

        return results
