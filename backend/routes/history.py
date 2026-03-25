"""
Reading History API routes.
Tracks articles viewed by authenticated users.
"""

import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from backend.middleware.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/history", tags=["history"])

# Database path
DB_PATH = Path(__file__).parent.parent.parent / "data" / "history.db"
DB_PATH.parent.mkdir(exist_ok=True)


def _get_connection():
    """Get SQLite connection with WAL mode."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _init_db():
    """Initialize reading history table."""
    conn = _get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS reading_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            article_url TEXT NOT NULL,
            article_title TEXT,
            article_topic TEXT,
            article_source TEXT,
            read_at TEXT NOT NULL,
            read_progress REAL DEFAULT 0,
            UNIQUE(user_id, article_url)
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_history_user_id ON reading_history(user_id)")
    conn.commit()
    conn.close()


# Initialize on import
_init_db()


# Request/Response models
class HistoryEntry(BaseModel):
    article_url: str
    article_title: Optional[str] = None
    article_topic: Optional[str] = None
    article_source: Optional[str] = None
    read_progress: Optional[float] = 0


class HistoryResponse(BaseModel):
    id: int
    article_url: str
    article_title: Optional[str]
    article_topic: Optional[str]
    article_source: Optional[str]
    read_at: str
    read_progress: float


class HistoryListResponse(BaseModel):
    history: List[HistoryResponse]
    count: int


@router.post("", response_model=HistoryResponse, status_code=status.HTTP_201_CREATED)
async def add_to_history(
    entry: HistoryEntry,
    current_user: dict = Depends(get_current_user)
):
    """Add or update an article in reading history."""
    user_id = int(current_user["sub"])
    now = datetime.utcnow().isoformat()

    conn = _get_connection()
    try:
        # Use INSERT OR REPLACE to update if exists
        conn.execute(
            """
            INSERT INTO reading_history (user_id, article_url, article_title, article_topic, article_source, read_at, read_progress)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, article_url) DO UPDATE SET
                read_at = excluded.read_at,
                read_progress = MAX(reading_history.read_progress, excluded.read_progress),
                article_title = COALESCE(excluded.article_title, reading_history.article_title),
                article_topic = COALESCE(excluded.article_topic, reading_history.article_topic),
                article_source = COALESCE(excluded.article_source, reading_history.article_source)
            """,
            (
                user_id,
                entry.article_url,
                entry.article_title,
                entry.article_topic,
                entry.article_source,
                now,
                entry.read_progress or 0
            )
        )
        conn.commit()

        # Fetch the entry
        row = conn.execute(
            "SELECT * FROM reading_history WHERE user_id = ? AND article_url = ?",
            (user_id, entry.article_url)
        ).fetchone()

        return HistoryResponse(
            id=row["id"],
            article_url=row["article_url"],
            article_title=row["article_title"],
            article_topic=row["article_topic"],
            article_source=row["article_source"],
            read_at=row["read_at"],
            read_progress=row["read_progress"] or 0
        )
    finally:
        conn.close()


@router.get("", response_model=HistoryListResponse)
async def get_history(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get reading history for the authenticated user."""
    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        rows = conn.execute(
            """
            SELECT * FROM reading_history
            WHERE user_id = ?
            ORDER BY read_at DESC
            LIMIT ? OFFSET ?
            """,
            (user_id, limit, offset)
        ).fetchall()

        history = [
            HistoryResponse(
                id=row["id"],
                article_url=row["article_url"],
                article_title=row["article_title"],
                article_topic=row["article_topic"],
                article_source=row["article_source"],
                read_at=row["read_at"],
                read_progress=row["read_progress"] or 0
            )
            for row in rows
        ]

        return HistoryListResponse(history=history, count=len(history))
    finally:
        conn.close()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history(
    current_user: dict = Depends(get_current_user)
):
    """Clear all reading history for the authenticated user."""
    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        conn.execute("DELETE FROM reading_history WHERE user_id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history_entry(
    history_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a specific history entry."""
    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        result = conn.execute(
            "DELETE FROM reading_history WHERE id = ? AND user_id = ?",
            (history_id, user_id)
        )
        conn.commit()

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="History entry not found"
            )
    finally:
        conn.close()
