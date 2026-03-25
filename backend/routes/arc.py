"""
Story Arc API routes.
GET /api/arc/{topic} — runs all 5 Story Arc agents and returns combined JSON.
GET /api/topics — returns list of available demo topics.
"""
import asyncio
import time
from functools import lru_cache
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from agents.timeline import build_timeline
from agents.players import extract_players
from agents.sentiment import analyze_sentiment
from agents.predict import generate_predictions
from agents.contrarian import find_contrarian_view

router = APIRouter()

# Available demo topics
DEMO_TOPICS = [
    {"id": "union-budget", "label": "Union Budget 2026", "query": "Union Budget 2026 mutual funds tax"},
    {"id": "sebi-algo", "label": "SEBI Algo Trading", "query": "SEBI algo trading regulations retail"},
    {"id": "rbi-rate", "label": "RBI Rate Decision", "query": "RBI repo rate monetary policy decision"},
    {"id": "zepto-ipo", "label": "Zepto IPO", "query": "Zepto IPO valuation quick commerce"},
]

# In-memory cache for arc results
_arc_cache: dict = {}


def _get_topic_query(topic_id: str) -> Optional[str]:
    """Map topic slug to search query."""
    for t in DEMO_TOPICS:
        if t["id"] == topic_id:
            return t["query"]
    return topic_id  # fallback: use the topic_id as query directly


@router.get("/topics")
async def get_topics():
    """Return list of available Story Arc topics."""
    return {"topics": DEMO_TOPICS}


@router.get("/arc/{topic}")
async def get_story_arc(topic: str):
    """
    Run all 5 Story Arc agents for a topic and return combined JSON.
    Results are cached after first call for instant subsequent loads.
    """
    # Check cache first
    if topic in _arc_cache:
        return _arc_cache[topic]

    query = _get_topic_query(topic)
    start_time = time.time()

    # Run all 5 agents concurrently
    timeline_task = asyncio.create_task(build_timeline(query))
    players_task = asyncio.create_task(extract_players(query))
    sentiment_task = asyncio.create_task(analyze_sentiment(query))
    predictions_task = asyncio.create_task(generate_predictions(query))
    contrarian_task = asyncio.create_task(find_contrarian_view(query))

    timeline, players, sentiment, predictions, contrarian = await asyncio.gather(
        timeline_task, players_task, sentiment_task, predictions_task, contrarian_task
    )

    elapsed = round(time.time() - start_time, 2)

    result = {
        "topic": topic,
        "query": query,
        "generation_time_seconds": elapsed,
        "timeline": timeline,
        "players": players,
        "sentiment_series": sentiment,
        "predictions": predictions,
        "contrarian": contrarian,
    }

    # Cache the result
    _arc_cache[topic] = result

    return result
