from __future__ import annotations

import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Iterable

from app.rag.splitter import Chunk


PUNCT_RE = re.compile(r"[\s，。！？、,.!?;；:：\"'“”‘’（）()\[\]【】<>《》#`*_|\-]+")
STEP_QUERY_RE = re.compile(r"(?:Step\s*|第\s*)(\d{1,2})(?:\s*步)?", re.IGNORECASE)


@dataclass(frozen=True)
class RetrievedChunk:
    chunk: Chunk
    score: float


def normalize_text(text: str) -> str:
    return PUNCT_RE.sub("", str(text).lower())


def tokenize(text: str) -> list[str]:
    normalized = normalize_text(text)
    if not normalized:
        return []

    tokens: list[str] = []
    words = re.findall(r"[a-zA-Z0-9_]+", text.lower())
    tokens.extend(words)

    chars = list(normalized)
    tokens.extend(chars)
    if len(chars) >= 2:
        tokens.extend("".join(chars[i : i + 2]) for i in range(len(chars) - 1))
    return tokens


def infer_step_id(question: str) -> str | None:
    match = STEP_QUERY_RE.search(question or "")
    if not match:
        return None
    return f"step{int(match.group(1))}"


def infer_doc_type(question: str) -> str | None:
    normalized = normalize_text(question)
    doc_type_keywords = [
        ("safety", ["安全", "危险", "风险", "烫伤", "打孔", "酒精灯", "手套", "飞溅"]),
        ("materials", ["材料", "清单", "规格", "数量", "工具", "需要什么"]),
        ("concepts", ["原理", "为什么", "概念", "离心", "变量", "自变量", "因变量", "不变量"]),
        ("qa", ["常见问题", "问答", "怎么办"]),
        ("flow", ["步骤", "怎么做", "流程", "测试", "记录", "搭建", "操作", "虚拟实验", "虚拟操作", "优化", "引导"]),
    ]
    for doc_type, keywords in doc_type_keywords:
        if any(keyword in normalized for keyword in keywords):
            return doc_type
    return None


def cosine_from_counters(left: Counter[str], right: Counter[str]) -> float:
    if not left or not right:
        return 0.0
    common = set(left) & set(right)
    dot = sum(left[token] * right[token] for token in common)
    left_norm = math.sqrt(sum(value * value for value in left.values()))
    right_norm = math.sqrt(sum(value * value for value in right.values()))
    if left_norm == 0 or right_norm == 0:
        return 0.0
    return dot / (left_norm * right_norm)


class LexicalRetriever:
    def __init__(self, chunks: Iterable[Chunk]):
        self.chunks = list(chunks)
        self.chunk_vectors = {
            chunk.chunk_id: Counter(tokenize(" ".join([chunk.title, chunk.text])))
            for chunk in self.chunks
        }

    def search(
        self,
        question: str,
        *,
        experiment_id: str | None = None,
        doc_type: str | None = None,
        step_id: str | None = None,
        top_k: int = 5,
    ) -> list[RetrievedChunk]:
        cleaned_question = question or ""
        if experiment_id:
            cleaned_question = cleaned_question.replace(experiment_id, "")
        query_vector = Counter(tokenize(cleaned_question))
        inferred_step_id = step_id or infer_step_id(question)
        inferred_doc_type = doc_type or infer_doc_type(question)
        results: list[RetrievedChunk] = []

        for chunk in self.chunks:
            if experiment_id and chunk.experiment_id != experiment_id:
                continue
            if doc_type and chunk.doc_type != doc_type:
                continue
            if step_id and chunk.step_id != step_id:
                continue
            if inferred_step_id and not doc_type:
                if chunk.doc_type == "flow" and chunk.step_id != inferred_step_id:
                    continue
                if chunk.doc_type != "flow" and not inferred_doc_type:
                    continue
            if inferred_doc_type and not doc_type and not inferred_step_id:
                if chunk.doc_type != inferred_doc_type:
                    continue

            score = cosine_from_counters(query_vector, self.chunk_vectors[chunk.chunk_id])

            if inferred_step_id and chunk.step_id == inferred_step_id:
                score += 0.75
            if inferred_doc_type and chunk.doc_type == inferred_doc_type:
                score += 0.2
            if experiment_id and chunk.experiment_id == experiment_id:
                score += 0.08
            if chunk.title and normalize_text(chunk.title) in normalize_text(question):
                score += 0.1

            if score > 0:
                results.append(RetrievedChunk(chunk=chunk, score=round(score, 6)))

        results.sort(key=lambda item: item.score, reverse=True)
        return results[: max(1, min(top_k, 20))]
