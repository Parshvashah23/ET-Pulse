"""
Timeline Builder Agent for Story Arc Tracker.
Extracts dated events from topic chunks → returns structured timeline JSON.
"""
import json
import os
from typing import List, Dict
from groq import AsyncGroq

from backend.rag import retrieve

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are an expert financial timeline analyst for the Economic Times.
Given a set of news article excerpts about a specific topic, extract ALL dated events and arrange them chronologically.

Output ONLY a JSON object with a "timeline" key containing an array of event objects:
{
  "timeline": [
    {
      "date": "YYYY-MM-DD",
      "event": "Brief description of what happened",
      "type": "policy|market|regulatory|statement",
      "significance": 1,
      "source_title": "Article title this was extracted from"
    }
  ]
}

RULES:
1. Extract EVERY event that has a clear date or time reference.
2. If only a month/year is given, use the 1st of that month (e.g., "March 2026" → "2026-03-01").
3. "type" must be one of: policy, market, regulatory, statement.
4. "significance" is 1 (minor), 2 (notable), or 3 (major turning point).
5. Sort by date ascending (earliest first).
6. Include 5-15 events typically. Do not fabricate events not present in sources.
"""


async def build_timeline(topic: str, n_chunks: int = 20) -> List[Dict]:
    """Extract a chronological timeline of events for a given topic."""
    chunks = retrieve(topic, n=n_chunks)

    if not chunks:
        return []

    context_text = f"TOPIC: {topic}\n\nSOURCE EXCERPTS:\n\n"
    for i, c in enumerate(chunks):
        context_text += f"---\nSource {i+1}: {c['title']}\nDate: {c['date']}\nText: {c['text']}\n"

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": context_text + "\n\nPlease extract the timeline now."}
            ],
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if content:
            data = json.loads(content)
            timeline = data.get("timeline", [])
            # Sort by date
            timeline.sort(key=lambda x: x.get("date", ""))
            return timeline

        return []
    except Exception as e:
        print(f"Timeline extraction failed: {e}")
        return []
