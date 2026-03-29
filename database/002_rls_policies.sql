-- ============================================================================
-- ET PULSE — ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_policies.sql
-- Must be applied AFTER 001_schema.sql
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- ENABLE RLS ON ALL USER-FACING TABLES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_chunks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthesis_queries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_pagination      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_agent_outputs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_timeseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_jobs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_stage_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translation_jobs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.language_glossary    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_run_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs       ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────────────
-- USERS TABLE
-- Users can read and update only their own profile
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY users_select_own ON public.users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY users_insert_own ON public.users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY users_delete_own ON public.users
    FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- ARTICLES TABLE
-- Articles are public-readable (all authenticated users can browse)
-- Only the service role inserts articles (via the ingestion pipeline)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY articles_select_authenticated ON public.articles
    FOR SELECT USING (auth.role() = 'authenticated');

-- No INSERT/UPDATE/DELETE policies for anon or authenticated.
-- Only service_role (which bypasses RLS) can mutate articles.


-- ─────────────────────────────────────────────────────────────────────────────
-- ARTICLE CHUNKS TABLE
-- Read-only for authenticated users. Written by service role only.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY chunks_select_authenticated ON public.article_chunks
    FOR SELECT USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────────────────────────────────
-- SYNTHESIS QUERIES TABLE
-- Users can read and insert their own queries
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY synthesis_select_own ON public.synthesis_queries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY synthesis_insert_own ON public.synthesis_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- No UPDATE or DELETE — queries are immutable audit records


-- ─────────────────────────────────────────────────────────────────────────────
-- FEED ITEMS TABLE
-- Users can CRUD only their own feed items
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY feed_select_own ON public.feed_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY feed_insert_own ON public.feed_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY feed_update_own ON public.feed_items
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY feed_delete_own ON public.feed_items
    FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- FEED PAGINATION TABLE
-- Users can read and upsert only their own pagination cursor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY feed_pagination_select_own ON public.feed_pagination
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY feed_pagination_insert_own ON public.feed_pagination
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY feed_pagination_update_own ON public.feed_pagination
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- STORIES TABLE
-- Users can CRUD only their own stories
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY stories_select_own ON public.stories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY stories_insert_own ON public.stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY stories_update_own ON public.stories
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY stories_delete_own ON public.stories
    FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- STORY AGENT OUTPUTS TABLE
-- Users can read outputs for stories they own (join through stories.user_id)
-- Service role writes agent outputs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY story_outputs_select_own ON public.story_agent_outputs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stories s
            WHERE s.story_id = story_agent_outputs.story_id
            AND s.user_id = auth.uid()
        )
    );

-- Inserts handled by service role (agent pipeline). No user INSERT policy needed.


-- ─────────────────────────────────────────────────────────────────────────────
-- SENTIMENT TIMESERIES TABLE
-- Users can read sentiment data for their own stories
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY sentiment_select_own ON public.sentiment_timeseries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.stories s
            WHERE s.story_id = sentiment_timeseries.story_id
            AND s.user_id = auth.uid()
        )
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- VIDEO JOBS TABLE
-- Users can read and insert their own video jobs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY video_jobs_select_own ON public.video_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY video_jobs_insert_own ON public.video_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updates (status changes) are done by the pipeline via service role


-- ─────────────────────────────────────────────────────────────────────────────
-- VIDEO STAGE LOGS TABLE
-- Users can read stage logs for their own jobs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY video_stages_select_own ON public.video_stage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.video_jobs v
            WHERE v.job_id = video_stage_logs.job_id
            AND v.user_id = auth.uid()
        )
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- TRANSLATION JOBS TABLE
-- Users can read and insert their own translation jobs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY translations_select_own ON public.translation_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY translations_insert_own ON public.translation_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- LANGUAGE GLOSSARY TABLE
-- Glossary is public-readable for all authenticated users
-- Only service role can mutate glossary entries
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY glossary_select_authenticated ON public.language_glossary
    FOR SELECT USING (auth.role() = 'authenticated');


-- ─────────────────────────────────────────────────────────────────────────────
-- AGENT RUN LOGS TABLE
-- Users can read their own agent run logs (for personal analytics)
-- Service role inserts all logs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY agent_logs_select_own ON public.agent_run_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Insert is done via service role (backend pipeline)


-- ─────────────────────────────────────────────────────────────────────────────
-- API USAGE LOGS TABLE
-- No user access — service role only (admin observability)
-- RLS enabled with no policies = blocked for all non-service roles
-- ─────────────────────────────────────────────────────────────────────────────

-- No policies defined. Only service_role (which bypasses RLS) can access.
-- This is intentional — API usage is internal observability data.
