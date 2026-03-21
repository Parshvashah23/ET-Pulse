"""
Brief API routes.
Day 1: stub that returns retrieved chunks.
Day 2: will add streaming synthesis via Claude.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from backend.rag import retrieve

router = APIRouter()


class BriefRequest(BaseModel):
    query: str
    persona: Optional[str] = "general"
    n_results: Optional[int] = 8


class BriefResponse(BaseModel):
    query: str
    persona: str
    chunks: list[dict]
    count: int


@router.post("/brief", response_model=BriefResponse)
async def get_brief(req: BriefRequest):
    """
    Day 1 stub: retrieves relevant chunks from ChromaDB for a query.
    Day 2 will add Claude synthesis + streaming.
    """
    chunks = retrieve(query=req.query, n=req.n_results)
    return BriefResponse(
        query=req.query,
        persona=req.persona,
        chunks=chunks,
        count=len(chunks),
    )
