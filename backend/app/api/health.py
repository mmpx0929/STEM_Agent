from datetime import datetime, timezone

from fastapi import APIRouter


router = APIRouter(tags=["health"])


@router.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "stem-agent-backend",
        "phase": "phase-1-fastapi-skeleton",
        "time": datetime.now(timezone.utc).isoformat(),
    }
