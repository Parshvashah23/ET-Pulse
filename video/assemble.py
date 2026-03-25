"""
Video Assembly module using moviepy.
Combines slide images + audio into final MP4 video.
"""
import os
from pathlib import Path

# ── Pillow 10+ compatibility fix ──────────────────────────────────────────────
# moviepy internally uses PIL.Image.ANTIALIAS which was removed in Pillow 10.
# Patch it back before moviepy is imported so it doesn't crash.
try:
    from PIL import Image
    if not hasattr(Image, "ANTIALIAS"):
        Image.ANTIALIAS = Image.LANCZOS
except ImportError:
    pass
# ─────────────────────────────────────────────────────────────────────────────

# Output directory
VIDEO_DIR = Path(__file__).parent.parent / "static" / "videos"
VIDEO_DIR.mkdir(parents=True, exist_ok=True)


def assemble_video(
    slide_paths: list,
    audio_results: list,
    output_filename: str = "output.mp4",
    fps: int = 24
) -> dict:
    """
    Combine slide images with audio parts into a single MP4 video.

    slide_paths: list of PNG file paths (already 1920×1080 from slides.py)
    audio_results: list of {filepath, duration_seconds, part_name}

    Returns: {video_path, video_url, duration_seconds}
    """
    try:
        from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips

        clips = []
        total_duration = 0

        # Match slides with audio
        for i, slide_path in enumerate(slide_paths):
            if not os.path.exists(slide_path):
                continue

            if i < len(audio_results) and audio_results[i].get("filepath"):
                audio_path = audio_results[i]["filepath"]
                if os.path.exists(audio_path):
                    audio = AudioFileClip(audio_path)
                    duration = audio.duration
                    clip = ImageClip(slide_path).set_duration(duration).set_audio(audio)
                else:
                    duration = 5
                    clip = ImageClip(slide_path).set_duration(duration)
            else:
                duration = 5  # outro / extra slides
                clip = ImageClip(slide_path).set_duration(duration)

            # Slides are already 1920×1080 — no resize needed (avoids ANTIALIAS)
            clips.append(clip)
            total_duration += duration

        if not clips:
            return {"video_path": "", "duration_seconds": 0, "error": "No clips to assemble"}

        final = concatenate_videoclips(clips, method="compose")

        output_path = str(VIDEO_DIR / output_filename)
        final.write_videofile(
            output_path,
            fps=fps,
            codec="libx264",
            audio_codec="aac",
            logger=None,
        )

        final.close()
        for clip in clips:
            clip.close()

        return {
            "video_path": output_path,
            "video_url": f"/static/videos/{output_filename}",
            "duration_seconds": round(total_duration, 1),
        }
    except Exception as e:
        print(f"Video assembly failed: {e}")
        return {"video_path": "", "duration_seconds": 0, "error": str(e)}

