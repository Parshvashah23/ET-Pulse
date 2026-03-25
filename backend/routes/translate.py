"""
Vernacular Engine API routes.
POST /api/translate — cultural translation with glossary.
POST /api/audio-brief — translate + gTTS audio generation.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from agents.translate import translate_text
from video.tts import generate_audio

router = APIRouter()


class TranslateRequest(BaseModel):
    text: str
    language: str  # hi, ta, te, bn


class AudioBriefRequest(BaseModel):
    text: str
    language: str


@router.post("/translate")
async def translate_endpoint(req: TranslateRequest):
    """Translate text with cultural adaptation and finance glossary."""
    result = await translate_text(req.text, req.language)
    return result


@router.post("/audio-brief")
async def audio_brief_endpoint(req: AudioBriefRequest):
    """Translate text to target language + generate audio via gTTS."""
    # Step 1: Translate
    translation = await translate_text(req.text, req.language)
    translated_text = translation.get("translated_text", req.text)

    # Step 2: Generate audio
    audio_result = generate_audio(translated_text, lang=req.language)

    return {
        "translated_text": translated_text,
        "language": req.language,
        "audio_url": f"/static/audio/{audio_result.get('filename', '')}",
        "duration_seconds": audio_result.get("duration_seconds", 0),
        "glossary_terms_found": translation.get("glossary_terms_found", []),
    }
