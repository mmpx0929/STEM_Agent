from __future__ import annotations

import json
import math
from collections import Counter
from pathlib import Path
from typing import Iterable

from app.rag.retriever import RetrievedChunk, tokenize
from app.rag.splitter import Chunk


def sparse_text(chunk: Chunk) -> str:
    return " ".join(
        value
        for value in [
            chunk.experiment_id,
            chunk.experiment_title,
            chunk.doc_type,
            chunk.step_id or "",
            chunk.title,
            chunk.text,
        ]
        if value
    )


def build_sparse_index(path: Path, chunks: list[Chunk]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    rows = []
    for chunk in chunks:
        tokens = tokenize(sparse_text(chunk))
        rows.append(
            {
                "chunk_id": chunk.chunk_id,
                "length": len(tokens),
                "term_freq": dict(Counter(tokens)),
            }
        )
    payload = {
        "backend": "bm25",
        "document_count": len(chunks),
        "rows": rows,
    }
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


class BM25Retriever:
    def __init__(
        self,
        chunks: Iterable[Chunk],
        *,
        k1: float = 1.5,
        b: float = 0.75,
    ):
        self.chunks = list(chunks)
        self.k1 = k1
        self.b = b
        self.term_freqs: dict[str, Counter[str]] = {}
        self.doc_lengths: dict[str, int] = {}
        self.doc_freqs: Counter[str] = Counter()
        self.avg_doc_length = 0.0
        self._build()

    def _build(self) -> None:
        total_length = 0
        for chunk in self.chunks:
            terms = tokenize(sparse_text(chunk))
            term_freq = Counter(terms)
            self.term_freqs[chunk.chunk_id] = term_freq
            self.doc_lengths[chunk.chunk_id] = len(terms)
            total_length += len(terms)
            for term in term_freq:
                self.doc_freqs[term] += 1
        self.avg_doc_length = total_length / len(self.chunks) if self.chunks else 0.0

    def _idf(self, term: str) -> float:
        document_count = len(self.chunks)
        doc_freq = self.doc_freqs.get(term, 0)
        return math.log(1 + (document_count - doc_freq + 0.5) / (doc_freq + 0.5))

    def _score(self, query_terms: list[str], chunk: Chunk) -> float:
        term_freq = self.term_freqs.get(chunk.chunk_id, Counter())
        doc_length = self.doc_lengths.get(chunk.chunk_id, 0)
        if not term_freq or not query_terms or self.avg_doc_length <= 0:
            return 0.0

        score = 0.0
        for term in query_terms:
            freq = term_freq.get(term, 0)
            if freq <= 0:
                continue
            numerator = freq * (self.k1 + 1)
            denominator = freq + self.k1 * (1 - self.b + self.b * doc_length / self.avg_doc_length)
            score += self._idf(term) * numerator / denominator
        return score

    def search(
        self,
        question: str,
        *,
        experiment_id: str | None = None,
        doc_type: str | None = None,
        step_id: str | None = None,
        top_k: int = 20,
    ) -> list[RetrievedChunk]:
        query_terms = tokenize(question)
        results: list[RetrievedChunk] = []
        for chunk in self.chunks:
            if experiment_id and chunk.experiment_id != experiment_id:
                continue
            if doc_type and chunk.doc_type != doc_type:
                continue
            if step_id and chunk.step_id != step_id:
                continue
            score = self._score(query_terms, chunk)
            if experiment_id and chunk.experiment_id == experiment_id:
                score += 0.04
            if doc_type and chunk.doc_type == doc_type:
                score += 0.06
            if step_id and chunk.step_id == step_id:
                score += 0.18
            if score > 0:
                results.append(RetrievedChunk(chunk=chunk, score=round(score, 6)))

        results.sort(key=lambda item: item.score, reverse=True)
        return results[: max(1, min(top_k, 50))]
