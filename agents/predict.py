"""
Prediction Agent for Story Arc Tracker.
Generates 3 forward-looking signals with rationale based on topic context.
"""
import json
import os
from typing import List, Dict
from groq import AsyncGroq

from backend.rag import retrieve

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a senior financial forecaster for a Top-Tier Publication.
Given news article excerpts about a specific topic, generate 3 FORWARD-LOOKING prediction signals.

Output ONLY a JSON object with a "predictions" key containing exactly 3 objects:
{
  "predictions": [
    {
      "signal": "Short headline of prediction (max 15 words)",
      "rationale": "2-3 sentence explanation grounded in the source material",
      "confidence": "high|medium|low",
      "timeframe": "e.g., 'Next 3 months', 'Q2 2026', 'Within 1 year'",
      "impact_area": "market|policy|regulatory|industry"
    }
  ]
}

RULES:
1. Exactly 3 predictions. No more, no fewer.
2. Each prediction must be grounded in evidence from the sources — cite specific facts.
3. confidence = high (strong evidence in multiple sources), medium (some evidence), low (extrapolation).
4. Be specific and actionable — avoid vague predictions like "things will change".
5. Cover different aspects if possible (e.g., one market, one regulatory, one industry).
"""


async def generate_predictions(topic: str, n_chunks: int = 20) -> List[Dict]:
    """Generate 3 forward-looking prediction signals for a topic."""
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
                {"role": "user", "content": context_text + "\n\nPlease generate 3 predictions now."}
            ],
            max_tokens=1200,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if content:
            data = json.loads(content)
            return data.get("predictions", [])

        return []
    except Exception as e:
        print(f"Prediction generation failed: {e}")
        return []
