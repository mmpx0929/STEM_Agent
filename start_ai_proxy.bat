@echo off
setlocal
cd /d "%~dp0"

if "%DASHSCOPE_API_KEY%"=="" (
  echo [Warn] DASHSCOPE_API_KEY is empty.
  set /p DASHSCOPE_API_KEY=Please input your DashScope API Key:
)

rem DashScope OpenAI-compatible endpoints.
set STEM_LLM_PROVIDER=openai_compatible
set STEM_LLM_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
set STEM_LLM_API_KEY=%DASHSCOPE_API_KEY%
set STEM_LLM_MODEL=qwen-plus

set STEM_EMBEDDING_PROVIDER=openai_compatible
set STEM_EMBEDDING_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
set STEM_EMBEDDING_API_KEY=%DASHSCOPE_API_KEY%
set STEM_EMBEDDING_MODEL=text-embedding-v4
set STEM_EMBEDDING_DIM=1024
set STEM_EMBEDDING_BATCH_SIZE=10

rem Model reranker uses chat model to reorder chunks. Set to local if cost/latency is a concern.
set STEM_RERANKER_PROVIDER=openai_compatible
set STEM_RERANKER_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
set STEM_RERANKER_API_KEY=%DASHSCOPE_API_KEY%
set STEM_RERANKER_MODEL=qwen-plus

rem Prefer FAISS. If faiss-cpu is unavailable in the current Python env, fallback keeps backend usable.
set STEM_VECTOR_BACKEND=faiss
set STEM_VECTOR_ALLOW_LOCAL_FALLBACK=true
set STEM_SPARSE_BACKEND=bm25
set STEM_FUSION_STRATEGY=rrf

echo [Start] Launching STEM Agent FastAPI backend on http://127.0.0.1:3000 ...
cd /d "%~dp0backend"

set CONDA_ACTIVATE=D:\Anaconda\anaconda\condabin\activate.bat
if exist "%CONDA_ACTIVATE%" (
  echo [Env] Activating conda environment: STEM
  call "%CONDA_ACTIVATE%" STEM
) else (
  echo [Warn] Conda activate script not found. Falling back to current Python.
)

python --version
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 3000
pause
