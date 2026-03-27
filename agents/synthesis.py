"""
Synthesis Agent using Gemini 2.5 Flash for ET Pulse.
Generates structured briefings from retrieved chunks and streams them via Server-Sent Events (SSE).
"""
import json
import os
from typing import AsyncGenerator
from groq import AsyncGroq

from backend.rag import retrieve

# Initialize Groq client
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", "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"))

PERSONAS = {
    "general": "You are a senior financial editor. Write a clear, structured briefing.",
    "mf_investor": "You are a mutual fund advisor. Focus on impacts on mutual funds, SIPs, and retail portfolios.",
    "founder": "You are a startup editor. Focus on funding, IPOs, scaling, and founder insights.",
    "student": "You are an educational reporter. Explain financial concepts simply, outline basics before details.",
}

SYSTEM_PROMPT = """
You are an expert financial journalist for ET Pulse.
Your goal is to write a highly structured, accurate, and engaging news briefing based ONLY on the provided source excerpts.

REQUIREMENTS:
1. Write the briefing in Markdown.
2. Structure the briefing with exactly these 5 sections (use `##` headers):
   ## Background
   ## Key Development
   ## Market Impact
   ## Key Players
   ## What to Watch

3. Do not add outside information. If the source material doesn't cover a section, briefly state "Not enough information available in the current sources."
4. CITATIONS: Every factual claim must end with a citation to its source article title, enclosed in brackets.
   Example: The RBI maintained the repo rate at 6.5% [Source: RBI keeps repo rate unchanged].
5. Keep paragraphs short and use bullet points where appropriate for readability.
"""

async def generate_brief_stream(query: str, persona: str = "general") -> AsyncGenerator[str, None]:
    chunks = retrieve(query, n=8)
    
    if not chunks:
        yield "data: " + json.dumps({"content": "Sorry, I couldn't find any relevant news articles for that query."}) + "\n\n"
        yield "data: [DONE]\n\n"
        return

    context_text = "SOURCE EXCERPTS:\n\n"
    for i, c in enumerate(chunks):
        context_text += f"---\nSource Title: {c['title']}\nDate: {c['date']}\nText: {c['text']}\n"

    role_instruction = PERSONAS.get(persona, PERSONAS["general"])
    prompt = f"{context_text}\n\nUSER QUERY: {query}\n\nPlease generate the structured briefing now."

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{role_instruction}"},
                {"role": "user", "content": prompt}
            ],
            stream=True,
            max_tokens=1500
        )
        async for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                payload = json.dumps({"content": chunk.choices[0].delta.content})
                yield f"data: {payload}\n\n"
            
        yield "data: [DONE]\n\n"
        
    except Exception as e:
        error_msg = f"Error generating briefing: {str(e)}"
        yield f"data: {json.dumps({'content': error_msg})}\n\n"
        yield "data: [DONE]\n\n"
