# STEM Agent Backend

FastAPI backend for the STEM_Agent project.

## Current Phase

Current status:

1. Phase 1 FastAPI skeleton is complete.
2. Phase 2 knowledge base samples are complete for `science-01` and `engineering-01`.
3. Phase 3 minimal RAG is complete:
   - Markdown loader
   - Markdown splitter
   - `chunks.jsonl`
   - local lexical retriever
   - `/api/v1/rag/query`
   - `/api/v1/kb/rebuild`
   - `/api/v1/kb/status`
4. Phase 4 hybrid RAG is complete:
   - local feature-hash embedding
   - optional OpenAI-compatible embedding API
   - `vectors.jsonl`
   - BM25 sparse retrieval
   - vector retrieval
   - FAISS adapter with local JSONL fallback
   - RRF fusion
   - model reranker with local fallback
   - query_type prompt templates
   - optional OpenAI-compatible LLM answer synthesis
   - local answer synthesis fallback
5. Phase 5 streaming and evaluation is complete:
   - `/api/ai/chat/stream` SSE endpoint
   - H5 frontend streaming adapter
   - custom RAG eval cases
   - bad case JSONL template
   - Ragas-compatible dataset export

Architecture document:

```text
docs/RAG_PIPELINE.md
```

Phase 1 goal:

1. Provide a minimal backend service.
2. Expose `/api/v1/health`.
3. Expose `/api/ai/chat` to match the current frontend proxy config.
4. Return a fake assistant answer so the frontend-to-backend link can be tested before RAG and Agent are implemented.

## Run

Recommended startup from the project root:

```powershell
cd D:\AI_Learning\STEM_Agent\STEM_Agent
.\start_ai_proxy.bat
```

The script activates the `STEM` conda environment, asks for `DASHSCOPE_API_KEY` if needed, and starts FastAPI on `http://127.0.0.1:3000`.

Manual startup from this directory:

```powershell
conda activate STEM
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 3000
```

Why port `3000`:

The current frontend config in `utils/config.js` points to:

```text
http://127.0.0.1:3000/api/ai/chat
```

Running the backend on port `3000` lets `AIChat.vue -> utils/aiService.js -> FastAPI` work without changing frontend code.

## Test

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/v1/health
```

Chat test:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:3000/api/ai/chat `
  -ContentType "application/json" `
  -Body '{"message":"你好，我正在学习洗衣机实验","scene":"general"}'
```

SSE chat stream test:

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

Expected SSE events:

```text
event: status
event: metadata
event: token
event: sources
event: done
```

Rebuild knowledge base chunks:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:3000/api/v1/kb/rebuild
```

This also rebuilds:

```text
backend/knowledge_base/index/vectors.jsonl
backend/knowledge_base/index/bm25.json
backend/knowledge_base/index/vectors.jsonl.faiss
backend/knowledge_base/index/vectors.jsonl.faiss.meta.json
```

RAG query:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:3000/api/v1/rag/query `
  -ContentType "application/json" `
  -Body '{"question":"science-01 第8步怎么做？","experiment_id":"science-01","top_k":3}'
```

Index status:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/v1/kb/status
```

CLI rebuild:

```powershell
python scripts\rebuild_kb_index.py
```

Batch import remaining Word documents:

```powershell
python scripts\import_raw_docx_to_kb.py
python scripts\rebuild_kb_index.py
```

Hybrid RAG test with page context as soft context:

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

Expected behavior:

```text
resolved.doc_type = materials
sources should come from science-01 materials chunks, not step8 flow chunks.
```

RAG evaluation:

```powershell
python evals\run_rag_eval.py
```

Outputs:

```text
evals/reports/rag_eval_YYYYMMDD_HHMMSS.json
evals/ragas/ragas_dataset.jsonl
```

Optional Ragas evaluation:

```powershell
python -m pip install ragas datasets
python evals\run_ragas_eval.py
```

The optional Ragas runner is intended for:

```text
faithfulness
context_precision
answer_relevancy / response_relevancy
```

## Conda Environment

Current recommended backend environment:

```text
name = STEM
python = 3.11.15
faiss = 1.10.0
numpy = 2.4.3
```

If normal `conda` commands fail because of plugin issues, use:

```powershell
D:\Anaconda\anaconda\condabin\conda.bat --no-plugins <command>
```

The environment was created with:

```powershell
D:\Anaconda\anaconda\condabin\conda.bat --no-plugins create -n STEM python=3.11 -y --solver classic
D:\Anaconda\anaconda\condabin\conda.bat --no-plugins install -n STEM -c conda-forge faiss-cpu numpy -y --solver classic
D:\Anaconda\anaconda\condabin\conda.bat --no-plugins run -n STEM python -m pip install -r requirements.txt httpx
```

## Optional Model Config

The backend works without external model keys. By default:

```text
embedding = local-feature-hash-v1
answer synthesis = local-synthesis-v1
```

For Qwen / DashScope, run this from the project root:

```powershell
.\start_ai_proxy.bat
```

The script asks for `DASHSCOPE_API_KEY`, maps it to backend environment variables, and starts FastAPI on `http://127.0.0.1:3000`.

To use a real OpenAI-compatible embedding or chat model, configure environment variables based on:

```text
backend/.env.example
```

Important variables:

```text
STEM_EMBEDDING_PROVIDER=openai_compatible
STEM_EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
STEM_EMBEDDING_API_KEY=your-key
STEM_EMBEDDING_MODEL=text-embedding-v4

STEM_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
STEM_LLM_API_KEY=your-key
STEM_LLM_MODEL=qwen-plus
```

If the model call fails and fallback is enabled, the backend will keep the classroom flow running with local synthesis.

## Next

Next phases:

1. Manually standardize auto-extracted `science-02` and `engineering-02..06` knowledge documents.
2. Upgrade `stream_service.py` from answer-slicing SSE to true model-token streaming.
3. Install and configure Ragas judge model, then run `evals\run_ragas_eval.py`.
4. Add Agent tool calling.
5. Add more bad cases and expand the regression eval set.
