# STEM_Agent RAG Evaluation

本目录用于评估 RAG 检索和回答质量。

## 目录

```text
evals/
  cases/rag_eval_cases.jsonl      固定评估集
  bad_cases/bad_cases.jsonl       真实失败案例记录
  reports/                        评估报告输出目录
  ragas/ragas_dataset.jsonl       Ragas 兼容数据集
  run_rag_eval.py                 自定义规则评估
  run_ragas_eval.py               可选 Ragas 指标评估
```

## 自定义规则评估

运行：

```powershell
cd D:\AI_Learning\STEM_Agent\STEM_Agent\backend
conda activate STEM
python evals\run_rag_eval.py
```

评估脚本会检查：

```text
query_type_accuracy
experiment_id_accuracy
doc_type_accuracy
step_id_accuracy
source_hit_rate
answer_keyword_accuracy
latency_ms
```

输出：

```text
evals/reports/rag_eval_YYYYMMDD_HHMMSS.json
evals/ragas/ragas_dataset.jsonl
```

## Ragas 数据集

`run_rag_eval.py` 会把同一批 cases 转成 Ragas 兼容格式：

```json
{
  "user_input": "科学实验1需要哪些材料？",
  "response": "RAG 生成回答",
  "retrieved_contexts": ["chunk text 1", "chunk text 2"],
  "reference": "期望回答覆盖关键词：材料；期望回答基于来源：science-01_materials",
  "reference_contexts": ["chunk text 1", "chunk text 2"],
  "metadata": {
    "id": "science01_materials_001",
    "experiment_id": "science-01"
  }
}
```

可选运行 Ragas：

```powershell
python -m pip install ragas datasets
python evals\run_ragas_eval.py
```

当前 Ragas 目标指标：

```text
faithfulness
context_precision
answer_relevancy / response_relevancy
```

注意：Ragas 属于 LLM-as-judge 评估，需要配置 judge model。未配置模型时，先使用自定义规则评估。

## Bad Case 记录

当发现回答错误时，写入：

```text
evals/bad_cases/bad_cases.jsonl
```

推荐字段：

```json
{
  "id": "badcase-20260419-001",
  "question": "这个实验怎么固定瓶盖？",
  "context": {
    "experiment_id": "science-01",
    "context_step_id": "step8"
  },
  "actual_sources": ["engineering-01_flow_step4_012_01"],
  "expected_sources": ["science-01_materials", "science-01_flow_step8"],
  "problem_type": "wrong_experiment",
  "root_cause": "metadata filter too weak",
  "fix_status": "todo"
}
```

`problem_type` 建议枚举：

```text
wrong_experiment
wrong_doc_type
wrong_step
low_recall
bad_rerank
bad_answer
hallucination
bad_document_quality
frontend_context_missing
```

工作流：

```text
发现问题
  -> 记录 bad case
  -> 判断根因
  -> 修复文档 / 检索 / reranker / prompt
  -> 把问题沉淀为 eval case
  -> 运行 run_rag_eval.py 防止回归
```
