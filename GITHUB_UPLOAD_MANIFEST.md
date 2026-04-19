# GitHub 上传清单

生成时间：2026-04-19

## 1. 项目结构与技术栈

项目路径：

```text
D:\AI_Learning\STEM_Agent\STEM_Agent
```

技术栈：

```text
前端：uni-app / Vue / JavaScript / SCSS
后端：Python / FastAPI / Pydantic / Uvicorn
RAG：FAISS / BM25 / RRF / reranker / SSE / optional DashScope Qwen
评估：自定义规则评估 / bad case 记录 / Ragas 兼容数据集导出
运行：HBuilderX 前端 + STEM conda 后端环境
```

根目录：

```text
backend/       FastAPI + RAG 后端
components/    前端实验流程组件
config/        实验配置、素材路径、流程配置
docs/          前端项目说明文档
pages/         uni-app 页面
static/        静态资源目录，只上传 .gitkeep 目录结构
utils/         前端 AI 服务、状态、mock KB、工具函数
App.vue
main.js
manifest.json
pages.json
uni.scss
start_ai_proxy.bat
README.md
```

## 2. 当前上传策略

按你的要求，下面两个目录不上传真实文件，只保留目录结构：

```text
static/
backend/knowledge_base/
```

保留方式：

```text
static/**
!static/**/
!static/**/.gitkeep

backend/knowledge_base/**
!backend/knowledge_base/**/
!backend/knowledge_base/**/.gitkeep
```

实际效果：

```text
1. static 下的图片、视频、实验素材不进入 Git。
2. backend/knowledge_base 下的 Word、Markdown、chunks、vectors、FAISS 索引不进入 Git。
3. 两个目录的所有子目录通过 .gitkeep 保留。
4. 仓库上传后，需要单独恢复素材包和知识库包，才能完整演示前端资源和 RAG 效果。
```

## 3. 已忽略内容

### 依赖和构建产物

```text
node_modules/
.pnpm-store/
unpackage/
dist/
build/
.vite/
```

### Python 缓存与虚拟环境

```text
__pycache__/
*.pyc
.pytest_cache/
.mypy_cache/
.ruff_cache/
.venv/
venv/
env/
ENV/
```

### 静态资源真实内容

```text
static/**
!static/**/
!static/**/.gitkeep
```

说明：图片、视频、素材文件全部忽略，只保留目录结构。

### 知识库真实内容

```text
backend/knowledge_base/**
!backend/knowledge_base/**/
!backend/knowledge_base/**/.gitkeep
```

说明：原始 Word、标准化 Markdown、索引文件、向量文件全部忽略，只保留目录结构。

### 后端生成物

```text
backend/evals/reports/
backend/evals/ragas/*.jsonl
```

保留占位文件：

```text
backend/evals/reports/.gitkeep
backend/evals/ragas/.gitkeep
```

### 敏感配置

```text
.env
.env.*
*.pem
*.key
*.crt
```

保留示例文件：

```text
backend/.env.example
```

### IDE、系统和临时文件

```text
.vscode/
.idea/
.trae/
.DS_Store
Thumbs.db
desktop.ini
*.log
*.tmp
*.bak
```

## 4. 最终候选上传统计

应用 `.gitignore` 后，当前候选上传规模约为：

```text
候选文件数：230
候选大小：约 1.28 MB
```

主要文件类型：

| 类型 | 数量 | 大小 |
|---|---:|---:|
| `.vue` | 32 | 约 0.74 MB |
| `.js` | 40 | 约 0.36 MB |
| `.py` | 34 | 约 0.09 MB |
| `.md` | 10 | 约 0.06 MB |
| `.gitkeep` | 99 | 0 MB |
| `.jsonl` | 2 | 约 0.01 MB |
| `.json` | 3 | 约 0.01 MB |

完整候选文件列表见：

```text
GITHUB_UPLOAD_FILELIST.txt
```

## 5. 必要文件确认

会上传：

```text
前端源码：App.vue / main.js / pages/ / components/ / config/ / utils/
前端配置：manifest.json / pages.json / uni.scss / index.html
后端源码：backend/app/ / backend/scripts/
后端依赖：backend/requirements.txt
评估源码与样例：backend/evals/
项目文档：README.md / backend/README.md / backend/docs/ / backend/evals/README.md / docs/
启动脚本：start_ai_proxy.bat
目录占位：static/**/.gitkeep / backend/knowledge_base/**/.gitkeep
```

不会上传：

```text
static/ 下的真实图片、视频、素材
backend/knowledge_base/ 下的真实知识库内容
backend/knowledge_base/raw_docs/ 下的 Word 原始文档
backend/knowledge_base/index/ 下的索引和向量文件
真实 .env 和 API Key
构建产物、依赖包、缓存、日志
```

## 6. 上传后的运行注意事项

上传到 GitHub 后，仓库本身是精简源码版。

如果需要完整演示：

```text
1. 恢复 static/ 资源包。
2. 恢复 backend/knowledge_base/ 知识库包。
3. 在 backend/knowledge_base 内容恢复后，重新构建 RAG 索引。
4. 设置 DASHSCOPE_API_KEY 或使用本地模型配置。
5. 启动 FastAPI 后端和 uni-app 前端。
```

如果没有恢复外部资源：

```text
1. 前端源码可以查看和运行，但图片、视频、实验素材可能缺失。
2. 后端接口可以启动，但 RAG 检索无法基于真实知识库回答。
3. 评估流程可以验证代码路径，但真实指标没有业务意义。
```

## 7. Git 操作指南

在项目根目录执行：

```powershell
cd D:\AI_Learning\STEM_Agent\STEM_Agent
git status --ignored --short
git add .
git status --short
git commit -m "Prepare STEM Agent for GitHub competition upload"
```

创建 GitHub 空仓库后：

```powershell
git remote add origin https://github.com/<your-name>/<repo-name>.git
git branch -M main
git push -u origin main
```

如果已经配置过 `origin`：

```powershell
git remote -v
git push -u origin main
```
