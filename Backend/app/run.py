"""
Run the NeuroNex API. Ensures the backend directory is on sys.path so the `app` module is found.
Run from repo root:  python backend/run.py
Or from backend:    python run.py
"""
import sys
from pathlib import Path

# Add backend directory so "app" package is importable
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
