"""
Script Agent for AI Video Studio.
Generates a 5-part broadcast script from article text using Groq.
"""
import json
import os
from typing import Dict
from groq import AsyncGroq

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """
You are a broadcast script writer for a Top-Tier Publication video news.
Given an article text, create a 5-part video narration script suitable for a 60-90 second news video.

Output ONLY a JSON object:
{
  "script": {
    "hook": {
      "text": "Opening hook (2-3 sentences, grab attention, 10 seconds when read aloud)",
      "duration_hint": 10
    },
    "context": {
      "text": "Background context (3-4 sentences, set the stage, 15 seconds)",
      "duration_hint": 15
    },
    "key_facts": {
      "text": "Key facts and numbers (4-5 sentences, the core story, 30 seconds)",
      "duration_hint": 30
    },
    "market_impact": {
      "text": "Market impact and implications (3-4 sentences, what it means, 20 seconds)",
      "duration_hint": 20
    },
    "close": {
      "text": "Closing / what to watch (2-3 sentences, 10 seconds)",
      "duration_hint": 10
    }
  },
  "headline": "Short headline for the video title (max 10 words)",
  "key_stat": "The single most impressive statistic from the article (e.g., '₹2.5 Lakh Cr allocated')"
}

RULES:
1. Total word count: 200-240 words across all 5 parts.
2. Each part must be a self-contained narration paragraph — it will be read aloud by TTS.
3. Use conversational but professional tone. Think TV anchor reading prompter.
4. The "hook" must grab attention immediately — lead with the most striking fact.
5. Include specific numbers, names, and dates from the article.
6. "key_stat" should be a number that looks impressive on screen (currency amounts, percentages, counts).
"""


async def generate_script(article_text: str, language: str = "en") -> Dict:
    """Generate a 5-part video script from article text."""
    lang_instruction = ""
    if language != "en":
        lang_map = {"hi": "Hindi", "ta": "Tamil", "te": "Telugu", "bn": "Bengali"}
        lang_name = lang_map.get(language, "English")
        lang_instruction = f"\n\nIMPORTANT: Write the entire script in {lang_name}. The narration will be in {lang_name}."

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT + lang_instruction},
                {"role": "user", "content": f"ARTICLE TEXT:\n{article_text[:3000]}\n\nGenerate the 5-part video script now."}
            ],
            max_tokens=1500,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if content:
            return json.loads(content)

        return {}
    except Exception as e:
        print(f"Script generation failed: {e}")
        return {}
