# STEM_Agent

面向小学 STEM 实验课程的 AI 辅助学习平台。

## 功能概览

- 科学探究与工程实践实验流程页面
- 实验步骤、材料、数据记录、报告总结等学习环节
- 悬浮式 AIChat 助手
- FastAPI 后端代理
- Hybrid RAG：FAISS 向量检索、BM25 稀疏检索、RRF 融合、reranker
- SSE 流式回答接口
- RAG 自定义评估集、bad case 记录和 Ragas 数据集导出

## 技术栈

```text
前端：uni-app / Vue / JavaScript / SCSS
后端：Python / FastAPI / Pydantic / Uvicorn
RAG：Markdown KB / FAISS / BM25 / RRF / optional DashScope Qwen
评估：自定义规则评估 / optional Ragas
```

## 目录说明

```text
App.vue                         uni-app 根组件
main.js                         前端入口
pages/                          页面
components/                     实验流程组件
config/                         实验配置与素材路径配置
utils/                          前端 AI 服务、状态、mock KB 等工具
static/                         静态资源目录，只保留目录结构，不提交真实资源文件
backend/                        FastAPI + RAG 后端
backend/knowledge_base/         知识库目录，只保留目录结构，不提交真实知识库内容
backend/evals/                  RAG 评估集与 bad case
```

## 重要说明：静态资源和知识库

为了让 GitHub 仓库保持精简，当前仓库不提交下面两个目录中的真实内容：

```text
static/
backend/knowledge_base/
```

这两个目录只通过 `.gitkeep` 保留目录结构。真实图片、视频、实验素材、Word 原始文档、标准化 Markdown 知识库、向量索引等内容需要通过单独的资源包、网盘、对象存储、GitHub Release 或比赛平台附件提供。

当前 `.gitignore` 策略：

```text
static/**
!static/**/
!static/**/.gitkeep

backend/knowledge_base/**
!backend/knowledge_base/**/
!backend/knowledge_base/**/.gitkeep
```

这意味着：

```text
1. static 下的 jpg、png、mp4 等真实素材不会上传。
2. backend/knowledge_base 下的 raw_docs、experiments、index 等真实知识库内容不会上传。
3. 每个目录中的 .gitkeep 会上传，用于保留目录结构。
4. 如需完整运行实验页面和 RAG，需要先恢复外部资源包和知识库内容。
```

## 后端启动

推荐使用项目根目录脚本：

```powershell
cd D:\AI_Learning\STEM_Agent\STEM_Agent
.\start_ai_proxy.bat
```

脚本会激活 `STEM` conda 环境，并在需要时提示输入 `DASHSCOPE_API_KEY`。

手动启动：

```powershell
cd backend
conda activate STEM
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 3000
```

接口文档：

```text
http://127.0.0.1:3000/docs
```

## 后端验证

```powershell
cd backend
python -m compileall app evals
python evals\run_rag_eval.py
```

RAG 评估报告会输出到：

```text
backend/evals/reports/
```

注意：如果没有恢复 `backend/knowledge_base/` 的真实知识库内容，RAG 检索和评估只能验证接口流程，无法验证真实知识库效果。

## 前端运行

当前前端是 uni-app 项目结构，建议使用 HBuilderX 打开项目根目录并运行到 H5 浏览器。

前端默认请求：

```text
http://127.0.0.1:3000/api/ai/chat
http://127.0.0.1:3000/api/ai/chat/stream
```

注意：如果没有恢复 `static/` 真实素材，页面中依赖本地图片、视频、实验素材的部分可能无法完整展示。

## 环境变量

不要把真实 API Key 写入前端代码或 Git 仓库。

后端示例配置：

```text
backend/.env.example
```

DashScope / 千问运行时使用：

```text
DASHSCOPE_API_KEY
```

由 `start_ai_proxy.bat` 映射到：

```text
STEM_LLM_API_KEY
STEM_EMBEDDING_API_KEY
STEM_RERANKER_API_KEY
```

## 文档

```text
backend/README.md
backend/docs/RAG_PIPELINE.md
backend/evals/README.md
docs/
GITHUB_UPLOAD_MANIFEST.md
GITHUB_UPLOAD_FILELIST.txt
```
