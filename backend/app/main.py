from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.health import router as health_router
from app.api.rag import router as rag_router


app = FastAPI(
    title="STEM Agent Backend",
    version="0.1.0",
    description="FastAPI backend for STEM_Agent RAG and Agent learning project.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "service": "STEM Agent Backend",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/api/v1/health",
        "compatible_chat": "/api/ai/chat",
        "standard_chat": "/api/v1/chat",
        "rag_query": "/api/v1/rag/query",
        "kb_rebuild": "/api/v1/kb/rebuild",
    }


@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    return Response(status_code=204)


app.include_router(health_router)
app.include_router(chat_router)
app.include_router(rag_router)
