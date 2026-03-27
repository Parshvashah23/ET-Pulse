from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

from agents.feed import generate_personalized_feed

router = APIRouter()

class UserProfile(BaseModel):
    role: str
    expertise_level: str
    interests: List[str]
    page: int = 1

class FeedResponse(BaseModel):
    feed: List[dict]

@router.post("/feed", response_model=FeedResponse)
async def get_feed(profile: UserProfile):
    """
    Returns a personalized news feed curated by the AI agent based on the provided user profile.
    """
    feed = await generate_personalized_feed(profile.dict())
    return {"feed": feed}
