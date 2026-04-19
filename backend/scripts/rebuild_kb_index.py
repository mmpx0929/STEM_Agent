from __future__ import annotations

import json
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.services.rag_service import rebuild_index  # noqa: E402


if __name__ == "__main__":
    result = rebuild_index()
    print(json.dumps(result, ensure_ascii=False, indent=2))
