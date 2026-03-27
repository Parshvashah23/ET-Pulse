"""
Key Players Agent for Story Arc Tracker.
Extracts named entities (people, companies, regulators) from topic chunks.
"""
import json
import os
from typing import List, Dict
from groq import AsyncGroq

from backend.rag import retrieve

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are an expert financial analyst for a Top-Tier Publication.
Given news article excerpts about a specific topic, extract all KEY PLAYERS — people, companies, regulators, and institutions mentioned.

Output ONLY a JSON object with a "players" key containing an array:
{
  "players": [
    {
      "name": "Full Name or Entity Name",
      "role": "Their role/title (e.g., 'SEBI Chairman', 'CEO, Zepto', 'Finance Minister')",
      "latest_action": "Most recent action or statement by this player from the sources",
      "mentioned_count": 3,
      "entity_type": "person|company|regulator|institution"
    }
  ]
}

RULES:
1. Include only entities mentioned at least once in the sources.
2. "mentioned_count" = approximate count of how many source excerpts mention this entity.
3. "latest_action" should be the most recent or most significant action/statement.
4. Sort by mentioned_count descending (most mentioned first).
5. Limit to top 8-12 players. Do not fabricate entities not in the sources.
"""


async def extract_players(topic: str, n_chunks: int = 20) -> List[Dict]:
    """Extract key players for a given topic from article chunks."""
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
                {"role": "user", "content": context_text + "\n\nPlease extract the key players now."}
            ],
            max_tokens=1500,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if content:
            data = json.loads(content)
            players = data.get("players", [])
            players.sort(key=lambda x: x.get("mentioned_count", 0), reverse=True)
            return players

        return []
    except Exception as e:
        print(f"Player extraction failed: {e}")
        return []
