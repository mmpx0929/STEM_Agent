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
BASELINE_PATH = REPORTS_DIR / "baseline.json"


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


def write_diff(timestamp: str, report: dict[str, Any]) -> str:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    if not BASELINE_PATH.exists():
        write_json(BASELINE_PATH, {key: value for key, value in report.items() if key != "results"})
        baseline = None
    else:
        baseline = json.loads(BASELINE_PATH.read_text(encoding="utf-8"))

    lines = ["# RAG Eval Diff", "", f"- Generated: {timestamp}", f"- Report: {report.get('report_path')}"]
    if baseline is None:
        lines.append("- Baseline: created from this run")
    else:
        lines.append(f"- Baseline: {BASELINE_PATH}")
        keys = [
            ("pass_rate", report.get("pass_rate"), baseline.get("pass_rate")),
            ("P95_latency_ms", (report.get("latency_ms") or {}).get("p95"), (baseline.get("latency_ms") or {}).get("p95")),
        ]
        metrics = report.get("metrics") or {}
        base_metrics = baseline.get("metrics") or {}
        for name in ["use_kb_accuracy", "context_normalization_accuracy", "experiment_id_accuracy", "doc_type_accuracy", "step_id_accuracy", "source_hit_rate", "recall@5", "mrr@5", "cache_hit_rate"]:
            keys.append((name, metrics.get(name), base_metrics.get(name)))
        lines.extend(["", "| Metric | Current | Baseline | Delta |", "|---|---:|---:|---:|"])
        for name, current, old in keys:
            delta = "" if current is None or old is None else round(float(current) - float(old), 4)
            lines.append(f"| {name} | {current} | {old} | {delta} |")

    diff_path = REPORTS_DIR / f"rag_eval_diff_{timestamp}.md"
    diff_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return str(diff_path)


def contains_any(value: str, patterns: list[str] | None) -> bool | None:
    if not patterns:
        return None
    return any(pattern in value for pattern in patterns)


def percentile(values: list[int], ratio: float) -> int:
    if not values:
        return 0
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, int(round((len(ordered) - 1) * ratio))))
    return ordered[index]


def expected_value(case: dict[str, Any], key: str, default: Any = None) -> Any:
    expected = case.get("expected") or {}
    old_key = {
        "use_kb": "expected_use_kb",
        "query_type": "expected_query_type",
        "doc_type": "expected_doc_type",
        "step_id": "expected_step_id",
        "source_contains": "expected_source_contains",
        "answer_keywords": "expected_answer_keywords",
    }.get(key, key)
    return expected.get(key, case.get(old_key, case.get(key, default)))


def first_source_rank(sources: list[dict[str, Any]], patterns: list[str] | None) -> int | None:
    if not patterns:
        return None
    for index, source in enumerate(sources, start=1):
        blob = " ".join(str(source.get(key) or "") for key in ["chunk_id", "source", "title", "experiment_id", "doc_type", "step_id"])
        if any(pattern in blob for pattern in patterns):
            return index
    return None


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

    route_decision = retrieval.get("route_decision") or {}
    normalized_context = retrieval.get("normalized_context") or {}
    cache = retrieval.get("cache") or {}
    expected_use_kb = expected_value(case, "use_kb")
    expected_sources = expected_value(case, "source_contains", [])
    rank = first_source_rank(sources, expected_sources)

    checks = {
        "use_kb": None,
        "context_normalization": None,
        "query_type": None,
        "experiment_id": None,
        "doc_type": None,
        "step_id": None,
        "source": None,
        "answer_keyword": None,
    }

    if expected_use_kb is not None:
        checks["use_kb"] = bool(route_decision.get("use_kb")) == bool(expected_use_kb)
    if expected_value(case, "query_type"):
        checks["query_type"] = query_info.get("type") == expected_value(case, "query_type")
    if expected_value(case, "experiment_id"):
        checks["experiment_id"] = query_info.get("experiment_id") == expected_value(case, "experiment_id") or (
            all(source.get("experiment_id") == expected_value(case, "experiment_id") for source in sources) if sources else False
        )
        checks["context_normalization"] = normalized_context.get("resolved_experiment_id") == expected_value(case, "experiment_id")
    if expected_value(case, "doc_type"):
        checks["doc_type"] = query_info.get("doc_type") == expected_value(case, "doc_type") or any(source.get("doc_type") == expected_value(case, "doc_type") for source in sources)
    if expected_value(case, "step_id"):
        checks["step_id"] = query_info.get("step_id") == expected_value(case, "step_id") or any(source.get("step_id") == expected_value(case, "step_id") for source in sources)
    checks["source"] = contains_any(source_blob, expected_sources)
    checks["answer_keyword"] = contains_any(answer, expected_value(case, "answer_keywords"))

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
            "use_kb": expected_use_kb,
            "experiment_id": expected_value(case, "experiment_id"),
            "doc_type": expected_value(case, "doc_type"),
            "step_id": expected_value(case, "step_id"),
            "source_contains": expected_sources,
            "answer_keywords": expected_value(case, "answer_keywords", []),
        },
        "actual": {
            "query_type": query_info.get("type"),
            "experiment_id": query_info.get("experiment_id"),
            "doc_type": query_info.get("doc_type"),
            "step_id": query_info.get("step_id"),
            "use_kb": route_decision.get("use_kb"),
            "route": retrieval.get("route"),
            "sources": sources,
            "answer": answer,
        },
        "metrics": {
            "recall@1": 1 if rank is not None and rank <= 1 else 0,
            "recall@3": 1 if rank is not None and rank <= 3 else 0,
            "recall@5": 1 if rank is not None and rank <= 5 else 0,
            "mrr@5": round(1 / rank, 4) if rank is not None and rank <= 5 else 0,
            "latency_ms": elapsed_ms,
            "cache_hit": bool(cache.get("retriever_cache_hit") or cache.get("query_cache_hit")),
            "has_expected_source": bool(expected_sources),
        },
        "debug": {
            "normalized_context": normalized_context,
            "route_decision": route_decision,
            "rewritten_query": retrieval.get("rewritten_query") or {},
            "cache": cache,
        },
    }


def aggregate(results: list[dict[str, Any]]) -> dict[str, Any]:
    metric_names = ["use_kb", "context_normalization", "query_type", "experiment_id", "doc_type", "step_id", "source", "answer_keyword"]
    metrics: dict[str, Any] = {}
    for name in metric_names:
        values = [item["checks"][name] for item in results if item["checks"][name] is not None]
        metrics[f"{name}_accuracy" if name != "source" else "source_hit_rate"] = (
            round(sum(1 for value in values if value) / len(values), 4) if values else None
        )

    latencies = [item["elapsed_ms"] for item in results]
    metric_rows = [item.get("metrics") or {} for item in results]
    source_expected_rows = [row for row in metric_rows if row.get("has_expected_source")]
    for key in ["recall@1", "recall@3", "recall@5", "mrr@5"]:
        values = [float(row.get(key, 0)) for row in source_expected_rows]
        metrics[key] = round(sum(values) / len(values), 4) if values else None
    cache_values = [row.get("cache_hit") for row in metric_rows if row.get("cache_hit") is not None]
    metrics["cache_hit_rate"] = round(sum(1 for value in cache_values if value) / len(cache_values), 4) if cache_values else None
    return {
        "total": len(results),
        "passed": sum(1 for item in results if item["passed"]),
        "failed": sum(1 for item in results if not item["passed"]),
        "pass_rate": round(sum(1 for item in results if item["passed"]) / len(results), 4) if results else 0,
        "latency_ms": {
            "avg": round(sum(latencies) / len(latencies), 2) if latencies else 0,
            "p50": percentile(latencies, 0.50),
            "p95": percentile(latencies, 0.95),
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
        frontend_context = case.get("frontend_context") or {}
        started = time.perf_counter()
        result = query_knowledge_base(
            question=case["question"],
            experiment_id=case.get("experiment_id") or frontend_context.get("experiment_id"),
            doc_type=case.get("doc_type") or frontend_context.get("doc_type"),
            step_id=case.get("step_id") or frontend_context.get("step_id"),
            context_step_id=case.get("context_step_id") or frontend_context.get("current_step"),
            scene=case.get("scene") or frontend_context.get("scene"),
            page_context=case.get("page_context") or frontend_context.get("pageContext"),
            history=case.get("history") or frontend_context.get("history"),
            messages=case.get("messages") or frontend_context.get("messages"),
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
    report["diff_report_path"] = write_diff(timestamp, report)

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
