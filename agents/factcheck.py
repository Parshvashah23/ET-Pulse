"""
Fact-Check Agent using Gemini 2.5 Flash.
"""
import json
import os
from groq import AsyncGroq

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", "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"))

SYSTEM_PROMPT = """
You are a rigorous Fact-Checking Editor for the Economic Times.
Given a draft briefing and the original source text chunks it was based on, evaluate the confidence of the briefing.

Output ONLY a JSON array of objects with the following structure:
[
  {
    "section": "Background",
    "confidence": "high", // or "medium", "low"
    "reasoning": "Direct matching evidence found in Source X."
  }
]
"""

async def run_fact_check(draft_brief: str, source_chunks: list[dict]) -> list[dict]:
    context_text = "ORIGINAL SOURCES:\n\n"
    for i, c in enumerate(source_chunks):
        context_text += f"---\nSource {i+1}:\n{c['text']}\n"

    prompt = f"{context_text}\n\nDRAFT BRIEF:\n{draft_brief}\n\nPlease output the JSON evaluation array."

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        if content and "[" in content and "]" in content:
            start = content.find("[")
            end = content.rfind("]") + 1
            json_str = content[start:end]
            return json.loads(json_str)
            
        return []
    except Exception as e:
        print(f"Fact check failed: {e}")
        return []
