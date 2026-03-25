"""
Slide Generator — HTML/CSS → Playwright → 1920×1080 PNG screenshots.

No Pillow, no ANTIALIAS errors. Slides look exactly like a browser renders them:
Google Fonts, CSS Grid, smooth gradients — indistinguishable from a design tool.
"""
import asyncio
import hashlib
from pathlib import Path
from datetime import datetime

# Output directory
SLIDES_DIR = Path(__file__).parent.parent / "static" / "slides"
SLIDES_DIR.mkdir(parents=True, exist_ok=True)

# ── Google Font CDN (cached by browser, no cost) ────────────────────────────
FONT_CDN = "<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap' rel='stylesheet'>"

BASE_STYLE = """
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  width: 1920px; height: 1080px; overflow: hidden;
  font-family: 'Inter', -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
"""


def _slide_html(body_content: str, bg: str = "#FAF9F7") -> str:
    """Wrap slide body in a complete, self-contained HTML document."""
    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
{FONT_CDN}
<style>
{BASE_STYLE}
body {{ background: {bg}; }}
</style>
</head>
<body>
{body_content}
</body>
</html>"""


# ── Slide Templates ──────────────────────────────────────────────────────────

def _title_html(headline: str, date: str) -> str:
    safe = headline.replace("<", "&lt;").replace(">", "&gt;")
    return _slide_html(f"""
<style>
  body {{ background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); }}
  .top-bar {{ position:absolute; top:0; left:0; right:0; height:8px;
    background: linear-gradient(90deg, #C0392B 0%, #E74C3C 50%, #C0392B 100%); }}
  .et-badge {{
    position:absolute; top:60px; left:80px;
    display:flex; align-items:center; gap:16px;
  }}
  .et-logo {{
    background: #C0392B; color:white;
    font-size:28px; font-weight:900; letter-spacing:-1px;
    padding:10px 22px; border-radius:4px;
  }}
  .et-label {{
    color:#888; font-size:20px; font-weight:500; letter-spacing:2px;
    text-transform:uppercase;
  }}
  .content {{
    position:absolute; bottom:160px; left:80px; right:200px;
  }}
  .headline {{
    color:white; font-family:'Playfair Display',serif;
    font-size:clamp(52px, 5.5vw, 80px); font-weight:900;
    line-height:1.1; letter-spacing:-1px;
  }}
  .headline em {{ color:#C0392B; font-style:normal; }}
  .date-badge {{
    position:absolute; bottom:60px; left:80px;
    color:#666; font-size:22px; font-weight:500; letter-spacing:1px;
  }}
  .side-accent {{
    position:absolute; right:80px; top:50%; transform:translateY(-50%);
    width:6px; height:320px; background:linear-gradient(180deg,#C0392B 0%,transparent 100%);
    border-radius:3px;
  }}
</style>
<div class="top-bar"></div>
<div class="et-badge">
  <div class="et-logo">ET</div>
  <div class="et-label">Intelligence</div>
</div>
<div class="content">
  <div class="headline">{safe}</div>
</div>
<div class="date-badge">{date}</div>
<div class="side-accent"></div>
""", bg="#111")


def _stat_html(stat: str, context: str) -> str:
    safe_stat = stat.replace("<", "&lt;").replace(">", "&gt;")[:120]
    safe_ctx = context.replace("<", "&lt;").replace(">", "&gt;")[:200]
    return _slide_html(f"""
<style>
  body {{ background: #FAF9F7; }}
  .top-stripe {{ height:8px; background:#C0392B; }}
  .label {{
    position:absolute; top:120px; left:50%; transform:translateX(-50%);
    font-size:18px; font-weight:700; letter-spacing:6px; text-transform:uppercase;
    color:#C0392B;
  }}
  .stat {{
    position:absolute; top:50%; left:50%; transform:translate(-50%,-55%);
    text-align:center;
  }}
  .stat-number {{
    font-family:'Playfair Display',serif;
    font-size:120px; font-weight:900; color:#1A1A1A;
    line-height:1; letter-spacing:-3px;
  }}
  .stat-context {{
    margin-top:32px; font-size:28px; font-weight:500; color:#555;
    max-width:900px; line-height:1.4; text-align:center;
  }}
  .bottom-bar {{
    position:absolute; bottom:0; left:0; right:0; height:6px;
    background:linear-gradient(90deg, #C0392B, #E74C3C);
  }}
  .watermark {{
    position:absolute; bottom:40px; right:60px;
    font-size:18px; font-weight:600; color:#ccc; letter-spacing:2px;
  }}
</style>
<div class="top-stripe"></div>
<div class="label">Key Metric</div>
<div class="stat">
  <div class="stat-number">{safe_stat}</div>
  <div class="stat-context">{safe_ctx}</div>
</div>
<div class="bottom-bar"></div>
<div class="watermark">ET PULSE</div>
""")


def _facts_html(facts_text: str) -> str:
    # Split into up to 5 bullet points
    sentences = [s.strip() for s in facts_text.replace("\n", ". ").split(". ") if len(s.strip()) > 10]
    bullets = ""
    for i, fact in enumerate(sentences[:5]):
        safe = fact.replace("<", "&lt;").replace(">", "&gt;")
        bullets += f"""
        <div class="fact-row" style="animation-delay:{i*0.1}s">
          <div class="fact-num">{i+1}</div>
          <div class="fact-text">{safe}</div>
        </div>"""

    return _slide_html(f"""
<style>
  body {{ background: white; }}
  .sidebar {{
    position:absolute; left:0; top:0; bottom:0; width:12px;
    background:linear-gradient(180deg, #C0392B 0%, #E74C3C 100%);
  }}
  .header {{
    position:absolute; top:60px; left:80px;
    font-size:16px; font-weight:700; letter-spacing:6px;
    text-transform:uppercase; color:#C0392B;
  }}
  .title {{
    position:absolute; top:100px; left:80px;
    font-family:'Playfair Display',serif;
    font-size:52px; font-weight:900; color:#1A1A1A; letter-spacing:-1px;
  }}
  .facts-container {{
    position:absolute; top:220px; left:80px; right:80px; bottom:80px;
    display:flex; flex-direction:column; gap:28px; justify-content:center;
  }}
  .fact-row {{
    display:flex; align-items:flex-start; gap:28px;
  }}
  .fact-num {{
    width:48px; height:48px; border-radius:50%;
    background:#C0392B; color:white;
    font-size:20px; font-weight:800;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0;
  }}
  .fact-text {{
    font-size:28px; font-weight:500; color:#1A1A1A;
    line-height:1.4; padding-top:8px;
  }}
  .et-tag {{
    position:absolute; bottom:40px; right:60px;
    font-size:18px; font-weight:700; letter-spacing:2px; color:#ddd;
  }}
</style>
<div class="sidebar"></div>
<div class="header">Analysis</div>
<div class="title">Key Facts</div>
<div class="facts-container">{bullets}</div>
<div class="et-tag">ET PULSE</div>
""")


def _impact_html(impact_text: str) -> str:
    safe = impact_text.replace("<", "&lt;").replace(">", "&gt;")
    return _slide_html(f"""
<style>
  body {{ background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }}
  .glow {{
    position:absolute; top:50%; left:50%;
    transform:translate(-50%,-50%);
    width:600px; height:600px; border-radius:50%;
    background:radial-gradient(circle, rgba(192,57,43,0.15) 0%, transparent 70%);
  }}
  .top-label {{
    position:absolute; top:80px; left:80px;
    font-size:16px; font-weight:700; letter-spacing:6px;
    text-transform:uppercase; color:#E74C3C;
  }}
  .title {{
    position:absolute; top:120px; left:80px;
    font-family:'Playfair Display',serif;
    font-size:64px; font-weight:900; color:white; letter-spacing:-2px;
  }}
  .divider {{
    position:absolute; top:230px; left:80px;
    width:120px; height:4px;
    background:linear-gradient(90deg, #C0392B, transparent);
    border-radius:2px;
  }}
  .impact-text {{
    position:absolute; top:290px; left:80px; right:200px;
    font-size:30px; font-weight:400; color:rgba(255,255,255,0.85);
    line-height:1.75;
  }}
  .callout {{
    position:absolute; bottom:100px; left:80px;
    background:rgba(192,57,43,0.2); border-left:4px solid #C0392B;
    padding:20px 32px; border-radius:0 8px 8px 0;
    font-size:22px; font-weight:600; color:#E74C3C;
    letter-spacing:0.5px;
  }}
</style>
<div class="glow"></div>
<div class="top-label">Market Intelligence</div>
<div class="title">What This Means</div>
<div class="divider"></div>
<div class="impact-text">{safe[:400]}</div>
<div class="callout">For Investors & Professionals</div>
""", bg="#1a1a2e")


def _outro_html(headline: str) -> str:
    safe = headline.replace("<", "&lt;").replace(">", "&gt;")[:80]
    return _slide_html(f"""
<style>
  body {{
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    display:flex; align-items:center; justify-content:center;
  }}
  .center {{
    text-align:center;
  }}
  .et-logo-big {{
    display:inline-block;
    background:#C0392B; color:white;
    font-size:64px; font-weight:900; letter-spacing:-2px;
    padding:20px 48px; border-radius:6px;
    margin-bottom:40px;
  }}
  .tagline {{
    font-size:28px; font-weight:500; color:#888;
    letter-spacing:4px; text-transform:uppercase; margin-bottom:60px;
  }}
  .cta {{
    font-size:36px; font-weight:700; color:white; margin-bottom:20px;
  }}
  .read-more {{
    font-size:22px; color:#C0392B; font-weight:600;
  }}
  .divider {{
    width:200px; height:2px; background:#333; margin:40px auto;
  }}
  .powered {{
    font-size:18px; color:#444; letter-spacing:3px; text-transform:uppercase;
  }}
</style>
<div class="center">
  <div class="et-logo-big">ET</div>
  <div class="tagline">Economic Times Intelligence</div>
  <div class="cta">Read the Full Story</div>
  <div class="read-more">economictimes.indiatimes.com</div>
  <div class="divider"></div>
  <div class="powered">Powered by ET Pulse AI</div>
</div>
""", bg="#111")


# ── Playwright screenshot engine ─────────────────────────────────────────────

async def _render_all_slides_async(slides_spec: list, paths: list) -> list:
    """
    Internal async function: 1 browser, N parallel pages, N screenshots.
    Called via asyncio.run() from a thread — never from FastAPI's event loop.
    """
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            args=["--no-sandbox", "--disable-setuid-sandbox"]
        )
        context = await browser.new_context(
            viewport={"width": 1920, "height": 1080},
            device_scale_factor=1,
        )

        async def capture_one(html: str, output_path: str) -> bool:
            page = await context.new_page()
            try:
                await page.set_content(html, wait_until="domcontentloaded")
                await page.wait_for_timeout(300)
                await page.screenshot(path=output_path, type="png", full_page=False)
                return True
            except Exception as e:
                print(f"Playwright: screenshot failed for {output_path}: {e}")
                return False
            finally:
                await page.close()

        tasks = [capture_one(html, path) for (_, html), path in zip(slides_spec, paths)]
        results = await asyncio.gather(*tasks)
        await browser.close()

    return results


def generate_all_slides(script_data: dict, prefix: str = "") -> list:
    """
    SYNC function — safe to call from FastAPI via run_in_executor.
    Runs Playwright inside asyncio.run() in the current thread,
    which creates a fresh isolated event loop that doesn't conflict
    with FastAPI's main event loop.
    """
    script = script_data.get("script", {})
    headline = script_data.get("headline", "ET News Update")
    key_stat  = script_data.get("key_stat", "Key Data")
    date_str  = datetime.now().strftime("%B %d, %Y")

    slides_spec = [
        (f"{prefix}slide_title.png",  _title_html(headline, date_str)),
        (f"{prefix}slide_stat.png",   _stat_html(key_stat, script.get("context", {}).get("text", "")[:120])),
        (f"{prefix}slide_facts.png",  _facts_html(script.get("key_facts", {}).get("text", ""))),
        (f"{prefix}slide_impact.png", _impact_html(script.get("market_impact", {}).get("text", ""))),
        (f"{prefix}slide_outro.png",  _outro_html(headline)),
    ]

    paths = [str(SLIDES_DIR / filename) for filename, _ in slides_spec]

    try:
        results = asyncio.run(_render_all_slides_async(slides_spec, paths))
    except Exception as e:
        print(f"Playwright: generate_all_slides failed: {e}")
        return []

    slide_paths = [path for path, success in zip(paths, results) if success]
    return slide_paths
