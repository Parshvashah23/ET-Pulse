from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import StreamingResponse

from agents.synthesis import generate_brief_stream

router = APIRouter()

class StreamRequest(BaseModel):
    query: str
    persona: str = "general"

@router.post("/brief/stream")
async def brief_stream(req: StreamRequest):
    """
    Server-Sent Events (SSE) endpoint that streams the Claude 3 Haiku briefing.
    """
    generator = generate_brief_stream(query=req.query, persona=req.persona)
    return StreamingResponse(generator, media_type="text/event-stream")
