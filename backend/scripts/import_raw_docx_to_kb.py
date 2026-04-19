from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile


BACKEND_DIR = Path(__file__).resolve().parents[1]
RAW_DOCS_DIR = BACKEND_DIR / "knowledge_base" / "raw_docs"
EXPERIMENTS_DIR = BACKEND_DIR / "knowledge_base" / "experiments"


def extract_docx_paragraphs(path: Path) -> list[str]:
    with ZipFile(path) as archive:
        xml = archive.read("word/document.xml")
    root = ET.fromstring(xml)
    namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    paragraphs: list[str] = []
    for paragraph in root.findall(".//w:p", namespace):
        text = "".join(node.text or "" for node in paragraph.findall(".//w:t", namespace)).strip()
        text = re.sub(r"\s+", " ", text)
        if text:
            paragraphs.append(text)
    return paragraphs


def infer_title(paragraphs: list[str], experiment_id: str) -> str:
    if not paragraphs:
        return experiment_id
    first = paragraphs[0]
    first = re.sub(r"^第[一二三四五六七八九十\d]+课[：:《]*", "", first)
    first = first.replace("》", "").replace("《", "").strip()
    return first or experiment_id


def infer_type(experiment_id: str) -> str:
    return "science" if experiment_id.startswith("science-") else "engineering"


def heading_for_paragraph(text: str) -> str | None:
    if re.match(r"^第[一二三四五六七八九十\d]+环节", text):
        return text.split("：", 1)[0].split(":", 1)[0]
    if re.match(r"^步骤\s*\d+", text):
        return text.split("：", 1)[0].split(":", 1)[0]
    if re.match(r"^第[一二三四五六七八九十\d]+步", text):
        return text.split("：", 1)[0].split(":", 1)[0]
    if text.startswith("第一步") or text.startswith("第二步") or text.startswith("第三步"):
        return text.split("。", 1)[0].split("：", 1)[0]
    return None


def build_flow_md(experiment_id: str, title: str, paragraphs: list[str]) -> str:
    experiment_type = infer_type(experiment_id)
    lines = [
        f"# {experiment_id}：{title}",
        "",
        "## 实验元信息",
        "",
        f"- 实验 ID：`{experiment_id}`",
        f"- 实验类型：{'科学探究' if experiment_type == 'science' else '工程实践'}",
        f"- 原始 Word 文档：`backend/knowledge_base/raw_docs/{experiment_id}.docx`",
        "- 当前状态：由 `scripts/import_raw_docx_to_kb.py` 自动提取生成，后续需要人工标准化。",
        "",
        "## 原始流程整理",
        "",
    ]
    current_heading = ""
    for paragraph in paragraphs[1:]:
        heading = heading_for_paragraph(paragraph)
        if heading and heading != current_heading:
            current_heading = heading
            lines.extend(["", f"## {heading}", ""])
        lines.append(paragraph)
        lines.append("")
    return "\n".join(lines).strip() + "\n"


def pick_lines(paragraphs: list[str], keywords: list[str], limit: int = 18) -> list[str]:
    picked: list[str] = []
    for paragraph in paragraphs:
        if any(keyword in paragraph for keyword in keywords):
            picked.append(paragraph)
        if len(picked) >= limit:
            break
    return picked


def build_topic_md(experiment_id: str, title: str, doc_type: str, paragraphs: list[str]) -> str:
    keyword_map = {
        "materials": ["材料", "工具", "模型", "结构", "系统", "电机", "电池", "塑料", "木", "纸", "管"],
        "concepts": ["科学原理", "原理", "离心", "摩擦", "重力", "电机", "电流", "磁", "变量", "效率"],
        "safety": ["安全", "危险", "风险", "成人", "打孔", "电", "剪刀", "飞溅", "注意"],
        "qa": ["问题", "为什么", "如何", "怎样", "怎么办", "错误", "优化"],
    }
    title_map = {
        "materials": "材料与工具线索",
        "concepts": "核心概念与原理线索",
        "safety": "安全注意事项线索",
        "qa": "常见问题线索",
    }
    picked = pick_lines(paragraphs, keyword_map[doc_type])
    lines = [
        f"# {experiment_id}：{title} - {title_map[doc_type]}",
        "",
        "## 文档说明",
        "",
        "本文由原始 Word 自动提取生成，用于补齐 RAG 知识库覆盖面。内容需要后续人工复核、去重和标准化。",
        "",
        f"## {title_map[doc_type]}",
        "",
    ]
    if not picked:
        lines.append("- 原始文档中未自动提取到明显线索，建议人工补充。")
    else:
        for item in picked:
            lines.append(f"- {item}")
    lines.extend(
        [
            "",
            "## 人工复核点",
            "",
            "- 检查是否与前端实验流程一致。",
            "- 将过长句子拆成适合 RAG 检索的短段落。",
            "- 删除重复策划说明，保留学生可执行、AI 可引用的内容。",
        ]
    )
    return "\n".join(lines).strip() + "\n"


def write_metadata(experiment_id: str, title: str) -> None:
    experiment_type = infer_type(experiment_id)
    target = EXPERIMENTS_DIR / experiment_id / "metadata.json"
    target.write_text(
        json.dumps(
            {
                "experiment_id": experiment_id,
                "experiment_type": experiment_type,
                "experiment_title": title,
                "source": f"raw_docs/{experiment_id}.docx",
                "status": "auto_extracted_draft",
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def import_docx(path: Path, *, overwrite: bool = False) -> str:
    experiment_id = path.stem
    target_dir = EXPERIMENTS_DIR / experiment_id
    if target_dir.exists() and not overwrite:
        return f"skip existing {experiment_id}"
    paragraphs = extract_docx_paragraphs(path)
    title = infer_title(paragraphs, experiment_id)
    target_dir.mkdir(parents=True, exist_ok=True)
    (target_dir / "flow.md").write_text(build_flow_md(experiment_id, title, paragraphs), encoding="utf-8")
    for doc_type in ["materials", "concepts", "safety", "qa"]:
        (target_dir / f"{doc_type}.md").write_text(
            build_topic_md(experiment_id, title, doc_type, paragraphs),
            encoding="utf-8",
        )
    write_metadata(experiment_id, title)
    return f"imported {experiment_id}"


def main() -> None:
    overwrite = "--overwrite" in sys.argv
    results = []
    for path in sorted(RAW_DOCS_DIR.glob("*.docx")):
        results.append(import_docx(path, overwrite=overwrite))
    print("\n".join(results))


if __name__ == "__main__":
    main()
