from fastapi import APIRouter
from pydantic import BaseModel
import os
import json
from fastapi.responses import StreamingResponse

from groq import AsyncGroq
from backend.rag import retrieve

router = APIRouter()
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", "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"))

class FollowUpRequest(BaseModel):
    question: str
    originalQuery: str
    persona: str = "general"

SYSTEM_PROMPT = """
You are an expert AI Assistant for Economic Times Pulse.
The user is asking a follow-up question regarding their original search query.
Use the provided context to answer accurately. If the context doesn't contain the answer, say so clearly.
Keep answers concise, direct, and formatted in Markdown.
"""

@router.post("/followup")
async def followup_endpoint(req: FollowUpRequest):
    search_query = f"{req.originalQuery} - {req.question}"
    chunks = retrieve(search_query, n=5)
    
    async def generator():
        if not chunks:
            yield "data: " + json.dumps({"content": "Sorry, I couldn't find relevant information in the articles."}) + "\n\n"
            yield "data: [DONE]\n\n"
            return
            
        context_text = "SOURCE EXCERPTS:\n\n"
        for c in chunks:
            context_text += f"---\n{c['text']}\n"
            
        prompt = f"{context_text}\n\nORIGINAL TOPIC: {req.originalQuery}\nUSER QUESTION: {req.question}"
        
        try:
            response = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=600,
                stream=True
            )
            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    payload = json.dumps({"content": chunk.choices[0].delta.content})
                    yield f"data: {payload}\n\n"
                
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'content': f'Error: {str(e)}'})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(generator(), media_type="text/event-stream")
