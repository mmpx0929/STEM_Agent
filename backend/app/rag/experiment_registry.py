from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.core.config import get_settings


def normalize_text(text: str) -> str:
    remove = set(" \t\r\n，。！？、,.!?;；:：\"'“”‘’（）()[]【】<>《》#`*_|-")
    return "".join(ch for ch in str(text).lower() if ch not in remove)


DEFAULT_EXPERIMENTS: dict[str, dict[str, Any]] = {
    "science-01": {
        "experiment_type": "science",
        "canonical_title": "旋转飞椅的离心力现象与变量实验设计",
        "display_title": "洗衣机为什么能把衣服甩干",
        "aliases": ["science-01", "s01", "s-01", "科学实验1", "科学实验一", "科学探究1", "科学探究一", "实验1", "实验一", "旋转飞椅", "洗衣机甩干", "洗衣机为什么能把衣服甩干", "离心力实验"],
        "step_count": 10,
        "status": "sample_needs_human_standardization",
    },
    "science-02": {
        "experiment_type": "science",
        "canonical_title": "STEM 基础科学探究：旋转飞椅的离心力脱离原理验证与数据分析",
        "display_title": "旋转飞椅的离心力脱离原理验证与数据分析",
        "aliases": ["science-02", "s02", "s-02", "科学实验2", "科学实验二", "科学探究2", "科学探究二", "磁铁飞椅", "五角星", "磁铁", "五角星飞出", "离心力脱离", "旋转飞椅脱离"],
        "step_count": 10,
        "status": "auto_extracted_draft",
    },
    "engineering-01": {
        "experiment_type": "engineering",
        "canonical_title": "手动离心甩干机的原型设计与功能测试",
        "display_title": "如何用简单结构把袜子里的水分离出来",
        "aliases": ["engineering-01", "e01", "e-01", "工程实验1", "工程实验一", "工程实践1", "工程实践一", "手动离心甩干机", "手动甩干机", "袜子脱水", "袜子甩干"],
        "step_count": 9,
        "status": "sample_needs_human_standardization",
    },
    "engineering-02": {
        "experiment_type": "engineering",
        "canonical_title": "STEM 工程实践：手动离心甩干机的问题分析与结构迭代优化",
        "display_title": "手动离心甩干机的问题分析与结构迭代优化",
        "aliases": ["engineering-02", "e02", "e-02", "工程实验2", "工程实验二", "工程实践2", "工程实践二", "手动甩干机优化", "结构迭代", "排水测试"],
        "step_count": 9,
        "status": "auto_extracted_draft",
    },
    "engineering-03": {
        "experiment_type": "engineering",
        "canonical_title": "STEM 工程实践：电动离心甩干机的机电系统设计与实测验证",
        "display_title": "电动离心甩干机的机电系统设计与实测验证",
        "aliases": ["engineering-03", "e03", "e-03", "工程实验3", "工程实验三", "工程实践3", "工程实践三", "电动甩干机", "电机驱动甩干机", "机电系统"],
        "step_count": 9,
        "status": "auto_extracted_draft",
    },
    "engineering-04": {
        "experiment_type": "engineering",
        "canonical_title": "STEM 工程实践：电动离心甩干机的尺寸与排水系统迭代升级",
        "display_title": "电动离心甩干机的尺寸与排水系统迭代升级",
        "aliases": ["engineering-04", "e04", "e-04", "工程实验4", "工程实验四", "工程实践4", "工程实践四", "电动甩干机升级", "排水系统", "尺寸优化"],
        "step_count": 9,
        "status": "auto_extracted_draft",
    },
    "engineering-05": {
        "experiment_type": "engineering",
        "canonical_title": "STEM 工程实践：电动洗衣机的波轮驱动设计与去污功能测试",
        "display_title": "电动洗衣机的波轮驱动设计与去污功能测试",
        "aliases": ["engineering-05", "e05", "e-05", "工程实验5", "工程实验五", "工程实践5", "工程实践五", "电动洗衣机", "波轮驱动", "去污测试", "洗袜子"],
        "step_count": 9,
        "status": "auto_extracted_draft",
    },
    "engineering-06": {
        "experiment_type": "engineering",
        "canonical_title": "STEM 工程实践：电动洗衣机的电机正反转改造与功能优化",
        "display_title": "电动洗衣机的电机正反转改造与功能优化",
        "aliases": ["engineering-06", "e06", "e-06", "工程实验6", "工程实验六", "工程实践6", "工程实践六", "洗衣机正反转", "电机正反转", "功能优化", "正反转改造"],
        "step_count": 9,
        "status": "auto_extracted_draft",
    },
}


@dataclass(frozen=True)
class ExperimentInfo:
    experiment_id: str
    experiment_type: str
    canonical_title: str
    display_title: str | None
    aliases: tuple[str, ...]
    step_count: int | None
    status: str
    source_doc: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _read_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _unique(items: list[str]) -> tuple[str, ...]:
    seen: set[str] = set()
    result: list[str] = []
    for item in items:
        clean = str(item or "").strip()
        if not clean:
            continue
        key = normalize_text(clean)
        if key in seen:
            continue
        seen.add(key)
        result.append(clean)
    return tuple(result)


def _metadata_to_info(experiment_dir: Path, metadata: dict[str, Any]) -> ExperimentInfo:
    experiment_id = str(metadata.get("experiment_id") or experiment_dir.name)
    defaults = DEFAULT_EXPERIMENTS.get(experiment_id, {})
    canonical_title = str(
        metadata.get("canonical_title")
        or metadata.get("title")
        or metadata.get("experiment_title")
        or defaults.get("canonical_title")
        or experiment_id
    )
    display_title = metadata.get("display_title") or defaults.get("display_title")
    status = str(metadata.get("status") or metadata.get("rag_notes", {}).get("status") or defaults.get("status") or "unknown")
    aliases = _unique(
        [
            experiment_id,
            canonical_title,
            str(display_title or ""),
            *list(defaults.get("aliases") or []),
            *list(metadata.get("aliases") or []),
        ]
    )
    step_count = metadata.get("step_count", defaults.get("step_count"))
    return ExperimentInfo(
        experiment_id=experiment_id,
        experiment_type=str(metadata.get("experiment_type") or defaults.get("experiment_type") or ""),
        canonical_title=canonical_title,
        display_title=str(display_title) if display_title else None,
        aliases=aliases,
        step_count=int(step_count) if step_count else None,
        status=status,
        source_doc=str(metadata.get("source_doc") or metadata.get("source") or "") or None,
    )


@lru_cache(maxsize=1)
def get_experiment_registry() -> dict[str, ExperimentInfo]:
    settings = get_settings()
    experiments_dir = settings.knowledge_base_dir / "experiments"
    registry: dict[str, ExperimentInfo] = {}

    if experiments_dir.exists():
        for experiment_dir in sorted(path for path in experiments_dir.iterdir() if path.is_dir()):
            metadata = _read_json(experiment_dir / "metadata.json")
            info = _metadata_to_info(experiment_dir, metadata)
            registry[info.experiment_id] = info

    for experiment_id in DEFAULT_EXPERIMENTS:
        if experiment_id not in registry:
            registry[experiment_id] = _metadata_to_info(experiments_dir / experiment_id, {"experiment_id": experiment_id})

    return registry


def clear_experiment_registry_cache() -> None:
    get_experiment_registry.cache_clear()


def get_experiment_info(experiment_id: str | None) -> ExperimentInfo | None:
    if not experiment_id:
        return None
    return get_experiment_registry().get(experiment_id)


def resolve_experiment(query: str, frontend_experiment_id: str | None = None) -> ExperimentInfo | None:
    registry = get_experiment_registry()
    normalized_query = normalize_text(query or "")
    matched: list[tuple[ExperimentInfo, int]] = []
    for info in registry.values():
        aliases = [info.experiment_id, info.canonical_title, info.display_title or "", *info.aliases]
        lengths = [len(normalize_text(alias)) for alias in aliases if alias and normalize_text(alias) in normalized_query]
        if lengths:
            matched.append((info, max(lengths)))

    if matched:
        explicit_type = None
        if any(word in normalized_query for word in ["工程", "工程实践", "工程实验"]):
            explicit_type = "engineering"
        if any(word in normalized_query for word in ["科学", "科学探究", "科学实验"]):
            explicit_type = "science"
        if explicit_type:
            typed = [(info, length) for info, length in matched if info.experiment_type == explicit_type]
            if typed:
                best_info, best_length = max(typed, key=lambda item: item[1])
                if frontend_experiment_id and frontend_experiment_id in registry and best_length <= 4:
                    return registry[frontend_experiment_id]
                return best_info
        best_info, best_length = max(matched, key=lambda item: item[1])
        if frontend_experiment_id and frontend_experiment_id in registry and best_length <= 4:
            return registry[frontend_experiment_id]
        return best_info

    if frontend_experiment_id and frontend_experiment_id in registry:
        return registry[frontend_experiment_id]
    return None
