from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from datetime import datetime, timezone

from app.rag.markdown_loader import MarkdownDocument


HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
STEP_RE = re.compile(r"(?:Step\s*|第\s*|步骤\s*)(\d{1,2})(?:\s*步)?", re.IGNORECASE)
SKIP_TITLES = {
    "文档用途",
    "推荐 RAG 检索提示",
    "当前样板优化记录",
    "人工复核点",
    "原始流程整理",
    "内容准备",
    "实验元信息",
}


@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    experiment_id: str
    experiment_type: str
    experiment_title: str
    canonical_title: str
    display_title: str
    aliases: tuple[str, ...]
    doc_type: str
    step_id: str | None
    step_title: str | None
    section_type: str
    quality_score: float
    source_status: str
    token_count: int
    updated_at: str
    title: str
    heading_path: list[str]
    source: str
    text: str

    def to_dict(self) -> dict:
        return asdict(self)


def detect_step_id(title: str, heading_path: list[str]) -> str | None:
    candidates = [title, *heading_path]
    for candidate in candidates:
        match = STEP_RE.search(candidate)
        if match:
            return f"step{int(match.group(1))}"
    return None


def normalize_chunk_text(title: str, body_lines: list[str]) -> str:
    body = "\n".join(line.rstrip() for line in body_lines).strip()
    if body:
        return f"{title}\n\n{body}".strip()
    return title.strip()


def infer_section_type(title: str, text: str) -> str:
    target = f"{title}\n{text}"
    mapping = [
        ("goal", ["目标", "任务"]),
        ("action", ["操作", "步骤", "搭建", "制作"]),
        ("teacher_guide", ["教师", "引导", "提示"]),
        ("observation", ["观察", "现象", "数据"]),
        ("error", ["错误", "误区", "问题", "注意"]),
        ("output", ["记录", "产出", "报告", "结论"]),
    ]
    for section_type, keywords in mapping:
        if any(keyword in target for keyword in keywords):
            return section_type
    return "other"


def quality_score_for(status: str) -> float:
    if status == "standardized":
        return 1.0
    if "sample" in status:
        return 0.82
    if status == "auto_extracted_draft":
        return 0.55
    return 0.65


def split_long_text(text: str, max_chars: int = 1200, overlap_chars: int = 120) -> list[str]:
    if len(text) <= max_chars:
        return [text]

    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        if not current:
            current = paragraph
            continue
        if len(current) + len(paragraph) + 2 <= max_chars:
            current = f"{current}\n\n{paragraph}"
        else:
            chunks.append(current)
            tail = current[-overlap_chars:] if overlap_chars > 0 else ""
            current = f"{tail}\n\n{paragraph}".strip() if tail else paragraph
    if current:
        chunks.append(current)
    return chunks


def split_markdown_document(document: MarkdownDocument, max_chars: int = 1200) -> list[Chunk]:
    lines = document.text.splitlines()
    sections: list[tuple[str, list[str], list[str]]] = []
    heading_stack: list[str] = []
    current_title = document.experiment_title
    current_body: list[str] = []
    current_path: list[str] = [document.experiment_title]

    for line in lines:
        match = HEADING_RE.match(line)
        if not match:
            current_body.append(line)
            continue

        if current_body:
            sections.append((current_title, current_path, current_body))

        level = len(match.group(1))
        title = match.group(2).strip()
        heading_stack = heading_stack[: level - 1]
        heading_stack.append(title)
        current_title = title
        current_path = heading_stack[:]
        current_body = []

    if current_body:
        sections.append((current_title, current_path, current_body))

    chunks: list[Chunk] = []
    updated_at = datetime.now(timezone.utc).isoformat()
    for section_index, (title, heading_path, body_lines) in enumerate(sections, start=1):
        if title.strip() in SKIP_TITLES:
            continue
        if not "\n".join(body_lines).strip():
            continue
        text = normalize_chunk_text(title, body_lines)
        if not text or text.strip() == title.strip():
            continue
        step_id = detect_step_id(title, heading_path) if document.doc_type == "flow" else None
        parts = split_long_text(text, max_chars=max_chars)
        for part_index, part in enumerate(parts, start=1):
            chunk_id = (
                f"{document.experiment_id}_{document.doc_type}_"
                f"{step_id or 'general'}_{section_index:03d}_{part_index:02d}"
            )
            chunks.append(
                Chunk(
                    chunk_id=chunk_id,
                    experiment_id=document.experiment_id,
                    experiment_type=document.experiment_type,
                    experiment_title=document.experiment_title,
                    canonical_title=document.canonical_title,
                    display_title=document.display_title,
                    aliases=document.aliases,
                    doc_type=document.doc_type,
                    step_id=step_id,
                    step_title=title if step_id else None,
                    section_type=infer_section_type(title, part),
                    quality_score=quality_score_for(document.source_status),
                    source_status=document.source_status,
                    token_count=len(part),
                    updated_at=updated_at,
                    title=title,
                    heading_path=heading_path,
                    source=document.source,
                    text=part,
                )
            )
    return chunks


def split_documents(documents: list[MarkdownDocument], max_chars: int = 1200) -> list[Chunk]:
    chunks: list[Chunk] = []
    for document in documents:
        chunks.extend(split_markdown_document(document, max_chars=max_chars))
    return chunks
