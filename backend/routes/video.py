"""
Video Studio API routes.
POST /api/video/generate — full pipeline: script → TTS → slides → assemble → MP4.
"""
import asyncio
import hashlib
import time
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter
from pydantic import BaseModel

from agents.script import generate_script
from video.tts import generate_script_audio
from video.slides import generate_all_slides
from video.assemble import assemble_video

router = APIRouter()

# Thread pool for sync I/O (gTTS, moviepy)
_executor = ThreadPoolExecutor(max_workers=2)


class VideoRequest(BaseModel):
    article_text: str
    language: str = "en"


@router.post("/video/generate")
async def generate_video(req: VideoRequest):
    """
    Full video generation pipeline:
    1. Script Agent → 5-part JSON script  (async, Groq LLM)
    2. gTTS → MP3 audio for each part     (sync, run in thread)
    3. Playwright → slide PNG screenshots  (async, Chromium)
    4. moviepy → final MP4                (sync, run in thread)
    """
    start_time = time.time()
    errors = []
    loop = asyncio.get_event_loop()

    # Step 1: Generate script (async)
    script_data = await generate_script(req.article_text, req.language)
    if not script_data or not script_data.get("script"):
        return {"error": "Failed to generate script", "step": "script"}

    script_parts = script_data.get("script", {})

    # Step 2: Generate audio in thread (gTTS is sync)
    audio_results = await loop.run_in_executor(
        _executor, generate_script_audio, script_parts, req.language
    )
    if not audio_results:
        errors.append("Audio generation produced no results")

    # Step 3: Generate slides in thread (Playwright runs its own event loop in thread)
    text_hash = hashlib.md5(req.article_text[:200].encode()).hexdigest()[:8]
    prefix = f"{text_hash}_{req.language}_"
    slide_paths = await loop.run_in_executor(
        _executor, generate_all_slides, script_data, prefix
    )

    if not slide_paths:
        return {"error": "Slide generation failed (Playwright)", "step": "slides"}

    # Step 4: Assemble video in thread (moviepy is sync)
    output_filename = f"video_{text_hash}_{req.language}.mp4"
    video_result = await loop.run_in_executor(
        _executor, assemble_video, slide_paths, audio_results, output_filename
    )

    elapsed = round(time.time() - start_time, 2)

    if video_result.get("error"):
        return {
            "error": video_result["error"],
            "step": "assembly",
            "generation_time_seconds": elapsed,
            "script": script_data,
        }

    return {
        "video_url": video_result.get("video_url", ""),
        "duration_seconds": video_result.get("duration_seconds", 0),
        "script": script_data,
        "slides_count": len(slide_paths),
        "language": req.language,
        "generation_time_seconds": elapsed,
        "warnings": errors if errors else None,
    }

