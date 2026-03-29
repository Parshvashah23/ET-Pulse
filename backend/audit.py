"""
Audit Log Module — powered by Supabase.
Logs agent calls to the agent_run_logs table for observability.
Replaces the old SQLite decision_log with the centralized Supabase table.
"""
from typing import List, Optional
from datetime import datetime, timezone

from fastapi import APIRouter

from backend.db.supabase_client import get_supabase

router = APIRouter()


def log_agent_call(
    agent: str,
    query: str,
    input_summary: str = "",
    output_summary: str = "",
    duration_ms: int = 0,
    status: str = "success",
    user_id: Optional[str] = None,
):
    """
    Write an agent decision to the Supabase agent_run_logs table.
    This is the backward-compatible wrapper that matches the old signature.

    Maps the old fields to the new schema:
      - agent       → agent_type
      - query       → module (since the old 'query' was the input context)
      - duration_ms → latency_ms
    """
    try:
        sb = get_supabase()
        payload = {
            "agent_type": agent,
            "module": "legacy_audit",
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "latency_ms": duration_ms,
            "model": "llama-3.3-70b-versatile",
        }

        if user_id:
            payload["user_id"] = user_id

        if status != "success":
            payload["error_text"] = f"[{status}] {output_summary[:500]}" if output_summary else status

        sb.table("agent_run_logs").insert(payload).execute()
    except Exception as e:
        print(f"Audit log write failed: {e}")


@router.get("/audit")
async def get_audit_log(limit: int = 50):
    """Return the last N audit log entries from Supabase."""
    try:
        sb = get_supabase()
        result = (
            sb.table("agent_run_logs")
            .select("*")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        entries = result.data or []

        # Remap to match the old format for frontend compatibility
        formatted = [
            {
                "id": entry.get("run_id"),
                "timestamp": entry.get("created_at"),
                "agent": entry.get("agent_type"),
                "query": entry.get("module"),
                "input_summary": f"tokens: {entry.get('prompt_tokens', 0)}",
                "output_summary": f"tokens: {entry.get('completion_tokens', 0)}",
                "duration_ms": entry.get("latency_ms", 0),
                "status": "error" if entry.get("error_text") else "success",
            }
            for entry in entries
        ]

        return {"entries": formatted, "count": len(formatted)}
    except Exception as e:
        return {"entries": [], "count": 0, "error": str(e)}
