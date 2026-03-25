"""
ET Intelligence — FastAPI Backend
Main application entry point with CORS, static files, and route registration.
"""
import os
import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# Load environment variables from project root
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Add project root to sys.path so we can import agents/, data/ etc.
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

app = FastAPI(
    title="ET Pulse API",
    description="AI-powered financial newsroom backend for Economic Times",
    version="0.1.0",
)

# CORS — allow frontend origins
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for videos/audio
static_dir = PROJECT_ROOT / "static"
static_dir.mkdir(exist_ok=True)
(static_dir / "videos").mkdir(exist_ok=True)
(static_dir / "audio").mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# ── Route imports ──
from backend.routes.brief import router as brief_router
from backend.routes.stream import router as stream_router
from backend.routes.followup import router as followup_router
from backend.routes.feed import router as feed_router
from backend.routes.arc import router as arc_router
from backend.audit import router as audit_router
from backend.routes.video import router as video_router
from backend.routes.translate import router as translate_router
from backend.routes.auth import router as auth_router
from backend.routes.bookmarks import router as bookmarks_router
from backend.routes.history import router as history_router
from backend.routes.glossary import router as glossary_router
from backend.routes.related import router as related_router

app.include_router(auth_router, prefix="/api")
app.include_router(bookmarks_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(brief_router, prefix="/api")
app.include_router(stream_router, prefix="/api")
app.include_router(followup_router, prefix="/api")
app.include_router(feed_router, prefix="/api")
app.include_router(arc_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(video_router, prefix="/api")
app.include_router(translate_router, prefix="/api")
app.include_router(glossary_router, prefix="/api")
app.include_router(related_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "ET Pulse API is running", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
