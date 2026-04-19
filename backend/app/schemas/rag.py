from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class RAGQueryRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    question: str = Field(..., min_length=1)
    experiment_id: str | None = None
    doc_type: str | None = None
    step_id: str | None = None
    context_step_id: str | None = None
    scene: str | None = None
    page_context: str | None = None
    top_k: int = Field(default=5, ge=1, le=20)


class RAGSource(BaseModel):
    chunk_id: str
    experiment_id: str
    experiment_type: str
    doc_type: str
    step_id: str | None = None
    title: str
    source: str
    score: float


class RAGResponse(BaseModel):
    answer: str
    sources: list[RAGSource]
    retrieval: dict[str, Any]


class KBRebuildResponse(BaseModel):
    success: bool
    document_count: int
    chunk_count: int
    doc_type_counts: dict[str, int]
    experiment_counts: dict[str, int]
    chunks_path: str
    vectors_path: str | None = None
    sparse_index_path: str | None = None
