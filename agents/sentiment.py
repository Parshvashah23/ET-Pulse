"""
Sentiment Analysis Agent for Story Arc Tracker.
Analyzes sentiment of articles over time for a given topic.
"""
import json
import os
from typing import List, Dict
from groq import AsyncGroq

from backend.rag import retrieve

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a financial sentiment analyst for a Top-Tier Publication.
Given news article excerpts about a topic, analyze the sentiment of each individual source excerpt.

Output ONLY a JSON object with a "sentiment_series" key containing an array:
{
  "sentiment_series": [
    {
      "date": "YYYY-MM-DD",
      "source_title": "Article title",
      "positive": 0.3,
      "negative": 0.5,
      "neutral": 0.2,
      "snippet": "Key sentence that reflects the dominant sentiment"
    }
  ]
}

RULES:
1. positive + negative + neutral MUST sum to 1.0 for each entry.
2. Scores are 0.0 to 1.0 (two decimal places).
3. Use the date from the source excerpt. If no date, use "unknown".
4. "snippet" = the single most sentiment-revealing sentence from that excerpt.
5. Sort by date ascending.
6. Analyze each source separately — do not merge sources.
"""


async def analyze_sentiment(topic: str, n_chunks: int = 15) -> List[Dict]:
    """Analyze sentiment over time for a given topic."""
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
                {"role": "user", "content": context_text + "\n\nPlease analyze the sentiment now."}
            ],
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if content:
            data = json.loads(content)
            series = data.get("sentiment_series", [])
            series.sort(key=lambda x: x.get("date", ""))
            return series

        return []
    except Exception as e:
        print(f"Sentiment analysis failed: {e}")
        return []
