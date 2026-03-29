"""
Reading History API routes — powered by Supabase.
Tracks articles viewed by authenticated users.
Replaces SQLite with Supabase for persistent, user-scoped storage.
"""
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from backend.middleware.auth import get_current_user, get_optional_user
from backend.db.supabase_client import get_supabase

router = APIRouter(prefix="/history", tags=["history"])


# NOTE: Run this SQL in Supabase SQL Editor if the reading_history table doesn't exist:
# CREATE TABLE IF NOT EXISTS public.reading_history (
#     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#     user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
#     article_url TEXT NOT NULL,
#     article_title TEXT,
#     article_topic TEXT,
#     article_source TEXT,
#     read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
#     read_progress FLOAT DEFAULT 0,
#     UNIQUE(user_id, article_url)
# );
# CREATE INDEX idx_history_user ON public.reading_history (user_id);
# ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
# CREATE POLICY history_select_own ON public.reading_history FOR SELECT USING (auth.uid() = user_id);
# CREATE POLICY history_insert_own ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);
# CREATE POLICY history_update_own ON public.reading_history FOR UPDATE USING (auth.uid() = user_id);
# CREATE POLICY history_delete_own ON public.reading_history FOR DELETE USING (auth.uid() = user_id);


# Request/Response models
class HistoryEntry(BaseModel):
    article_url: str
    article_title: Optional[str] = None
    article_topic: Optional[str] = None
    article_source: Optional[str] = None
    read_progress: Optional[float] = 0


class HistoryResponse(BaseModel):
    id: str
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
    current_user: dict = Depends(get_current_user),
):
    """Add or update an article in reading history."""
    user_id = current_user["sub"]
    sb = get_supabase()

    payload = {
        "user_id": user_id,
        "article_url": entry.article_url,
        "article_title": entry.article_title,
        "article_topic": entry.article_topic,
        "article_source": entry.article_source,
        "read_progress": entry.read_progress or 0,
    }

    # Upsert: insert or update on conflict (user_id, article_url)
    result = (
        sb.table("reading_history")
        .upsert(payload, on_conflict="user_id,article_url")
        .execute()
    )

    if result.data:
        row = result.data[0]
        return HistoryResponse(
            id=row["id"],
            article_url=row["article_url"],
            article_title=row.get("article_title"),
            article_topic=row.get("article_topic"),
            article_source=row.get("article_source"),
            read_at=row["read_at"],
            read_progress=row.get("read_progress", 0) or 0,
        )

    raise HTTPException(status_code=500, detail="Failed to add history entry")


@router.get("", response_model=HistoryListResponse)
async def get_history(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Get reading history for the authenticated user."""
    user_id = current_user["sub"]
    sb = get_supabase()

    result = (
        sb.table("reading_history")
        .select("*")
        .eq("user_id", user_id)
        .order("read_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    history = [
        HistoryResponse(
            id=row["id"],
            article_url=row["article_url"],
            article_title=row.get("article_title"),
            article_topic=row.get("article_topic"),
            article_source=row.get("article_source"),
            read_at=row["read_at"],
            read_progress=row.get("read_progress", 0) or 0,
        )
        for row in (result.data or [])
    ]

    return HistoryListResponse(history=history, count=len(history))


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_history(
    current_user: dict = Depends(get_current_user),
):
    """Clear all reading history for the authenticated user."""
    user_id = current_user["sub"]
    sb = get_supabase()

    sb.table("reading_history").delete().eq("user_id", user_id).execute()


@router.delete("/{history_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history_entry(
    history_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a specific history entry."""
    user_id = current_user["sub"]
    sb = get_supabase()

    result = (
        sb.table("reading_history")
        .delete()
        .eq("id", history_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History entry not found",
        )
