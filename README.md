<div align="center">

<img src="https://img.shields.io/badge/ET%20Pulse-⚡%20AI%20Financial%20Intelligence-C0392B?style=for-the-badge" alt="ET Pulse"/>

# ET Pulse ⚡

### The AI-Native Financial Newsroom of the Future

*Built for the Economic Times Hackathon 2026*

<br/>

[![ET Hackathon](https://img.shields.io/badge/ET_Hackathon-2026-C0392B?style=flat-square)](https://economictimes.indiatimes.com/)
[![Groq Llama 3.3](https://img.shields.io/badge/LLM-Groq%20Llama%203.3%2070B-F59E0B?style=flat-square)](https://groq.com)
[![Next.js 15](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![ChromaDB](https://img.shields.io/badge/VectorDB-ChromaDB-FF6F61?style=flat-square)](https://www.trychroma.com/)
[![newsdata.io](https://img.shields.io/badge/News-newsdata.io-4A90D9?style=flat-square)](https://newsdata.io/)


<br/>

> **ET Pulse** transforms traditional linear financial journalism into dynamic, personalized, multi-agent intelligence experiences. Stop reading 15 articles to understand one event — get structured briefings, automated video segments, sentiment timelines, and culturally-adapted vernacular summaries, all in seconds.

<br/>

[Explore Features](#-the-5-core-experiences) · [Architecture](#️-system-architecture) · [Quick Start](#️-getting-started) · [Tech Stack](#-tech-stack) · [Changelog](#-changelog) · [Contributing](#-contributing)

</div>

---

## 📸 Overview

ET Pulse is a comprehensive financial intelligence platform built on a **multi-agent AI orchestration layer**. It reimagines how users consume complex financial news by delivering:

- **Live news ingestion** via the `newsdata.io` API with a seamless offline ChromaDB fallback
- **RAG-powered synthesis** across financial article archives with zero hallucinations
- **Persona-aware feed curation** for students, investors, and professionals
- **Narrative intelligence** that tracks complex financial stories end-to-end
- **AI video generation** that converts briefings into broadcast-ready segments in under 30 seconds
- **Vernacular adaptation** that goes beyond translation into true cultural localization

---

## 🚀 The 5 Core Experiences

### 1. 🔍 News Navigator — RAG Synthesis Engine

Stop reading 15 articles to understand one event. Enter any query and the **Synthesis Agent** retrieves exact, cited snippets from across financial archives to generate a structured, comprehensive briefing — streamed live.

| Capability | Detail |
|---|---|
| **Live Data** | Real-time article ingestion via `newsdata.io` API (India-region, English) |
| **Offline Fallback** | Automatic failover to local ChromaDB if the API rate-limits or fails |
| **Embeddings** | Local `all-MiniLM-L6-v2` via `sentence-transformers` |
| **Vector Store** | ChromaDB (persistent, local) |
| **Streaming** | Real-time token delivery via Server-Sent Events (SSE) |
| **Citation** | 100% grounded claims — every statement is source-linked |
| **Glossary** | Inline financial term tooltips for complex jargon |

---

### 2. 📰 My ET Feed — Persona-Driven Curation

No two users are alike. The **Curation Agent** dynamically scores and ranks incoming news stories based on your professional background, portfolio composition, and declared interests.

- **Roles Supported**: Undergraduate Student · Mutual Fund Investor · Tech Founder · Trader · Analyst
- **Justification Blocks**: Every article surfaces a reason — *"This SEBI regulation directly affects your algo-trading portfolio."*
- **Real-Time Rescoring**: Your feed re-ranks itself as new stories break
- **Pagination**: "Load More Insights" support with cursor-offset logic for infinite scrolling through AI-curated news
- **Regional Focus**: Hard-constrained to English-language, India-region (`country=in`) sources for maximum relevance

---

### 3. 📈 Story Arc Tracker — Narrative Intelligence

Financial news doesn't happen in a vacuum. Track complex multi-week sagas — IPO rollouts, hostile takeovers, RBI policy cycles — through a **5-agent parallel intelligence dashboard**.

| Agent | Function |
|---|---|
| **Timeline Agent** | Chronologically plots all major events in a story |
| **Key Players Agent** | Extracts entities, roles, and relationships |
| **Sentiment Agent** | Time-series charting of evolving market mood |
| **Predictions Agent** | Forward-looking AI impact signals |
| **Contrarian Agent** | Surfaces underrepresented and dissenting perspectives |

All five agents run in parallel, updating the dashboard simultaneously.

---

### 4. 🎬 AI Video Studio — Broadcast-Ready in 30 Seconds

Convert any financial brief into a polished, narrated news segment automatically.

```
Groq Script Agent  →  gTTS Audio  →  Playwright Slide Generation  →  MoviePy Assembly  →  1080p MP4
```

- **Output**: Fully assembled 1080p MP4 with synced narration, visual context cards, and ET branding
- **Use Case**: Ready for YouTube Shorts, Instagram Reels, or in-app video briefings
- **Latency**: End-to-end generation in under 30 seconds

---

### 5. 🌐 Vernacular Newsroom — Cultural Adaptation Engine

Financial literacy should have no language barrier. Unlike basic machine translation, the **Vernacular Agent** culturally adapts content — rewriting briefings in the style of *Loksatta* (Marathi) or *Dainik Bhaskar* (Hindi).

**Supported Languages:**

`English` · `Hindi` · `Marathi`

- **Style Adaptation**: Writing tone matched to regional publication standards
- **Regional Glossaries**: Dedicated financial term vocabularies per language
- **Audio Narration**: Full text-to-speech output in the target language

---

## 🏗️ System Architecture

ET Pulse is powered by a multi-agent orchestration layer connecting a Next.js UI to ultra-low-latency Groq inference.

```mermaid
graph TD
    User([👤 User]) <--> Frontend[Next.js 15 · Tailwind 4 UI]
    Frontend <--> Backend[FastAPI Backend]

    subgraph Agentic_Layer [🤖 Agentic Layer — 12+ Agents]
        Backend --> Synthesis[Synthesis Agent]
        Backend --> FactCheck[Fact-Check Agent]
        Backend --> FeedAgent[Curation Agent]
        Backend --> Timeline[Timeline Agent]
        Backend --> Sentiment[Sentiment Agent]
        Backend --> ScriptAgent[Script Agent]
        Backend --> Translate[Vernacular Agent]
    end

    Synthesis --> LLM[⚡ Groq · Llama 3.3 70B Versatile]
    FactCheck --> LLM
    FeedAgent --> LLM
    Timeline --> LLM
    Translate --> LLM

    subgraph Data_Layer [🗄️ Data Layer]
        Backend --> RAG[RAG Module — rag.py]
        RAG -->|Primary| NewsAPI[newsdata.io Live API]
        RAG -->|Fallback| Chroma[(ChromaDB Vector Store)]
        NewsAPI --> Chunker[Document Chunker]
        Chunker --> Chroma
    end

    subgraph Video_Pipeline [🎬 Video Pipeline]
        ScriptAgent --> TTS[gTTS Audio]
        ScriptAgent --> Slides[Playwright Slides]
        TTS --> Assembler[MoviePy Assembler]
        Slides --> Assembler
        Assembler --> Output[1080p MP4 Output]
    end
```

---

## 🧰 Tech Stack

### Backend
| Layer | Technology |
|---|---|
| **Framework** | FastAPI + Uvicorn |
| **LLM Engine** | Groq API — `llama-3.3-70b-versatile` |
| **Orchestration** | LangChain |
| **Vector Database** | ChromaDB (persistent) |
| **Embeddings** | `sentence-transformers` — `all-MiniLM-L6-v2` |
| **Live News** | `newsdata.io` API (India-region, English) |
| **Video Generation** | `moviepy` + `playwright` + `gTTS` |
| **Data Validation** | Pydantic v2 |
| **Database** | Supabase (PostgreSQL) |
| **Containerization** | Docker + Docker Compose |

### Frontend
| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 + semantic CSS variables |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Typography** | Merriweather (Editorial) + Inter (Data/UI) |

### Design System
- **Theme**: High-contrast dark mode with semantic CSS variable tokens replacing all hardcoded classes; Slate/Zinc base with ET Red + Gold brand accents
- **Effects**: Glassmorphism via `backdrop-filter`, noise textures, micro-interaction animations
- **Philosophy**: Premium Fintech SaaS — professional Lucide SVG iconography, financial-grade Merriweather + Inter typographic stack

---

## 📂 Project Structure

```
ET-Pulse/
├── backend/
│   ├── app/
│   │   ├── api/            # REST & SSE endpoint definitions
│   │   ├── agents/         # Individual AI agent modules (12+)
│   │   │   ├── synthesis.py
│   │   │   ├── curation.py
│   │   │   ├── timeline.py
│   │   │   ├── sentiment.py
│   │   │   ├── vernacular.py
│   │   │   └── script.py
│   │   ├── core/           # App config, settings, dependencies
│   │   ├── models/         # Pydantic schemas & data models
│   │   ├── services/       # RAG pipeline, video assembly, scraper
│   │   │   ├── rag/
│   │   │   │   ├── rag.py          # Live API fetch + ChromaDB fallback
│   │   │   │   ├── chunker.py
│   │   │   │   ├── embedder.py
│   │   │   │   └── retriever.py
│   │   │   ├── video/
│   │   │   │   ├── tts.py
│   │   │   │   ├── slides.py
│   │   │   │   └── assembler.py
│   │   │   └── scraper.py
│   │   └── main.py         # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── docker-compose.yml
│
└── frontend/
    ├── app/
    │   ├── api/            # API client layer
    │   ├── feed/           # My ET Feed page (with pagination)
    │   ├── navigator/      # News Navigator (RAG) page
    │   ├── story/          # Story Arc Tracker page
    │   ├── video/          # AI Video Studio page
    │   ├── vernacular/     # Vernacular Newsroom page
    │   ├── privacy/        # Privacy Policy page
    │   ├── terms/          # Terms of Service page
    │   └── page.tsx        # Home / landing page
    ├── components/         # Reusable UI components (22+ dark-mode patched)
    │   ├── ui/
    │   ├── agents/
    │   └── layout/
    ├── lib/                # Utilities, hooks, constants
    ├── public/
    └── .env.example
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- Docker & Docker Compose (optional, for containerized deployment)
- A [Groq API Key](https://console.groq.com/)
- A [newsdata.io API Key](https://newsdata.io/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/et-pulse.git
cd et-pulse
```

### 2. Configure Environment Variables

**Backend** — create `backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```

```env
# Required — Groq LLM inference
GROQ_API_KEY=your_groq_api_key_here

# Required — Live news ingestion
NEWSDATA_API_KEY=your_newsdata_api_key_here

# Required — Supabase database
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Optional — Frontend URL for Playwright slide generation
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env.local` from the example:
```bash
cp frontend/.env.example frontend/.env.local
```

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

### 3a. One-Click Start (Windows — PowerShell)

```powershell
# From the project root — installs all dependencies and starts both servers
.\run_app.ps1
```

This script will:
1. Create a Python virtual environment and install `requirements.txt`
2. Run `npm install` for the frontend
3. Install Playwright's Chromium browser
4. Launch FastAPI on `localhost:8000` and Next.js on `localhost:3000` concurrently

---

### 3b. Manual Start (Linux / macOS)

**Start the Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload --port 8000
```

**Start the Frontend** (in a separate terminal):
```bash
cd frontend
npm install
npm run dev
```

---

### 3c. Docker Compose

```bash
# From the project root
docker-compose up --build
```

This starts the FastAPI backend, ChromaDB, and Supabase edge proxy in a networked container cluster.

---

### Accessing the Application

| Service | URL |
|---|---|
| **Frontend (Next.js)** | http://localhost:3000 |
| **Backend API (FastAPI)** | http://localhost:8000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API Docs (ReDoc)** | http://localhost:8000/redoc |
| **Privacy Policy** | http://localhost:3000/privacy |
| **Terms of Service** | http://localhost:3000/terms |

---

## 🌟 Key Design Decisions

### Why Groq?
Ultra-low latency inference is critical for real-time streaming experiences. Groq's LPU architecture delivers token generation speeds that make SSE-streamed briefings feel instant rather than loading.

### Why newsdata.io + ChromaDB Fallback?
Decoupling the frontend from static local data means the feed always reflects live market conditions. The `try/except` failover in `rag.py` ensures zero downtime — if the live API hits a rate limit, ChromaDB's persistent offline store serves as a seamless backup without any user-facing disruption.

### Why Multi-Agent over a Single Prompt?
Each of the 12+ agents is independently optimized with a focused system prompt, enabling parallel execution (Story Arc's 5 agents run concurrently), independent failure isolation, and cleaner separation of concerns for future extensibility. Agents are scoped as **"Top-Tier Financial Journalist"** personas rather than being restricted to a single publication, allowing them to synthesize any relevant financial content fetched from the live API.

### Why Semantic CSS Variables?
Hardcoded colour classes (`bg-white`, `text-et-ink`) break in dark mode. By running an automated sweep across all 22 affected components and replacing them with CSS variable tokens, dark mode is now consistent system-wide — including previously broken surfaces like the search bar, Story Arc dashboard, Video Studio, and the onboarding wizard.

---

## 📋 Changelog

### Latest — `live news fetch | model testing`

#### Data & Backend
- **Real-Time News Ingestion**: Fully decoupled from static local data by integrating the `newsdata.io` API as the primary news source
- **Zero-Downtime Fallback**: Refactored `backend/rag.py` with a `try/except` failover — live API failures or rate limits automatically fall back to local ChromaDB with no crash
- **Agent Persona Broadening**: Rewrote system prompts across all 12+ AI agents; agents now operate as "Top-Tier Financial Journalists" able to synthesize any fetched financial content, not just ET-sourced articles
- **Regional Sanitization**: Hardcoded global market fetches to `language=en` and `country=in` to keep the core feed India-relevant

#### UI/UX & Design
- **Deep Dark Mode Sweep**: Automated Python script traced and replaced hardcoded classes (`bg-white`, `text-et-ink`, etc.) with semantic CSS variables across 22 components and pages
- **Professional Typography**: Replaced decorative fonts with the financial-grade **Merriweather + Inter** stack for a "Wall Street" editorial feel
- **Dark Mode Bug Fixes**: Resolved search bar visibility and onboarding wizard high-contrast rendering issues

#### Feed & Pagination
- **Load More Support**: Added "Load More Insights" in the My ET Feed
- **Cursor Offset Logic**: Updated frontend and backend API to handle `page` parameters for infinite AI-curated news scrolling

#### Legal & Compliance
- **Privacy Policy Page**: Responsive `/privacy` route styled with the app's premium aesthetic
- **Terms of Service Page**: Responsive `/terms` route styled consistently

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please ensure your PR includes relevant tests and follows the existing code style. For major changes, open an issue first to discuss the proposal.

---

## 🏆 Hackathon Context

ET Pulse was built for the **Economic Times Hackathon 2026**. The vision: move ET from a static news publisher to a **personalized, real-time financial intelligence partner**.

From instant explainer videos for YouTube Shorts to vernacular audio briefings for tier-2 city investors navigating complex IPOs — ET Pulse broadens audience reach while driving deep platform engagement.

---

<div align="center">

Built with ⚡ by the ET Pulse team · Economic Times Hackathon 2026

</div>
