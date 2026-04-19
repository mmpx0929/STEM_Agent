# STEM_Agent 模块化 Hybrid RAG 流程文档

本文档描述 `STEM_Agent` 后端当前的模块化 Hybrid RAG 架构，参考 `all-in-rag/code/C8/rag_modules` 的分层方式，将 RAG 拆成：

```text
数据准备
索引构建
检索优化
生成集成
API 编排
前端耦合
```

当前实现默认不依赖外部模型：

```text
向量索引：FAISS 优先，缺少依赖时可回退 local_jsonl
稀疏索引：BM25
融合策略：RRF
生成：local-synthesis-v1
```

后续可通过环境变量接入真实 embedding 模型、FAISS、reranker 和大语言模型。

## 1. 总体流程

### 离线阶段：构建知识库

```text
Markdown 实验文档
  -> 加载
  -> 清洗
  -> Markdown 结构感知切块
  -> 元数据增强
  -> embedding
  -> local_jsonl / FAISS 预留向量索引
  -> BM25 稀疏索引
  -> 持久化
```

### 在线阶段：回答问题

```text
用户问题 + 页面上下文
  -> 查询理解 / 查询改写 / 查询路由
  -> metadata filter
  -> 向量检索
  -> BM25 检索
  -> RRF 融合
  -> reranker 重排
  -> 获取相关上下文
  -> LLM / local synthesis 生成回答
  -> 返回 answer + sources
```

## 2. 模块对应关系

| all-in-rag C8 模块 | STEM_Agent 当前模块 | 职责 |
|---|---|---|
| `data_preparation.py` | `app/rag/markdown_loader.py` + `app/rag/splitter.py` | 加载 Markdown 实验文档，按标题和 Step 切块，生成 chunk metadata |
| `index_construction.py` | `app/rag/index_manager.py` + `app/rag/embedding_client.py` + `app/rag/vector_store.py` | 构建 `chunks.jsonl`、`vectors.jsonl`、`bm25.json` |
| `retrieval_optimization.py` | `app/rag/query_analyzer.py` + `app/rag/bm25_retriever.py` + `app/rag/hybrid_retriever.py` + `app/rag/reranker.py` | 查询理解、BM25 检索、向量检索、RRF 融合、重排 |
| `generation_integration.py` | `app/services/llm_service.py` + `app/rag/context_builder.py` | 构造上下文，调用真实 LLM 或本地综合生成 |
| `main.py` | `app/services/rag_service.py` + `app/api/chat.py` + `app/api/rag.py` | API 编排和前后端协议 |
| `config.py` | `app/core/config.py` + `.env.example` | 统一配置路径、检索参数、模型接入口 |

## 3. 离线阶段实现

### 3.1 加载 Markdown 实验文档

实现文件：

```text
app/rag/markdown_loader.py
```

输入目录：

```text
knowledge_base/experiments/
  science-01/
    flow.md
    materials.md
    concepts.md
    safety.md
    qa.md
  engineering-01/
    ...
```

职责：

```text
读取每个实验目录下的 Markdown 文档
识别 experiment_id、experiment_type、doc_type、experiment_title
生成 MarkdownDocument
```

### 3.2 Markdown 结构感知切块

实现文件：

```text
app/rag/splitter.py
```

职责：

```text
按 Markdown heading 切分 section
识别 Step N 并写入 step_id
跳过文档用途、推荐检索提示等管理性段落
长文本按 max_chars 切分
生成 Chunk
```

关键 metadata：

```text
chunk_id
experiment_id
experiment_type
experiment_title
doc_type
step_id
title
heading_path
source
text
```

### 3.3 构建 chunks、vectors、BM25 索引

实现文件：

```text
app/rag/index_manager.py
```

职责：

```text
rebuild_index()
  -> load_experiment_documents()
  -> split_documents()
  -> write chunks.jsonl
  -> build vectors.jsonl
  -> build bm25.json
  -> write metadata.json
```

输出文件：

```text
knowledge_base/index/chunks.jsonl
knowledge_base/index/vectors.jsonl
knowledge_base/index/bm25.json
knowledge_base/index/metadata.json
```

触发方式：

```powershell
cd D:\AI_Learning\STEM_Agent\STEM_Agent\backend
python scripts\rebuild_kb_index.py
```

或：

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:3000/api/v1/kb/rebuild
```

## 4. 索引构建实现

### 4.1 Embedding 接口

实现文件：

```text
app/rag/embedding_client.py
```

当前默认：

```text
provider = local
model = local-feature-hash-v1
```

默认模式使用本地 feature-hash embedding：

```text
text -> tokenize -> semantic group expansion -> stable hash -> vector -> normalize
```

真实 embedding 预留接口：

```text
STEM_EMBEDDING_PROVIDER=openai_compatible
STEM_EMBEDDING_BASE_URL=https://your-provider-compatible-base/v1
STEM_EMBEDDING_API_KEY=your-key
STEM_EMBEDDING_MODEL=your-embedding-model
```

千问 / DashScope 推荐配置：

```text
STEM_EMBEDDING_PROVIDER=openai_compatible
STEM_EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
STEM_EMBEDDING_API_KEY=%DASHSCOPE_API_KEY%
STEM_EMBEDDING_MODEL=text-embedding-v4
STEM_EMBEDDING_DIM=1024
STEM_EMBEDDING_BATCH_SIZE=10
```

### 4.2 向量索引

实现文件：

```text
app/rag/vector_store.py
```

当前默认：

```text
STEM_VECTOR_BACKEND=faiss
```

职责：

```text
chunk_embedding_text()
write_vectors()
read_vectors()
build_vector_index()
VectorStore.search()
```

FAISS 预留方式：

```text
STEM_VECTOR_BACKEND=faiss
STEM_VECTOR_ALLOW_LOCAL_FALLBACK=true
```

当前已提供 `app/rag/faiss_vector_store.py` adapter。若当前 Python 环境没有可用 `faiss`/`numpy`，且 `STEM_VECTOR_ALLOW_LOCAL_FALLBACK=true`，系统会回退到 `local_jsonl`，保证后端可运行。

```text
app/rag/faiss_vector_store.py
knowledge_base/index/vectors.jsonl.faiss
knowledge_base/index/vectors.jsonl.faiss.meta.json
```

Windows + Python 3.13 环境下 `faiss-cpu` 可能没有直接可用 wheel。若安装失败，建议使用 Conda 环境或降级到 FAISS 支持的 Python 版本。

### 4.3 BM25 稀疏索引

实现文件：

```text
app/rag/bm25_retriever.py
```

职责：

```text
build_sparse_index() -> bm25.json
BM25Retriever.search()
```

BM25 适合：

```text
材料名
实验编号
Step 编号
精确术语
标题关键词
```

Embedding 适合：

```text
同义表达
模糊问法
自然语言问题
```

## 5. 在线阶段实现

### 5.1 查询理解 / 查询路由

实现文件：

```text
app/rag/query_analyzer.py
```

输入：

```text
question
experiment_id
doc_type
step_id
context_step_id
scene
page_context
```

输出：

```text
QueryContext
```

核心规则：

```text
用户显式问题意图优先于页面上下文
experiment_id 可以强过滤
用户显式 step_id 可以强过滤
doc_type 意图可以强过滤
current_step 只作为 context_step_id 软上下文
```

示例：

```text
问题：科学实验1的虚拟操作怎么做
解析：science-01 / flow / step8

问题：这个实验需要哪些材料，页面在 step8
解析：science-01 / materials / step_id=None / context_step_id=step8

问题：为什么高速时五角星飞得更远，页面在 step8
解析：science-01 / concepts / step_id=None / context_step_id=step8
```

### 5.2 向量检索 + BM25 检索 + RRF 融合

实现文件：

```text
app/rag/hybrid_retriever.py
```

流程：

```text
QueryContext
  -> VectorStore.search()
  -> BM25Retriever.search()
  -> reciprocal_rank_fusion()
  -> fused candidates
```

RRF 融合原因：

```text
向量检索分数和 BM25 分数尺度不同
直接加权容易不稳定
RRF 基于排名，适合融合不同检索器
```

### 5.3 Reranker 重排

实现文件：

```text
app/rag/reranker.py
```

当前是本地规则 reranker，考虑：

```text
hybrid score
词法相似度
标题命中
doc_type 命中
显式 step_id 命中
context_step_id 轻微加权
```

真实 reranker 预留建议：

```text
app/rag/model_reranker.py
```

环境变量可扩展：

```text
STEM_RERANKER_PROVIDER=openai_compatible
STEM_RERANKER_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
STEM_RERANKER_API_KEY=%DASHSCOPE_API_KEY%
STEM_RERANKER_MODEL=qwen-plus
STEM_RERANKER_ALLOW_LOCAL_FALLBACK=true
```

当前模型 reranker 使用 chat model 对候选 chunk_id 排序。后续如果接入专门 rerank 模型，应新增独立 adapter，避免用生成模型承担重排。

### 5.4 上下文构建

实现文件：

```text
app/rag/context_builder.py
```

职责：

```text
build_sources()
build_retrieval_debug()
```

其中 `sources` 返回给前端，用于展示回答来源。

### 5.5 LLM 生成

实现文件：

```text
app/services/llm_service.py
```

当前模式：

```text
未配置 API Key -> local-synthesis-v1
配置 API Key -> OpenAI-compatible chat completions
```

真实 LLM 接口：

```text
STEM_LLM_BASE_URL=https://your-provider-compatible-base/v1
STEM_LLM_API_KEY=your-key
STEM_LLM_MODEL=your-chat-model
```

千问 / DashScope 推荐配置：

```text
STEM_LLM_PROVIDER=openai_compatible
STEM_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
STEM_LLM_API_KEY=%DASHSCOPE_API_KEY%
STEM_LLM_MODEL=qwen-plus
```

生成阶段会根据 `query_type` 选择 prompt template：

```text
operation  -> 操作指导
materials  -> 材料清单
concepts   -> 原理解释
safety     -> 安全提醒
report     -> 报告写作
general    -> 普通问答
```

实现文件：

```text
app/rag/prompt_templates.py
app/services/llm_service.py
```

## 6. API 编排

### 6.1 RAG Service

实现文件：

```text
app/services/rag_service.py
```

职责：

```text
query_knowledge_base()
  -> get_chunks()
  -> analyze_query()
  -> HybridRetriever.retrieve()
  -> rerank_chunks()
  -> synthesize_rag_answer()
  -> build_sources()
  -> build_retrieval_debug()
```

`rag_service.py` 只做编排，不再承载具体检索实现。

### 6.2 RAG API

实现文件：

```text
app/api/rag.py
app/schemas/rag.py
```

接口：

```text
GET  /api/v1/kb/status
POST /api/v1/kb/rebuild
POST /api/v1/rag/query
```

### 6.3 Chat API

实现文件：

```text
app/api/chat.py
app/schemas/chat.py
```

接口：

```text
POST /api/ai/chat
POST /api/ai/chat/stream
POST /api/v1/chat
```

前端兼容接口使用：

```text
/api/ai/chat
```

返回平台：

```text
fastapi-rag-local：RAG + 本地综合回答
fastapi-rag-llm：RAG + 真实 LLM 生成回答
fastapi-fake：未命中 RAG 时的后端兜底
```

### 6.4 Chat Stream API

实现文件：

```text
app/api/chat.py
app/services/stream_service.py
```

接口：

```text
POST /api/ai/chat/stream
```

响应类型：

```text
text/event-stream
```

当前事件：

```text
status    检索/生成阶段状态
metadata  platform、model、retrieval debug
token     回答增量文本
sources   RAG 来源
done      完整回答和最终元数据
error     错误信息
```

第一版流式实现复用现有 RAG pipeline：

```text
ChatRequest
  -> query_knowledge_base()
  -> 得到完整 answer / sources / retrieval
  -> stream_service.py 将 answer 切成 token 事件
  -> 前端逐段追加显示
```

这个版本先打通 SSE 协议和前端逐段渲染。后续如果要接模型原生流式输出，只需要在 `llm_service.py` 增加 streaming chat completions adapter，再让 `stream_service.py` 直接转发模型 token。

## 7. 前端耦合

### 7.1 请求入口

实现文件：

```text
utils/aiService.js
pages/plan/components/AIChat.vue
```

前端发送：

```json
{
  "message": "虚拟操作怎么做",
  "scene": "virtualLab",
  "pageContext": "experiment-flow",
  "experiment_id": "science-01",
  "current_step": "step8"
}
```

其中：

```text
experiment_id -> 后端强过滤
current_step -> 后端 context_step_id 软上下文
scene/pageContext -> 后端查询理解辅助信息
```

### 7.2 响应展示

实现文件：

```text
pages/plan/components/AIChat.vue
utils/aiService.js
```

前端现在保留并展示：

```text
platform
model
sources
```

每条 AI 回答最多展示 3 条来源，便于判断回答是否来自正确实验、正确文档和正确步骤。

### 7.3 前端流式接入

实现文件：

```text
utils/config.js
utils/aiService.js
pages/plan/components/AIChat.vue
```

配置：

```text
COMMON_CONFIG.enableStreaming = true
PROXY_CONFIG.streamPath = /api/ai/chat/stream
```

前端 H5 环境使用：

```text
fetch()
  -> response.body.getReader()
  -> TextDecoder
  -> 解析 SSE event/data
  -> token 事件更新当前 assistant message
  -> sources/done 事件补齐 sources、platform、model
```

如果运行环境不支持 fetch stream，会自动回退到普通 `/api/ai/chat`。

## 8. 配置入口

实现文件：

```text
app/core/config.py
backend/.env.example
```

关键配置：

```text
STEM_VECTOR_BACKEND=faiss
STEM_VECTOR_ALLOW_LOCAL_FALLBACK=true
STEM_SPARSE_BACKEND=bm25
STEM_FUSION_STRATEGY=rrf
STEM_RRF_K=60

STEM_EMBEDDING_PROVIDER=local
STEM_EMBEDDING_BASE_URL=
STEM_EMBEDDING_API_KEY=
STEM_EMBEDDING_MODEL=local-feature-hash-v1
STEM_EMBEDDING_DIM=384
STEM_EMBEDDING_BATCH_SIZE=10

STEM_RERANKER_PROVIDER=local
STEM_RERANKER_BASE_URL=
STEM_RERANKER_API_KEY=
STEM_RERANKER_MODEL=qwen-plus

STEM_LLM_BASE_URL=
STEM_LLM_API_KEY=
STEM_LLM_MODEL=qwen-turbo
```

项目根目录提供一键启动脚本：

```text
start_ai_proxy.bat
```

该脚本会读取或提示输入 `DASHSCOPE_API_KEY`，设置千问相关环境变量，并启动 FastAPI：

```text
http://127.0.0.1:3000
```

## 8.1 批量导入剩余 Word 实验文档

实现文件：

```text
scripts/import_raw_docx_to_kb.py
```

用途：

```text
读取 knowledge_base/raw_docs/*.docx
自动提取 Word 文本
生成 experiments/{experiment_id}/flow.md
生成 materials.md / concepts.md / safety.md / qa.md
生成 metadata.json
```

当前已生成：

```text
science-02
engineering-02
engineering-03
engineering-04
engineering-05
engineering-06
```

注意：这些文档是自动提取草稿，已经纳入 RAG 索引，但还需要人工标准化。

## 9. 验证命令

### 编译检查

```powershell
cd D:\AI_Learning\STEM_Agent\STEM_Agent\backend
python -m compileall app
```

### 重建索引

```powershell
python scripts\rebuild_kb_index.py
```

### 查询知识库状态

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/v1/kb/status
```

### 验证 RAG Query

```powershell
$body = @{
  question = "这个实验需要哪些材料"
  experiment_id = "science-01"
  context_step_id = "step8"
  top_k = 3
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:3000/api/v1/rag/query `
  -ContentType "application/json" `
  -Body $body
```

期望：

```text
retrieval.query.type = materials
sources = science-01_materials_*
```

### 验证前端兼容 Chat

```powershell
$body = @{
  message = "虚拟操作怎么做"
  scene = "virtualLab"
  experiment_id = "science-01"
  current_step = "step8"
  pageContext = "experiment-flow"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:3000/api/ai/chat `
  -ContentType "application/json" `
  -Body $body
```

期望：

```text
platform = fastapi-rag-local 或 fastapi-rag-llm
sources 包含 science-01 / flow / step8
```

### 验证 Chat Stream

```powershell
$body = @{
  message = "这个实验需要哪些材料"
  scene = "virtualLab"
  experiment_id = "science-01"
  current_step = "step8"
} | ConvertTo-Json -Depth 5

Invoke-WebRequest `
  -Method Post `
  -Uri http://127.0.0.1:3000/api/ai/chat/stream `
  -ContentType "application/json" `
  -Body $body
```

期望包含：

```text
event: status
event: metadata
event: token
event: sources
event: done
```

## 10. RAG 评估流程

实现目录：

```text
evals/
  README.md
  run_rag_eval.py
  run_ragas_eval.py
  cases/rag_eval_cases.jsonl
  bad_cases/bad_cases.jsonl
  reports/
  ragas/ragas_dataset.jsonl
```

### 10.1 自定义规则评估

运行：

```powershell
cd D:\AI_Learning\STEM_Agent\STEM_Agent\backend
conda activate STEM
python evals\run_rag_eval.py
```

当前评估指标：

```text
query_type_accuracy
experiment_id_accuracy
doc_type_accuracy
step_id_accuracy
source_hit_rate
answer_keyword_accuracy
latency_ms
```

当前评估集：

```text
20 条 eval cases
覆盖 science-01、science-02、engineering-01..06
覆盖 materials / operation / concepts / safety / report / flow
```

最近一次验证：

```text
total = 20
passed = 20
pass_rate = 1.0
query_type_accuracy = 1.0
experiment_id_accuracy = 1.0
doc_type_accuracy = 1.0
step_id_accuracy = 1.0
source_hit_rate = 1.0
answer_keyword_accuracy = 1.0
```

报告输出：

```text
evals/reports/rag_eval_YYYYMMDD_HHMMSS.json
```

### 10.2 Bad Case 记录

记录文件：

```text
evals/bad_cases/bad_cases.jsonl
```

问题类型建议：

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
发现错误回答
  -> 写入 bad_cases.jsonl
  -> 分析 root_cause
  -> 修复文档 / 检索 / reranker / prompt
  -> 转成 rag_eval_cases.jsonl 中的固定用例
  -> 每次改动后运行 run_rag_eval.py
```

### 10.3 Ragas 格式导出

`run_rag_eval.py` 会把同一批 eval cases 导出为：

```text
evals/ragas/ragas_dataset.jsonl
```

格式：

```json
{
  "user_input": "科学实验1需要哪些材料？",
  "response": "RAG 生成回答",
  "retrieved_contexts": ["chunk text"],
  "reference": "期望回答覆盖关键词：材料；期望回答基于来源：science-01_materials",
  "reference_contexts": ["chunk text"],
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

目标指标：

```text
faithfulness
context_precision
answer_relevancy / response_relevancy
```

## 11. 后续扩展点

已完成接入口：

1. `STEM_VECTOR_BACKEND=faiss`：FAISS 优先，`local_jsonl` fallback。
2. `STEM_EMBEDDING_PROVIDER=openai_compatible`：可接入真实 embedding。
3. `STEM_RERANKER_PROVIDER=openai_compatible`：可接入模型 reranker。
4. `prompt_templates.py`：已按 `query_type` 选择 prompt template。
5. `start_ai_proxy.bat`：已按 DashScope / 千问 OpenAI-compatible 方式设置后端环境变量。
6. `/api/ai/chat/stream`：已完成 SSE 后端接口和 H5 前端流式接入。
7. `evals/`：已完成自定义评估集、bad case 记录、Ragas 格式导出和可选 Ragas runner。

仍需继续推进：

1. 使用真实 `DASHSCOPE_API_KEY` 启动后端并重建索引，让 embedding / LLM / reranker 全部走真实模型。
2. 人工标准化自动导入的 `science-02`、`engineering-02` 到 `engineering-06` 文档。
3. 将 `stream_service.py` 从“完整回答后切片流式”升级为“模型原生 token 流式”。
4. 安装并配置 Ragas judge model，运行 `faithfulness`、`context_precision`、`answer_relevancy`。
5. 增加更多 bad cases，形成长期回归评估集。
