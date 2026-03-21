"""
Personalized Feed Agent for 'My ET'.
"""
import json
import os
from typing import List, Dict
from groq import AsyncGroq

from backend.rag import retrieve

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY", "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"))

SYSTEM_PROMPT = """
You are a brilliant financial curation engine for the Economic Times.
Given a user profile and a list of recent news chunks, select the top 3 most relevant stories for this user.
For each selected story, you must write a highly personalized 1-2 sentence summary explaining exactly WHY it matters to them based on their profile.

Output MUST be a JSON array of objects:
[
  {
    "title": "Story Title",
    "url": "https://...",
    "date": "2026-...",
    "topic": "topic-tag",
    "ai_summary": "Since you invest in small-caps, this SEBI regulation will likely increase your compliance costs. However, it also opens up new opportunities in..."
  }
]
"""

async def generate_personalized_feed(profile: Dict) -> List[Dict]:
    interests = profile.get("interests", ["markets", "economy"])
    role = profile.get("role", "general reader")
    expertise = profile.get("expertise_level", "beginner")
    
    candidate_chunks = []
    for interest in interests:
        chunks = retrieve(interest, n=4)
        candidate_chunks.extend(chunks)
        
    unique_articles = {}
    for c in candidate_chunks:
        if c['url'] not in unique_articles:
            unique_articles[c['url']] = c
            
    candidates = list(unique_articles.values())
    if not candidates:
        return []
        
    context_text = "CANDIDATE STORIES:\n\n"
    for i, c in enumerate(candidates[:10]):
        context_text += f"---\nTitle: {c['title']}\nURL: {c['url']}\nDate: {c['date']}\nTopic: {c['topic']}\nExcerpt: {c['text'][:300]}...\n"
        
    profile_text = f"USER PROFILE:\nRole: {role}\nExpertise: {expertise}\nInterests: {', '.join(interests)}\n"
    
    prompt = f"{profile_text}\n\n{context_text}\n\nPlease output the top 3 JSON list."
    
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
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
        print(f"Feed generation failed: {e}")
        return []
