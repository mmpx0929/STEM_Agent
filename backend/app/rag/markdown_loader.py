from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DOC_TYPE_BY_FILENAME = {
    "flow.md": "flow",
    "safety.md": "safety",
    "concepts.md": "concepts",
    "materials.md": "materials",
    "qa.md": "qa",
}


@dataclass(frozen=True)
class MarkdownDocument:
    text: str
    source: str
    doc_type: str
    experiment_id: str
    experiment_type: str
    experiment_title: str
    metadata: dict[str, Any]


def read_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def load_experiment_documents(knowledge_base_dir: Path) -> list[MarkdownDocument]:
    experiments_dir = knowledge_base_dir / "experiments"
    if not experiments_dir.exists():
        return []

    documents: list[MarkdownDocument] = []
    for experiment_dir in sorted(path for path in experiments_dir.iterdir() if path.is_dir()):
        metadata = read_json(experiment_dir / "metadata.json")
        experiment_id = str(metadata.get("experiment_id") or experiment_dir.name)
        experiment_type = str(metadata.get("experiment_type") or "")
        experiment_title = str(metadata.get("title") or experiment_id)

        for filename, doc_type in DOC_TYPE_BY_FILENAME.items():
            path = experiment_dir / filename
            if not path.exists():
                continue
            rel_source = path.relative_to(knowledge_base_dir).as_posix()
            documents.append(
                MarkdownDocument(
                    text=path.read_text(encoding="utf-8"),
                    source=rel_source,
                    doc_type=doc_type,
                    experiment_id=experiment_id,
                    experiment_type=experiment_type,
                    experiment_title=experiment_title,
                    metadata=metadata,
                )
            )
    return documents
