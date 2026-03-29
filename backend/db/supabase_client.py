"""
ET Pulse — Supabase Python Integration
FastAPI-compatible async client using supabase-py + httpx.

Provides typed helper functions for the three key operations:
  (a) Insert a new feed item with relevance score
  (b) Query all story arc agent outputs for a given story_id
  (c) Log an agent run to the observability table

Usage:
  from backend.db.supabase_client import (
      get_supabase,
      insert_feed_item,
      get_story_agent_outputs,
      log_agent_run,
  )
"""

import os
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────────────
# Supabase Client Singleton
# ─────────────────────────────────────────────────────────────────────────────

_env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=_env_path)

SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_KEY"]

_client: Optional[Client] = None


def get_supabase() -> Client:
    """
    Returns a singleton Supabase client using the service-role key.
    The service role key bypasses RLS — use this ONLY in the backend.
    Never expose this key to the frontend.
    """
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _client


# ─────────────────────────────────────────────────────────────────────────────
# (a) Insert a new feed item with relevance score
# ─────────────────────────────────────────────────────────────────────────────

async def insert_feed_item(
    user_id: str,
    article_id: str,
    relevance_score: float,
    justification: str,
) -> dict:
    """
    Insert a scored feed item for a user.
    Called by the Curation Agent after scoring an article against a user persona.

    Args:
        user_id:         UUID string of the authenticated user
        article_id:      UUID string of the article from public.articles
        relevance_score: Float [0.0, 1.0] — how relevant this article is to the user
        justification:   Agent-generated explanation of why this article matters

    Returns:
        The inserted row as a dict, or raises on conflict (user already has this article).
    """
    sb = get_supabase()
    payload = {
        "user_id": user_id,
        "article_id": article_id,
        "relevance_score": round(relevance_score, 4),
        "justification": justification,
        "is_read": False,
        "is_saved": False,
        "served_at": datetime.now(timezone.utc).isoformat(),
    }

    result = sb.table("feed_items").insert(payload).execute()

    if result.data:
        return result.data[0]
    raise Exception(f"Feed item insert failed: {result}")


async def bulk_insert_feed_items(
    user_id: str,
    scored_articles: list[dict],
) -> list[dict]:
    """
    Bulk insert multiple scored feed items for a user.
    Each dict in scored_articles must have: article_id, relevance_score, justification.

    Uses upsert to handle re-scoring of existing articles gracefully.
    """
    sb = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    payloads = [
        {
            "user_id": user_id,
            "article_id": item["article_id"],
            "relevance_score": round(item["relevance_score"], 4),
            "justification": item.get("justification", ""),
            "is_read": False,
            "is_saved": False,
            "served_at": now,
        }
        for item in scored_articles
    ]

    result = (
        sb.table("feed_items")
        .upsert(payloads, on_conflict="user_id,article_id")
        .execute()
    )

    return result.data or []


# ─────────────────────────────────────────────────────────────────────────────
# (b) Query all story arc agent outputs for a given story_id
# ─────────────────────────────────────────────────────────────────────────────

async def get_story_agent_outputs(story_id: str) -> dict:
    """
    Retrieve all 5 agent outputs for a given story, grouped by agent_type.
    Returns the most recent run for each agent type.

    Args:
        story_id: UUID string of the story from public.stories

    Returns:
        Dict keyed by agent_type with output_json and metadata:
        {
            "timeline":    {"output_json": {...}, "latency_ms": 1200, "run_at": "..."},
            "key_players": {"output_json": {...}, "latency_ms": 980,  "run_at": "..."},
            "sentiment":   {"output_json": {...}, "latency_ms": 1100, "run_at": "..."},
            "predictions": {"output_json": {...}, "latency_ms": 1050, "run_at": "..."},
            "contrarian":  {"output_json": {...}, "latency_ms": 900,  "run_at": "..."},
        }
    """
    sb = get_supabase()

    result = (
        sb.table("story_agent_outputs")
        .select("output_id, story_id, agent_type, output_json, latency_ms, run_at")
        .eq("story_id", story_id)
        .order("run_at", desc=True)
        .execute()
    )

    if not result.data:
        return {}

    # Group by agent_type, keeping only the latest run per agent
    outputs_by_agent: dict = {}
    for row in result.data:
        agent = row["agent_type"]
        if agent not in outputs_by_agent:
            outputs_by_agent[agent] = {
                "output_json": row["output_json"],
                "latency_ms": row["latency_ms"],
                "run_at": row["run_at"],
                "output_id": row["output_id"],
            }

    return outputs_by_agent


async def save_story_agent_output(
    story_id: str,
    agent_type: str,
    output_json: dict,
    latency_ms: int,
) -> dict:
    """
    Persist a single agent run output for a story.
    Called after each of the 5 Story Arc agents completes.

    Args:
        story_id:    UUID string of the story
        agent_type:  One of: timeline, key_players, sentiment, predictions, contrarian
        output_json: The structured JSON output from the agent
        latency_ms:  How long the agent took to complete

    Returns:
        The inserted row as a dict.
    """
    sb = get_supabase()
    payload = {
        "story_id": story_id,
        "agent_type": agent_type,
        "output_json": output_json,
        "latency_ms": latency_ms,
        "run_at": datetime.now(timezone.utc).isoformat(),
    }

    result = sb.table("story_agent_outputs").insert(payload).execute()

    if result.data:
        return result.data[0]
    raise Exception(f"Story agent output insert failed: {result}")


# ─────────────────────────────────────────────────────────────────────────────
# (c) Log an agent run to the observability table
# ─────────────────────────────────────────────────────────────────────────────

async def log_agent_run(
    agent_type: str,
    module: str,
    prompt_tokens: int,
    completion_tokens: int,
    latency_ms: int,
    model: str = "llama-3.3-70b-versatile",
    user_id: Optional[str] = None,
    error_text: Optional[str] = None,
) -> dict:
    """
    Log a single agent invocation for observability and cost tracking.
    Call this at the end of every LLM agent execution.

    Args:
        agent_type:        The agent name (e.g. 'synthesis', 'curation', 'timeline')
        module:            The product module (e.g. 'news_navigator', 'my_et_feed', 'story_arc')
        prompt_tokens:     Number of input tokens consumed
        completion_tokens: Number of output tokens generated
        latency_ms:        End-to-end agent latency in milliseconds
        model:             LLM model identifier
        user_id:           Optional UUID of the user who triggered the run
        error_text:        Optional error message if the agent failed

    Returns:
        The inserted log row as a dict.
    """
    sb = get_supabase()
    payload = {
        "agent_type": agent_type,
        "module": module,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "latency_ms": latency_ms,
        "model": model,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if user_id:
        payload["user_id"] = user_id
    if error_text:
        payload["error_text"] = error_text

    result = sb.table("agent_run_logs").insert(payload).execute()

    if result.data:
        return result.data[0]
    raise Exception(f"Agent run log insert failed: {result}")


# ─────────────────────────────────────────────────────────────────────────────
# Bonus helpers — commonly needed across routes
# ─────────────────────────────────────────────────────────────────────────────

async def upsert_article(article: dict) -> dict:
    """
    Insert or update an article from the newsdata.io API.
    Deduplicates on URL. Used by the RAG ingestion pipeline.
    """
    sb = get_supabase()
    payload = {
        "title": article.get("title", ""),
        "source_name": article.get("source_id") or article.get("source_name", ""),
        "url": article.get("link") or article.get("url", ""),
        "published_at": article.get("pubDate") or article.get("published_at"),
        "content": article.get("content", ""),
        "description": article.get("description", ""),
        "language": article.get("language", "en"),
        "country": article.get("country", ["in"])[0] if isinstance(article.get("country"), list) else article.get("country", "in"),
        "category": article.get("category", [None])[0] if isinstance(article.get("category"), list) else article.get("category"),
        "image_url": article.get("image_url"),
    }

    result = (
        sb.table("articles")
        .upsert(payload, on_conflict="url")
        .execute()
    )

    return result.data[0] if result.data else {}


async def log_api_usage(
    endpoint: str,
    status_code: int,
    articles_returned: int,
    used_fallback: bool,
    query_text: Optional[str] = None,
    response_time_ms: Optional[int] = None,
) -> dict:
    """Log an outbound API call to newsdata.io."""
    sb = get_supabase()
    payload = {
        "endpoint": endpoint,
        "status_code": status_code,
        "articles_returned": articles_returned,
        "used_fallback": used_fallback,
    }
    if query_text:
        payload["query_text"] = query_text
    if response_time_ms is not None:
        payload["response_time_ms"] = response_time_ms

    result = sb.table("api_usage_logs").insert(payload).execute()
    return result.data[0] if result.data else {}


async def create_video_job(
    user_id: str,
    topic: str,
    language: str = "en",
) -> dict:
    """Create a new video generation job in 'queued' status."""
    sb = get_supabase()
    payload = {
        "user_id": user_id,
        "topic": topic,
        "status": "queued",
        "language": language,
    }
    result = sb.table("video_jobs").insert(payload).execute()
    return result.data[0] if result.data else {}


async def update_video_job_status(
    job_id: str,
    status: str,
    video_url: Optional[str] = None,
    audio_url: Optional[str] = None,
    script_text: Optional[str] = None,
    slide_count: Optional[int] = None,
    duration_seconds: Optional[float] = None,
) -> dict:
    """Update a video job's status and metadata after pipeline stages complete."""
    sb = get_supabase()
    payload = {"status": status}
    if video_url:
        payload["video_url"] = video_url
    if audio_url:
        payload["audio_url"] = audio_url
    if script_text:
        payload["script_text"] = script_text
    if slide_count is not None:
        payload["slide_count"] = slide_count
    if duration_seconds is not None:
        payload["duration_seconds"] = duration_seconds
    if status in ("complete", "failed"):
        payload["completed_at"] = datetime.now(timezone.utc).isoformat()

    result = sb.table("video_jobs").update(payload).eq("job_id", job_id).execute()
    return result.data[0] if result.data else {}
