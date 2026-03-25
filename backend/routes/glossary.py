"""
Glossary API route — finance term detection endpoint.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict

from agents.glossary import detect_terms

router = APIRouter()


class GlossaryRequest(BaseModel):
    text: str


class GlossaryTerm(BaseModel):
    term: str
    definition: str


class GlossaryResponse(BaseModel):
    terms: List[GlossaryTerm]
    count: int


@router.post("/glossary", response_model=GlossaryResponse)
async def get_glossary_terms(req: GlossaryRequest):
    """Detect finance terms in text and return definitions."""
    terms = detect_terms(req.text)
    return GlossaryResponse(
        terms=[GlossaryTerm(**t) for t in terms],
        count=len(terms),
    )
