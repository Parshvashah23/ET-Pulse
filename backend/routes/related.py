"""
Related stories API — ChromaDB similarity search for related articles.
"""
from fastapi import APIRouter, Query
from typing import List, Dict
from backend.rag import retrieve

router = APIRouter()


@router.get("/related")
async def get_related_stories(query: str = Query(..., description="Query text to find related stories")):
    """Find 3 semantically related stories using ChromaDB similarity search."""
    try:
        results = retrieve(query, n=3)
        related = []
        seen_titles = set()
        for r in results:
            title = r.get("title", "Untitled")
            if title not in seen_titles:
                seen_titles.add(title)
                related.append({
                    "title": title,
                    "url": r.get("url", "#"),
                    "date": r.get("date", ""),
                    "topic": r.get("topic", ""),
                    "score": round(r.get("score", 0), 3),
                })
        return {"related": related[:3]}
    except Exception as e:
        return {"related": [], "error": str(e)}
