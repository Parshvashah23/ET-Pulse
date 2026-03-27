"""
Contrarian View Agent for Story Arc Tracker.
Surfaces underrepresented perspectives with supporting evidence counts.
"""
import json
import os
from typing import Dict
from groq import AsyncGroq

from backend.rag import retrieve

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a contrarian financial analyst for a Top-Tier Publication.
Your job is to find UNDERREPRESENTED or MINORITY perspectives in the news coverage about a topic.

Given article excerpts, identify what the dominant narrative is, then surface the opposite or overlooked viewpoint.

Output ONLY a JSON object:
{
  "contrarian": {
    "dominant_narrative": "What most articles are saying (1-2 sentences)",
    "contrarian_view": "The underrepresented or opposing perspective (2-3 sentences)",
    "supporting_evidence": "Specific facts from the sources that support this contrarian view",
    "evidence_count": 2,
    "risk_if_ignored": "What could go wrong if this perspective is ignored (1-2 sentences)"
  }
}

RULES:
1. The contrarian view MUST be grounded in at least some evidence from the sources.
2. "evidence_count" = number of source excerpts that contain hints supporting this view.
3. Be intellectually honest — don't create contrarian views without any basis.
4. Focus on financial/market implications.
"""


async def find_contrarian_view(topic: str, n_chunks: int = 20) -> Dict:
    """Find contrarian/underrepresented perspectives for a topic."""
    chunks = retrieve(topic, n=n_chunks)

    if not chunks:
        return {}

    context_text = f"TOPIC: {topic}\n\nSOURCE EXCERPTS:\n\n"
    for i, c in enumerate(chunks):
        context_text += f"---\nSource {i+1}: {c['title']}\nDate: {c['date']}\nText: {c['text']}\n"

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": context_text + "\n\nPlease find the contrarian view now."}
            ],
            max_tokens=800,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if content:
            data = json.loads(content)
            return data.get("contrarian", {})

        return {}
    except Exception as e:
        print(f"Contrarian analysis failed: {e}")
        return {}
