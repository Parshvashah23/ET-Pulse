"""
Audit Log Module.
SQLite-backed decision log tracking every agent call for transparency.
"""
import sqlite3
import time
import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

from fastapi import APIRouter

router = APIRouter()

# SQLite database path
DB_PATH = str(Path(__file__).parent.parent / "data" / "audit.db")


def _get_connection() -> sqlite3.Connection:
    """Get or create SQLite connection with WAL mode for concurrency."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def _init_db():
    """Create the decision_log table if it doesn't exist."""
    conn = _get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS decision_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            agent TEXT NOT NULL,
            query TEXT NOT NULL,
            input_summary TEXT,
            output_summary TEXT,
            duration_ms INTEGER,
            status TEXT DEFAULT 'success'
        )
    """)
    conn.commit()
    conn.close()


# Initialize on import
_init_db()


def log_agent_call(
    agent: str,
    query: str,
    input_summary: str = "",
    output_summary: str = "",
    duration_ms: int = 0,
    status: str = "success"
):
    """Write an agent decision to the audit log."""
    try:
        conn = _get_connection()
        conn.execute(
            """INSERT INTO decision_log 
               (timestamp, agent, query, input_summary, output_summary, duration_ms, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                datetime.utcnow().isoformat(),
                agent,
                query,
                input_summary[:500] if input_summary else "",
                output_summary[:500] if output_summary else "",
                duration_ms,
                status,
            )
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Audit log write failed: {e}")


@router.get("/audit")
async def get_audit_log(limit: int = 50):
    """Return the last N audit log entries."""
    try:
        conn = _get_connection()
        cursor = conn.execute(
            "SELECT * FROM decision_log ORDER BY id DESC LIMIT ?", (limit,)
        )
        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return {"entries": rows, "count": len(rows)}
    except Exception as e:
        return {"entries": [], "count": 0, "error": str(e)}
