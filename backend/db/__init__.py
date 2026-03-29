"""
ET Pulse — Database package init.
Exposes the Supabase client and all helper functions.
"""

from backend.db.supabase_client import (
    get_supabase,
    insert_feed_item,
    bulk_insert_feed_items,
    get_story_agent_outputs,
    save_story_agent_output,
    log_agent_run,
    upsert_article,
    log_api_usage,
    create_video_job,
    update_video_job_status,
)

__all__ = [
    "get_supabase",
    "insert_feed_item",
    "bulk_insert_feed_items",
    "get_story_agent_outputs",
    "save_story_agent_output",
    "log_agent_run",
    "upsert_article",
    "log_api_usage",
    "create_video_job",
    "update_video_job_status",
]
