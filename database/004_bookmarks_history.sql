-- ============================================================================
-- ET PULSE — SUPPLEMENTAL TABLES (Bookmarks + Reading History)
-- Migration: 004_bookmarks_history.sql
-- These tables existed in the old SQLite system and are now migrated to Supabase.
-- Must be applied AFTER 001_schema.sql and 002_rls_policies.sql
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- BOOKMARKS TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bookmarks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    article_url   TEXT NOT NULL,
    article_title TEXT,
    article_topic TEXT,
    article_source TEXT,
    article_date  TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_bookmark_user_url UNIQUE (user_id, article_url)
);

CREATE INDEX idx_bookmarks_user ON public.bookmarks (user_id);
CREATE INDEX idx_bookmarks_created ON public.bookmarks (created_at DESC);

COMMENT ON TABLE public.bookmarks IS 'User-saved article bookmarks, migrated from SQLite';

-- RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookmarks_select_own ON public.bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY bookmarks_insert_own ON public.bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY bookmarks_delete_own ON public.bookmarks
    FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- READING HISTORY TABLE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reading_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    article_url     TEXT NOT NULL,
    article_title   TEXT,
    article_topic   TEXT,
    article_source  TEXT,
    read_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_progress   FLOAT DEFAULT 0,

    CONSTRAINT uq_history_user_url UNIQUE (user_id, article_url)
);

CREATE INDEX idx_history_user ON public.reading_history (user_id);
CREATE INDEX idx_history_read_at ON public.reading_history (read_at DESC);

COMMENT ON TABLE public.reading_history IS 'User reading history with progress tracking, migrated from SQLite';

-- RLS
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY history_select_own ON public.reading_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY history_insert_own ON public.reading_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY history_update_own ON public.reading_history
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY history_delete_own ON public.reading_history
    FOR DELETE USING (auth.uid() = user_id);
