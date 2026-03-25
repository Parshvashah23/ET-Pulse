"""
Bookmarks API routes.
Allows authenticated users to save and manage bookmarked articles.
"""

import sqlite3
from pathlib import Path
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from backend.middleware.auth import get_current_user, get_optional_user

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

# Database path
DB_PATH = Path(__file__).parent.parent.parent / "data" / "bookmarks.db"
DB_PATH.parent.mkdir(exist_ok=True)


def _get_connection():
    """Get SQLite connection with WAL mode."""
    conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _init_db():
    """Initialize bookmarks table."""
    conn = _get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            article_url TEXT NOT NULL,
            article_title TEXT,
            article_topic TEXT,
            article_source TEXT,
            article_date TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(user_id, article_url)
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id)")
    conn.commit()
    conn.close()


# Initialize on import
_init_db()


# Request/Response models
class BookmarkCreate(BaseModel):
    article_url: str
    article_title: Optional[str] = None
    article_topic: Optional[str] = None
    article_source: Optional[str] = None
    article_date: Optional[str] = None


class BookmarkResponse(BaseModel):
    id: int
    article_url: str
    article_title: Optional[str]
    article_topic: Optional[str]
    article_source: Optional[str]
    article_date: Optional[str]
    created_at: str


class BookmarksListResponse(BaseModel):
    bookmarks: List[BookmarkResponse]
    count: int


class BookmarkStatusResponse(BaseModel):
    is_bookmarked: bool
    bookmark_id: Optional[int] = None


@router.post("", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    bookmark: BookmarkCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a new bookmark for the authenticated user."""
    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO bookmarks (user_id, article_url, article_title, article_topic, article_source, article_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                bookmark.article_url,
                bookmark.article_title,
                bookmark.article_topic,
                bookmark.article_source,
                bookmark.article_date,
                datetime.utcnow().isoformat()
            )
        )
        conn.commit()
        bookmark_id = cursor.lastrowid

        # Fetch the created bookmark
        row = conn.execute(
            "SELECT * FROM bookmarks WHERE id = ?", (bookmark_id,)
        ).fetchone()

        return BookmarkResponse(
            id=row["id"],
            article_url=row["article_url"],
            article_title=row["article_title"],
            article_topic=row["article_topic"],
            article_source=row["article_source"],
            article_date=row["article_date"],
            created_at=row["created_at"]
        )
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Article already bookmarked"
        )
    finally:
        conn.close()


@router.get("", response_model=BookmarksListResponse)
async def get_bookmarks(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get all bookmarks for the authenticated user."""
    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        rows = conn.execute(
            """
            SELECT * FROM bookmarks
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (user_id, limit, offset)
        ).fetchall()

        bookmarks = [
            BookmarkResponse(
                id=row["id"],
                article_url=row["article_url"],
                article_title=row["article_title"],
                article_topic=row["article_topic"],
                article_source=row["article_source"],
                article_date=row["article_date"],
                created_at=row["created_at"]
            )
            for row in rows
        ]

        return BookmarksListResponse(bookmarks=bookmarks, count=len(bookmarks))
    finally:
        conn.close()


@router.get("/check", response_model=BookmarkStatusResponse)
async def check_bookmark(
    article_url: str,
    current_user: dict = Depends(get_optional_user)
):
    """Check if an article is bookmarked by the current user."""
    if not current_user:
        return BookmarkStatusResponse(is_bookmarked=False)

    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        row = conn.execute(
            "SELECT id FROM bookmarks WHERE user_id = ? AND article_url = ?",
            (user_id, article_url)
        ).fetchone()

        if row:
            return BookmarkStatusResponse(is_bookmarked=True, bookmark_id=row["id"])
        return BookmarkStatusResponse(is_bookmarked=False)
    finally:
        conn.close()


@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a bookmark."""
    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        # Verify ownership
        row = conn.execute(
            "SELECT id FROM bookmarks WHERE id = ? AND user_id = ?",
            (bookmark_id, user_id)
        ).fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bookmark not found"
            )

        conn.execute("DELETE FROM bookmarks WHERE id = ?", (bookmark_id,))
        conn.commit()
    finally:
        conn.close()


@router.delete("/url/{article_url:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark_by_url(
    article_url: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a bookmark by article URL."""
    user_id = int(current_user["sub"])

    conn = _get_connection()
    try:
        result = conn.execute(
            "DELETE FROM bookmarks WHERE user_id = ? AND article_url = ?",
            (user_id, article_url)
        )
        conn.commit()

        if result.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bookmark not found"
            )
    finally:
        conn.close()
