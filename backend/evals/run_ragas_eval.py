from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET = ROOT / "evals" / "ragas" / "ragas_dataset.jsonl"
REPORTS_DIR = ROOT / "evals" / "reports"


def read_jsonl(path: Path) -> list[dict]:
    rows = []
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            clean = line.strip()
            if clean:
                rows.append(json.loads(clean))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Run optional Ragas metrics on exported STEM_Agent eval cases.")
    parser.add_argument("--dataset", default=str(DEFAULT_DATASET), help="Ragas-compatible JSONL dataset.")
    args = parser.parse_args()

    try:
        from datasets import Dataset
        from ragas import evaluate
        try:
            from ragas.metrics import answer_relevancy, context_precision, faithfulness
            metrics = [faithfulness, context_precision, answer_relevancy]
        except ImportError:
            from ragas.metrics import ResponseRelevancy, LLMContextPrecisionWithReference, Faithfulness
            metrics = [Faithfulness(), LLMContextPrecisionWithReference(), ResponseRelevancy()]
    except ImportError as error:
        raise SystemExit(
            "Ragas is not installed. Install optional dependencies first, for example:\n"
            "  python -m pip install ragas datasets\n"
            "Ragas also needs judge-model environment variables according to your provider."
        ) from error

    rows = read_jsonl(Path(args.dataset))
    dataset = Dataset.from_list(rows)
    result = evaluate(dataset, metrics=metrics)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = REPORTS_DIR / f"ragas_eval_{timestamp}.json"
    report_path.parent.mkdir(parents=True, exist_ok=True)

    if hasattr(result, "to_pandas"):
        data = json.loads(result.to_pandas().to_json(orient="records", force_ascii=False))
    else:
        data = result
    report_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"report_path": str(report_path), "rows": len(rows)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
