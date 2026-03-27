"""
Translation Agent for Vernacular Engine.
Cultural adaptation with finance glossary injection — NOT literal translation.
"""
import json
import os
from typing import Dict, List
from pathlib import Path
from groq import AsyncGroq

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# Load glossary
GLOSSARY_PATH = Path(__file__).parent.parent / "data" / "glossary.json"
_glossary = None


def _load_glossary() -> dict:
    global _glossary
    if _glossary is None:
        try:
            with open(GLOSSARY_PATH, "r", encoding="utf-8") as f:
                _glossary = json.load(f)
        except Exception:
            _glossary = {}
    return _glossary


LANGUAGE_INSTRUCTIONS = {
    "hi": {
        "name": "Hindi",
        "instruction": "Write like Dainik Bhaskar business section. Use देश, बाज़ार, निवेश, शेयर naturally. Explain SIP as हर महीने थोड़ा-थोड़ा निवेश. Reference North/Central India business context.",
        "region": "North/Central India",
    },
    "mr": {
        "name": "Marathi",
        "instruction": "Write like Loksatta business section. Use बाजार, गुंतवणूक, समभाग naturally. Reference Mumbai/Pune business ecosystem. Reader is familiar with BSE, Bajaj, Tata group. Explain SIP as दरमहा नियमित गुंतवणूक.",
        "region": "Maharashtra",
    },
}

SYSTEM_PROMPT_TEMPLATE = """
You are a business news translator for a Top-Tier Publication India.
Translate the following English financial news text to {language_name}.

CRITICAL RULES:
1. CULTURAL ADAPTATION: Do not translate word-for-word. Rewrite so it reads like a native {language_name} newspaper.
2. FINANCE TERMS: Use the glossary below for standard terms. For terms not in glossary: keep in English with {language_name} explanation in brackets.
3. LOCAL CONTEXT: Add relevant {region} business context where natural.
4. QUALITY CHECK: Your output should have <15% English words remaining.

GLOSSARY FOR {language_name}:
{glossary_section}

LANGUAGE-SPECIFIC INSTRUCTION:
{language_instruction}

Output ONLY a JSON object:
{{
  "translated_text": "The full translated text",
  "glossary_terms_found": ["term1", "term2"],
  "english_word_percentage": 12
}}
"""


async def translate_text(text: str, target_language: str) -> Dict:
    """Translate text with cultural adaptation."""
    if target_language not in LANGUAGE_INSTRUCTIONS:
        return {"translated_text": text, "language": "en", "glossary_terms_found": []}

    lang_config = LANGUAGE_INSTRUCTIONS[target_language]
    glossary = _load_glossary()

    # Build glossary section for the prompt
    glossary_entries = []
    for term, translations in glossary.items():
        if target_language in translations:
            glossary_entries.append(f"  {term}: {translations[target_language]}")

    glossary_section = "\n".join(glossary_entries[:25])  # Top 25 most relevant

    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        language_name=lang_config["name"],
        region=lang_config["region"],
        glossary_section=glossary_section,
        language_instruction=lang_config["instruction"],
    )

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"TEXT TO TRANSLATE:\n{text[:4000]}"}
            ],
            max_tokens=3000,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        if content:
            data = json.loads(content)
            data["language"] = target_language
            data["language_name"] = lang_config["name"]
            return data

        return {"translated_text": text, "language": target_language}
    except Exception as e:
        print(f"Translation failed: {e}")
        return {"translated_text": text, "language": target_language, "error": str(e)}
