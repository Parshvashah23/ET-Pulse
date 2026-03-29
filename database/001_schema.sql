-- ============================================================================
-- ET PULSE — COMPLETE SUPABASE / POSTGRESQL SCHEMA
-- Migration: 001_schema.sql
-- Compatible with: Supabase (PostgreSQL 15+), gen_random_uuid(), timestamptz
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram indexes for text search


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ─────────────────────────────────────────────────────────────────────────────

-- User persona roles (Module 2 — My ET Feed)
CREATE TYPE user_role AS ENUM (
    'student',
    'mf_investor',
    'tech_founder',
    'trader',
    'analyst'
);

-- Story Arc status (Module 3)
CREATE TYPE story_status AS ENUM (
    'active',
    'archived'
);

-- Story Arc agent types (Module 3)
CREATE TYPE arc_agent_type AS ENUM (
    'timeline',
    'key_players',
    'sentiment',
    'predictions',
    'contrarian'
);

-- Sentiment labels (Module 3)
CREATE TYPE sentiment_label AS ENUM (
    'positive',
    'neutral',
    'negative'
);

-- Video job status (Module 4)
CREATE TYPE video_job_status AS ENUM (
    'queued',
    'processing',
    'complete',
    'failed'
);

-- Video pipeline stage (Module 4)
CREATE TYPE video_stage AS ENUM (
    'script',
    'tts',
    'slides',
    'assembly'
);

-- Vernacular target languages (Module 5)
CREATE TYPE target_language AS ENUM (
    'hindi',
    'marathi',
    'english'
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. GLOBAL / CROSS-CUTTING TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- 2a. Users table — linked to Supabase Auth (auth.users)
CREATE TABLE public.users (
    user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name  TEXT,
    email         TEXT NOT NULL,
    role          user_role DEFAULT 'student',
    interests     TEXT[] DEFAULT '{}',
    portfolio_tags TEXT[] DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_created_at ON public.users (created_at);

COMMENT ON TABLE public.users IS 'Application-level user profile, extending Supabase auth.users';


-- 2b. Agent run logs — observability across all 12+ agents
CREATE TABLE public.agent_run_logs (
    run_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
    agent_type        TEXT NOT NULL,
    module            TEXT NOT NULL,
    prompt_tokens     INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    latency_ms        INT NOT NULL DEFAULT 0,
    model             TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
    error_text        TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_runs_user ON public.agent_run_logs (user_id);
CREATE INDEX idx_agent_runs_module ON public.agent_run_logs (module);
CREATE INDEX idx_agent_runs_created ON public.agent_run_logs (created_at DESC);
CREATE INDEX idx_agent_runs_agent_type ON public.agent_run_logs (agent_type);

COMMENT ON TABLE public.agent_run_logs IS 'Observability log for every LLM agent invocation across all modules';


-- 2c. API usage logs — newsdata.io integration tracking
CREATE TABLE public.api_usage_logs (
    request_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint          TEXT NOT NULL,
    status_code       INT NOT NULL,
    articles_returned INT NOT NULL DEFAULT 0,
    used_fallback     BOOLEAN NOT NULL DEFAULT false,
    query_text        TEXT,
    response_time_ms  INT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_api_usage_created ON public.api_usage_logs (created_at DESC);
CREATE INDEX idx_api_usage_endpoint ON public.api_usage_logs (endpoint);

COMMENT ON TABLE public.api_usage_logs IS 'Tracks every outbound call to the newsdata.io API for rate-limit monitoring';


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. MODULE 1 — NEWS NAVIGATOR (RAG Synthesis Engine)
-- ─────────────────────────────────────────────────────────────────────────────

-- 3a. Raw articles ingested from newsdata.io
CREATE TABLE public.articles (
    article_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title         TEXT NOT NULL,
    source_name   TEXT,
    url           TEXT NOT NULL,
    published_at  TIMESTAMPTZ,
    content       TEXT,
    description   TEXT,
    language      TEXT NOT NULL DEFAULT 'en',
    country       TEXT NOT NULL DEFAULT 'in',
    category      TEXT,
    image_url     TEXT,
    ingested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_articles_url UNIQUE (url)
);

CREATE INDEX idx_articles_published ON public.articles (published_at DESC);
CREATE INDEX idx_articles_category ON public.articles (category);
CREATE INDEX idx_articles_language ON public.articles (language);
CREATE INDEX idx_articles_ingested ON public.articles (ingested_at DESC);
CREATE INDEX idx_articles_title_trgm ON public.articles USING gin (title gin_trgm_ops);

COMMENT ON TABLE public.articles IS 'Raw articles ingested from newsdata.io API — canonical source for all modules';


-- 3b. Document chunks for RAG retrieval
CREATE TABLE public.article_chunks (
    chunk_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id       UUID NOT NULL REFERENCES public.articles(article_id) ON DELETE CASCADE,
    chunk_index      INT NOT NULL,
    chunk_text       TEXT NOT NULL,
    chroma_embedding_id TEXT,  -- reference to ChromaDB embedding ID
    token_count      INT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_chunk_per_article UNIQUE (article_id, chunk_index)
);

CREATE INDEX idx_chunks_article ON public.article_chunks (article_id);
CREATE INDEX idx_chunks_chroma_id ON public.article_chunks (chroma_embedding_id);

COMMENT ON TABLE public.article_chunks IS 'Chunked documents for RAG — each row maps to a ChromaDB embedding vector';


-- 3c. User queries and AI synthesis responses
CREATE TABLE public.synthesis_queries (
    query_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
    query_text     TEXT NOT NULL,
    response_text  TEXT,
    sources_cited  JSONB DEFAULT '[]'::jsonb,  -- array of {article_id, title, url, chunk_index}
    latency_ms     INT,
    prompt_tokens  INT,
    completion_tokens INT,
    model          TEXT DEFAULT 'llama-3.3-70b-versatile',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_synthesis_user ON public.synthesis_queries (user_id);
CREATE INDEX idx_synthesis_created ON public.synthesis_queries (created_at DESC);

COMMENT ON TABLE public.synthesis_queries IS 'Every RAG synthesis query + response with cited sources and token usage';


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MODULE 2 — MY ET FEED (Persona-Driven Curation)
-- ─────────────────────────────────────────────────────────────────────────────

-- 4a. Feed items — AI-scored articles per user
CREATE TABLE public.feed_items (
    feed_item_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    article_id      UUID NOT NULL REFERENCES public.articles(article_id) ON DELETE CASCADE,
    relevance_score FLOAT NOT NULL DEFAULT 0.0,
    justification   TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    is_saved        BOOLEAN NOT NULL DEFAULT false,
    served_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_feed_user_article UNIQUE (user_id, article_id)
);

CREATE INDEX idx_feed_user ON public.feed_items (user_id);
CREATE INDEX idx_feed_user_score ON public.feed_items (user_id, relevance_score DESC);
CREATE INDEX idx_feed_article ON public.feed_items (article_id);
CREATE INDEX idx_feed_served ON public.feed_items (served_at DESC);

COMMENT ON TABLE public.feed_items IS 'AI-curated feed: each row is an article scored for a specific user persona';


-- 4b. Feed pagination state
CREATE TABLE public.feed_pagination (
    user_id      UUID PRIMARY KEY REFERENCES public.users(user_id) ON DELETE CASCADE,
    last_cursor  UUID,  -- references feed_items.feed_item_id
    page_size    INT NOT NULL DEFAULT 10,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.feed_pagination IS 'Cursor-based pagination state for infinite scroll in My ET Feed';


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. MODULE 3 — STORY ARC TRACKER (Narrative Intelligence)
-- ─────────────────────────────────────────────────────────────────────────────

-- 5a. Story entities
CREATE TABLE public.stories (
    story_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    story_title TEXT NOT NULL,
    query_text  TEXT,  -- the search query used to seed the story
    status      story_status NOT NULL DEFAULT 'active',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stories_user ON public.stories (user_id);
CREATE INDEX idx_stories_status ON public.stories (status);
CREATE INDEX idx_stories_created ON public.stories (created_at DESC);

COMMENT ON TABLE public.stories IS 'User-created narrative tracking entities (e.g. "Reliance AGM 2026")';


-- 5b. Per-agent outputs per story
CREATE TABLE public.story_agent_outputs (
    output_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id    UUID NOT NULL REFERENCES public.stories(story_id) ON DELETE CASCADE,
    agent_type  arc_agent_type NOT NULL,
    output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    latency_ms  INT,
    run_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_story_outputs_story ON public.story_agent_outputs (story_id);
CREATE INDEX idx_story_outputs_agent ON public.story_agent_outputs (agent_type);
CREATE INDEX idx_story_outputs_run ON public.story_agent_outputs (run_at DESC);

COMMENT ON TABLE public.story_agent_outputs IS 'Output from each of the 5 Story Arc agents per run';


-- 5c. Sentiment time-series data
CREATE TABLE public.sentiment_timeseries (
    point_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id          UUID NOT NULL REFERENCES public.stories(story_id) ON DELETE CASCADE,
    source_article_id UUID REFERENCES public.articles(article_id) ON DELETE SET NULL,
    sentiment_score   FLOAT NOT NULL,
    sentiment_label   sentiment_label NOT NULL DEFAULT 'neutral',
    measured_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sentiment_story ON public.sentiment_timeseries (story_id);
CREATE INDEX idx_sentiment_time ON public.sentiment_timeseries (story_id, measured_at DESC);
CREATE INDEX idx_sentiment_article ON public.sentiment_timeseries (source_article_id);

COMMENT ON TABLE public.sentiment_timeseries IS 'Time-series sentiment data points for Story Arc charting';


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. MODULE 4 — AI VIDEO STUDIO
-- ─────────────────────────────────────────────────────────────────────────────

-- 6a. Video generation jobs
CREATE TABLE public.video_jobs (
    job_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
    topic             TEXT NOT NULL,
    status            video_job_status NOT NULL DEFAULT 'queued',
    script_text       TEXT,
    audio_url         TEXT,
    video_url         TEXT,
    slide_count       INT DEFAULT 0,
    duration_seconds  FLOAT DEFAULT 0.0,
    language          TEXT NOT NULL DEFAULT 'en',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at      TIMESTAMPTZ
);

CREATE INDEX idx_video_jobs_user ON public.video_jobs (user_id);
CREATE INDEX idx_video_jobs_status ON public.video_jobs (status);
CREATE INDEX idx_video_jobs_created ON public.video_jobs (created_at DESC);

COMMENT ON TABLE public.video_jobs IS 'Video generation job metadata — tracks the full pipeline from script to MP4';


-- 6b. Video pipeline stage logs
CREATE TABLE public.video_stage_logs (
    log_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id       UUID NOT NULL REFERENCES public.video_jobs(job_id) ON DELETE CASCADE,
    stage        video_stage NOT NULL,
    started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    error_text   TEXT,
    
    CONSTRAINT uq_video_stage_per_job UNIQUE (job_id, stage)
);

CREATE INDEX idx_video_stages_job ON public.video_stage_logs (job_id);

COMMENT ON TABLE public.video_stage_logs IS 'Per-stage pipeline logs for debugging and latency analysis in video generation';


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. MODULE 5 — VERNACULAR NEWSROOM
-- ─────────────────────────────────────────────────────────────────────────────

-- 7a. Translation / adaptation jobs
CREATE TABLE public.translation_jobs (
    job_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
    source_article_id UUID REFERENCES public.articles(article_id) ON DELETE SET NULL,
    source_text       TEXT NOT NULL,
    target_language   target_language NOT NULL,
    adapted_text      TEXT,
    publication_style TEXT,  -- e.g. 'Loksatta', 'Dainik Bhaskar'
    audio_url         TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_translations_user ON public.translation_jobs (user_id);
CREATE INDEX idx_translations_lang ON public.translation_jobs (target_language);
CREATE INDEX idx_translations_article ON public.translation_jobs (source_article_id);
CREATE INDEX idx_translations_created ON public.translation_jobs (created_at DESC);

COMMENT ON TABLE public.translation_jobs IS 'Cultural adaptation jobs — beyond machine translation, contextually adapted output';


-- 7b. Language glossary terms
CREATE TABLE public.language_glossary (
    term_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language      target_language NOT NULL,
    original_term TEXT NOT NULL,
    adapted_term  TEXT NOT NULL,
    definition    TEXT,
    domain        TEXT NOT NULL DEFAULT 'general',  -- e.g. 'equity', 'macro', 'banking'
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT uq_glossary_term UNIQUE (language, original_term)
);

CREATE INDEX idx_glossary_language ON public.language_glossary (language);
CREATE INDEX idx_glossary_domain ON public.language_glossary (domain);
CREATE INDEX idx_glossary_term_trgm ON public.language_glossary USING gin (original_term gin_trgm_ops);

COMMENT ON TABLE public.language_glossary IS 'Financial terminology glossary per language for consistent vernacular adaptation';


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRIGGER: auto-update updated_at on stories
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stories_updated_at
    BEFORE UPDATE ON public.stories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
