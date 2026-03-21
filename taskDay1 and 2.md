# ET Intelligence — Day 1 & Day 2 Implementation

## Day 1: Foundation — Environment + Data Pipeline + ChromaDB + Backend + Frontend Shell

- [x] Project scaffold (folders, dependencies)
  - [x] Create folder structure: `/backend`, `/frontend`, `/agents`, `/data`, `/video`
  - [x] Backend: install Python dependencies
  - [ ] Frontend: scaffold Next.js app with TypeScript + Tailwind
  - [x] Create `.env` template
- [x] Article scraper + chunker
  - [x] Write `data/scraper.py` — newspaper3k scraper for 35 ET articles
  - [x] Write `data/chunker.py` — 400-char chunks, 80-char overlap
  - [x] Run scraper and save `articles.json` + `chunks.json`
- [x] ChromaDB vector store
  - [x] Write `data/embed.py` — embed chunks via OpenAI → store in ChromaDB
  - [x] Write `data/test_rag.py` — verify RAG retrieval quality
- [x] FastAPI backend skeleton
  - [x] Write `backend/main.py` — FastAPI app with CORS
  - [x] Write `backend/rag.py` — `retrieve(query, n=8)` function
  - [x] Write POST `/api/brief` endpoint stub
- [x] Next.js frontend shell + SSE wiring
  - [x] Design system in `globals.css` (ET color palette)
  - [x] Build `SearchBar.tsx` — cycling placeholder, submit
  - [x] Build `Layout.tsx` — nav + content area
  - [x] Wire SSE handler

## Day 2: Core AI — Synthesis Agent + News Navigator + My ET

- [x] Synthesis Agent + streaming endpoint
  - [x] Write `agents/synthesis.py` — Claude Haiku structured briefing
  - [x] Build POST `/api/brief/stream` SSE endpoint
  - [x] Add persona variants
- [x] Follow-up Q&A + fact-check agent
  - [x] Build POST `/api/followup` endpoint
  - [x] Write `agents/factcheck.py` — confidence scoring
- [x] News Navigator UI — complete
  - [x] Build `StreamingText.tsx`
  - [x] Build `BriefingLayout.tsx`
  - [x] Build `SectionNav.tsx`
  - [x] Build `SourceCard.tsx`
  - [x] Build `FollowUpChat.tsx`
  - [x] Build `PersonaSwitcher.tsx`
  - [x] Wire all components together
- [x] My ET feed — backend
  - [x] Write `agents/feed.py`
  - [x] Build POST `/api/feed` endpoint
- [x] My ET feed — UI + onboarding
  - [x] Build `app/onboarding/page.tsx`
  - [x] Build `app/feed/page.tsx`
  - [x] Build `PersonaBanner.tsx`
