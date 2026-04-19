from __future__ import annotations

import json
from typing import Any

from app.core.config import get_settings
from app.rag.bm25_retriever import build_sparse_index
from app.rag.markdown_loader import load_experiment_documents
from app.rag.splitter import Chunk, split_documents
from app.rag.vector_store import build_vector_index


def chunk_from_dict(data: dict[str, Any]) -> Chunk:
    return Chunk(
        chunk_id=str(data["chunk_id"]),
        experiment_id=str(data["experiment_id"]),
        experiment_type=str(data.get("experiment_type") or ""),
        experiment_title=str(data.get("experiment_title") or ""),
        doc_type=str(data["doc_type"]),
        step_id=data.get("step_id"),
        title=str(data.get("title") or ""),
        heading_path=list(data.get("heading_path") or []),
        source=str(data["source"]),
        text=str(data.get("text") or ""),
    )


def write_chunks(chunks: list[Chunk]) -> None:
    settings = get_settings()
    settings.index_dir.mkdir(parents=True, exist_ok=True)
    with settings.chunks_path.open("w", encoding="utf-8") as file:
        for chunk in chunks:
            file.write(json.dumps(chunk.to_dict(), ensure_ascii=False) + "\n")


def write_metadata(chunks: list[Chunk]) -> None:
    settings = get_settings()
    metadata = {
        "chunk_count": len(chunks),
        "knowledge_base_dir": str(settings.knowledge_base_dir),
        "chunks_path": str(settings.chunks_path),
        "vectors_path": str(settings.vectors_path),
        "sparse_index_path": str(settings.sparse_index_path),
        "vector_backend": settings.vector_backend,
        "sparse_backend": settings.sparse_backend,
        "fusion_strategy": settings.fusion_strategy,
        "retriever": "modular_hybrid_rag_v1",
    }
    settings.index_metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def read_chunks() -> list[Chunk]:
    settings = get_settings()
    if not settings.chunks_path.exists():
        return []
    chunks: list[Chunk] = []
    for line in settings.chunks_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        chunks.append(chunk_from_dict(json.loads(line)))
    return chunks


def rebuild_index() -> dict[str, Any]:
    settings = get_settings()
    documents = load_experiment_documents(settings.knowledge_base_dir)
    chunks = split_documents(documents)
    write_chunks(chunks)
    build_vector_index(settings.vectors_path, chunks)
    build_sparse_index(settings.sparse_index_path, chunks)
    write_metadata(chunks)

    doc_type_counts: dict[str, int] = {}
    experiment_counts: dict[str, int] = {}
    for chunk in chunks:
        doc_type_counts[chunk.doc_type] = doc_type_counts.get(chunk.doc_type, 0) + 1
        experiment_counts[chunk.experiment_id] = experiment_counts.get(chunk.experiment_id, 0) + 1

    return {
        "success": True,
        "document_count": len(documents),
        "chunk_count": len(chunks),
        "doc_type_counts": doc_type_counts,
        "experiment_counts": experiment_counts,
        "chunks_path": str(settings.chunks_path),
        "vectors_path": str(settings.vectors_path),
        "sparse_index_path": str(settings.sparse_index_path),
    }


def get_index_status() -> dict[str, Any]:
    settings = get_settings()
    chunks = read_chunks()
    return {
        "exists": settings.chunks_path.exists(),
        "chunk_count": len(chunks),
        "chunks_path": str(settings.chunks_path),
        "vectors_exists": settings.vectors_path.exists(),
        "vectors_path": str(settings.vectors_path),
        "sparse_index_exists": settings.sparse_index_path.exists(),
        "sparse_index_path": str(settings.sparse_index_path),
        "metadata_path": str(settings.index_metadata_path),
        "vector_backend": settings.vector_backend,
        "sparse_backend": settings.sparse_backend,
        "fusion_strategy": settings.fusion_strategy,
    }


def get_chunks(auto_rebuild: bool = True) -> list[Chunk]:
    chunks = read_chunks()
    if chunks or not auto_rebuild:
        return chunks
    rebuild_index()
    return read_chunks()
