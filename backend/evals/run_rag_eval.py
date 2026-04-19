from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.rag.index_manager import get_chunks  # noqa: E402
from app.services.rag_service import query_knowledge_base  # noqa: E402


EVAL_DIR = ROOT / "evals"
DEFAULT_CASES_PATH = EVAL_DIR / "cases" / "rag_eval_cases.jsonl"
REPORTS_DIR = EVAL_DIR / "reports"
RAGAS_DIR = EVAL_DIR / "ragas"


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as file:
        for line_no, line in enumerate(file, start=1):
            clean = line.strip()
            if not clean:
                continue
            try:
                rows.append(json.loads(clean))
            except json.JSONDecodeError as error:
                raise ValueError(f"Invalid JSONL at {path}:{line_no}: {error}") from error
    return rows


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    content = "\n".join(json.dumps(row, ensure_ascii=False) for row in rows)
    path.write_text(content + "\n", encoding="utf-8")


def contains_any(value: str, patterns: list[str] | None) -> bool | None:
    if not patterns:
        return None
    return any(pattern in value for pattern in patterns)


def score_case(case: dict[str, Any], result: dict[str, Any], elapsed_ms: int) -> dict[str, Any]:
    retrieval = result.get("retrieval") or {}
    query_info = retrieval.get("query") or {}
    sources = result.get("sources") or []
    answer = result.get("answer") or ""
    source_blob = "\n".join(
        " ".join(
            str(source.get(key) or "")
            for key in ["chunk_id", "experiment_id", "doc_type", "step_id", "title", "source"]
        )
        for source in sources
    )

    checks = {
        "query_type": None,
        "experiment_id": None,
        "doc_type": None,
        "step_id": None,
        "source": None,
        "answer_keyword": None,
    }

    if case.get("expected_query_type"):
        checks["query_type"] = query_info.get("type") == case["expected_query_type"]
    if case.get("experiment_id"):
        checks["experiment_id"] = all(source.get("experiment_id") == case["experiment_id"] for source in sources) if sources else False
    if case.get("expected_doc_type"):
        checks["doc_type"] = any(source.get("doc_type") == case["expected_doc_type"] for source in sources)
    if case.get("expected_step_id"):
        checks["step_id"] = any(source.get("step_id") == case["expected_step_id"] for source in sources)
    checks["source"] = contains_any(source_blob, case.get("expected_source_contains"))
    checks["answer_keyword"] = contains_any(answer, case.get("expected_answer_keywords"))

    active_checks = {key: value for key, value in checks.items() if value is not None}
    passed = all(active_checks.values()) if active_checks else True

    return {
        "id": case.get("id"),
        "question": case.get("question"),
        "passed": passed,
        "elapsed_ms": elapsed_ms,
        "checks": checks,
        "expected": {
            "query_type": case.get("expected_query_type"),
            "experiment_id": case.get("experiment_id"),
            "doc_type": case.get("expected_doc_type"),
            "step_id": case.get("expected_step_id"),
            "source_contains": case.get("expected_source_contains", []),
            "answer_keywords": case.get("expected_answer_keywords", []),
        },
        "actual": {
            "query_type": query_info.get("type"),
            "experiment_id": query_info.get("experiment_id"),
            "doc_type": query_info.get("doc_type"),
            "step_id": query_info.get("step_id"),
            "sources": sources,
            "answer": answer,
        },
    }


def aggregate(results: list[dict[str, Any]]) -> dict[str, Any]:
    metric_names = ["query_type", "experiment_id", "doc_type", "step_id", "source", "answer_keyword"]
    metrics: dict[str, Any] = {}
    for name in metric_names:
        values = [item["checks"][name] for item in results if item["checks"][name] is not None]
        metrics[f"{name}_accuracy" if name != "source" else "source_hit_rate"] = (
            round(sum(1 for value in values if value) / len(values), 4) if values else None
        )

    latencies = [item["elapsed_ms"] for item in results]
    return {
        "total": len(results),
        "passed": sum(1 for item in results if item["passed"]),
        "failed": sum(1 for item in results if not item["passed"]),
        "pass_rate": round(sum(1 for item in results if item["passed"]) / len(results), 4) if results else 0,
        "latency_ms": {
            "avg": round(sum(latencies) / len(latencies), 2) if latencies else 0,
            "max": max(latencies) if latencies else 0,
            "min": min(latencies) if latencies else 0,
        },
        "metrics": metrics,
    }


def build_ragas_rows(cases: list[dict[str, Any]], results: list[dict[str, Any]]) -> list[dict[str, Any]]:
    chunks = get_chunks(auto_rebuild=True)
    chunk_by_id = {chunk.chunk_id: chunk for chunk in chunks}
    rows: list[dict[str, Any]] = []

    for case, result in zip(cases, results):
        actual = result["actual"]
        retrieved_contexts = []
        for source in actual["sources"]:
            chunk = chunk_by_id.get(source.get("chunk_id"))
            if chunk:
                retrieved_contexts.append(chunk.text)

        reference_parts = []
        if case.get("expected_answer_keywords"):
            reference_parts.append("期望回答覆盖关键词：" + "、".join(case["expected_answer_keywords"]))
        if case.get("expected_source_contains"):
            reference_parts.append("期望回答基于来源：" + "、".join(case["expected_source_contains"]))
        if case.get("expected_doc_type"):
            reference_parts.append(f"期望文档类型：{case['expected_doc_type']}")
        if case.get("expected_step_id"):
            reference_parts.append(f"期望步骤：{case['expected_step_id']}")

        rows.append(
            {
                "user_input": case["question"],
                "response": actual["answer"],
                "retrieved_contexts": retrieved_contexts,
                "reference": "；".join(reference_parts) or case["question"],
                "reference_contexts": retrieved_contexts,
                "metadata": {
                    "id": case.get("id"),
                    "experiment_id": case.get("experiment_id"),
                    "expected_query_type": case.get("expected_query_type"),
                    "expected_doc_type": case.get("expected_doc_type"),
                    "expected_step_id": case.get("expected_step_id"),
                    "passed_rule_eval": result["passed"],
                },
            }
        )
    return rows


def run_eval(cases_path: Path, *, export_ragas: bool = True) -> dict[str, Any]:
    cases = read_jsonl(cases_path)
    results: list[dict[str, Any]] = []

    for case in cases:
        started = time.perf_counter()
        result = query_knowledge_base(
            question=case["question"],
            experiment_id=case.get("experiment_id"),
            doc_type=case.get("doc_type"),
            step_id=case.get("step_id"),
            context_step_id=case.get("context_step_id"),
            scene=case.get("scene"),
            page_context=case.get("page_context"),
            top_k=int(case.get("top_k", 3)),
        )
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        results.append(score_case(case, result, elapsed_ms))

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    summary = aggregate(results)
    report = {
        "generated_at": timestamp,
        "cases_path": str(cases_path),
        **summary,
        "results": results,
    }
    report_path = REPORTS_DIR / f"rag_eval_{timestamp}.json"
    write_json(report_path, report)
    report["report_path"] = str(report_path)

    if export_ragas:
        ragas_rows = build_ragas_rows(cases, results)
        ragas_path = RAGAS_DIR / "ragas_dataset.jsonl"
        write_jsonl(ragas_path, ragas_rows)
        report["ragas_dataset_path"] = str(ragas_path)

    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Run STEM_Agent RAG rule-based evaluation.")
    parser.add_argument("--cases", default=str(DEFAULT_CASES_PATH), help="JSONL eval cases path.")
    parser.add_argument("--no-ragas-export", action="store_true", help="Do not export Ragas-compatible dataset.")
    args = parser.parse_args()

    report = run_eval(Path(args.cases), export_ragas=not args.no_ragas_export)
    printable = {key: value for key, value in report.items() if key != "results"}
    print(json.dumps(printable, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
