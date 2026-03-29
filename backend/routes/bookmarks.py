"""
Bookmarks API routes — powered by Supabase.
Allows authenticated users to save and manage bookmarked articles.
Replaces SQLite with Supabase for persistent, user-scoped storage.
"""
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel

from backend.middleware.auth import get_current_user, get_optional_user
from backend.db.supabase_client import get_supabase

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


# ─────────────────────────────────────────────────────────────────────────────
# Supabase Schema: We need a bookmarks table. Adding migration inline:
# This was not in the original schema — creating it now.
# ─────────────────────────────────────────────────────────────────────────────

# NOTE: Run this SQL in Supabase SQL Editor if the bookmarks table doesn't exist:
# CREATE TABLE IF NOT EXISTS public.bookmarks (
#     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
#     user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
#     article_url TEXT NOT NULL,
#     article_title TEXT,
#     article_topic TEXT,
#     article_source TEXT,
#     article_date TEXT,
#     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
#     UNIQUE(user_id, article_url)
# );
# CREATE INDEX idx_bookmarks_user ON public.bookmarks (user_id);
# ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
# CREATE POLICY bookmarks_select_own ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
# CREATE POLICY bookmarks_insert_own ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
# CREATE POLICY bookmarks_delete_own ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);


# Request/Response models
class BookmarkCreate(BaseModel):
    article_url: str
    article_title: Optional[str] = None
    article_topic: Optional[str] = None
    article_source: Optional[str] = None
    article_date: Optional[str] = None


class BookmarkResponse(BaseModel):
    id: str
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
    bookmark_id: Optional[str] = None


@router.post("", response_model=BookmarkResponse, status_code=status.HTTP_201_CREATED)
async def create_bookmark(
    bookmark: BookmarkCreate,
    current_user: dict = Depends(get_current_user),
):
    """Add a new bookmark for the authenticated user."""
    user_id = current_user["sub"]
    sb = get_supabase()

    payload = {
        "user_id": user_id,
        "article_url": bookmark.article_url,
        "article_title": bookmark.article_title,
        "article_topic": bookmark.article_topic,
        "article_source": bookmark.article_source,
        "article_date": bookmark.article_date,
    }

    try:
        result = sb.table("bookmarks").insert(payload).execute()
        if result.data:
            row = result.data[0]
            return BookmarkResponse(
                id=row["id"],
                article_url=row["article_url"],
                article_title=row.get("article_title"),
                article_topic=row.get("article_topic"),
                article_source=row.get("article_source"),
                article_date=row.get("article_date"),
                created_at=row["created_at"],
            )
        raise HTTPException(status_code=500, detail="Insert returned no data")
    except HTTPException:
        raise
    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Article already bookmarked",
            )
        raise HTTPException(status_code=500, detail=f"Bookmark creation failed: {e}")


@router.get("", response_model=BookmarksListResponse)
async def get_bookmarks(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Get all bookmarks for the authenticated user."""
    user_id = current_user["sub"]
    sb = get_supabase()

    result = (
        sb.table("bookmarks")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )

    bookmarks = [
        BookmarkResponse(
            id=row["id"],
            article_url=row["article_url"],
            article_title=row.get("article_title"),
            article_topic=row.get("article_topic"),
            article_source=row.get("article_source"),
            article_date=row.get("article_date"),
            created_at=row["created_at"],
        )
        for row in (result.data or [])
    ]

    return BookmarksListResponse(bookmarks=bookmarks, count=len(bookmarks))


@router.get("/check", response_model=BookmarkStatusResponse)
async def check_bookmark(
    article_url: str,
    current_user: dict = Depends(get_optional_user),
):
    """Check if an article is bookmarked by the current user."""
    if not current_user:
        return BookmarkStatusResponse(is_bookmarked=False)

    user_id = current_user["sub"]
    sb = get_supabase()

    result = (
        sb.table("bookmarks")
        .select("id")
        .eq("user_id", user_id)
        .eq("article_url", article_url)
        .execute()
    )

    if result.data:
        return BookmarkStatusResponse(
            is_bookmarked=True,
            bookmark_id=result.data[0]["id"],
        )
    return BookmarkStatusResponse(is_bookmarked=False)


@router.delete("/{bookmark_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark(
    bookmark_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a bookmark by ID."""
    user_id = current_user["sub"]
    sb = get_supabase()

    # Verify ownership and delete
    result = (
        sb.table("bookmarks")
        .delete()
        .eq("id", bookmark_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found",
        )


@router.delete("/url/{article_url:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bookmark_by_url(
    article_url: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a bookmark by article URL."""
    user_id = current_user["sub"]
    sb = get_supabase()

    result = (
        sb.table("bookmarks")
        .delete()
        .eq("user_id", user_id)
        .eq("article_url", article_url)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bookmark not found",
        )
