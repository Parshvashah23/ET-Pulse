"""
Text-to-Speech module using gTTS (Google Text-to-Speech).
Completely free, no API key required.
"""
import os
import hashlib
from pathlib import Path
from gtts import gTTS

# Output directory
AUDIO_DIR = Path(__file__).parent.parent / "static" / "audio"
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

# Supported language codes
LANGUAGE_CODES = {
    "en": "en",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "bn": "bn",
}


def generate_audio(text: str, lang: str = "en", filename: str = None) -> dict:
    """
    Generate MP3 audio from text using gTTS.
    
    Returns: {filepath, filename, duration_seconds}
    """
    lang_code = LANGUAGE_CODES.get(lang, "en")
    
    # Generate a unique filename if not provided
    if not filename:
        text_hash = hashlib.md5(text.encode()).hexdigest()[:10]
        filename = f"tts_{lang_code}_{text_hash}.mp3"
    
    filepath = AUDIO_DIR / filename
    
    try:
        tts = gTTS(text=text, lang=lang_code, slow=False)
        tts.save(str(filepath))
        
        # Get duration using a simple estimation (gTTS is ~150 words per minute)
        word_count = len(text.split())
        estimated_duration = (word_count / 150) * 60  # seconds
        
        return {
            "filepath": str(filepath),
            "filename": filename,
            "duration_seconds": round(estimated_duration, 1),
        }
    except Exception as e:
        print(f"TTS generation failed: {e}")
        return {
            "filepath": "",
            "filename": "",
            "duration_seconds": 0,
            "error": str(e),
        }


def generate_script_audio(script_parts: dict, lang: str = "en") -> list:
    """
    Generate audio for each part of a video script.
    
    Returns list of {part_name, filepath, duration_seconds}
    """
    results = []
    part_names = ["hook", "context", "key_facts", "market_impact", "close"]
    
    for part_name in part_names:
        part = script_parts.get(part_name, {})
        text = part.get("text", "")
        if not text:
            continue
            
        text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
        filename = f"video_{part_name}_{lang}_{text_hash}.mp3"
        
        result = generate_audio(text, lang=lang, filename=filename)
        result["part_name"] = part_name
        results.append(result)
    
    return results
