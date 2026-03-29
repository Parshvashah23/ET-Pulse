-- ============================================================================
-- ET PULSE — SUPABASE STORAGE BUCKETS & ACCESS POLICIES
-- Migration: 003_storage.sql
-- Must be applied AFTER 001_schema.sql
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CREATE STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────────────────────

-- Video outputs bucket (MP4 files from AI Video Studio)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'video-outputs',
    'video-outputs',
    false,
    104857600,  -- 100 MB per file
    ARRAY['video/mp4', 'video/webm']
);

-- Audio outputs bucket (gTTS audio from Vernacular Newsroom + Video Studio)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio-outputs',
    'audio-outputs',
    false,
    20971520,  -- 20 MB per file
    ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
);

-- Article media bucket (scraped article images, thumbnails)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'article-media',
    'article-media',
    true,       -- public bucket — images are shareable
    10485760,   -- 10 MB per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. STORAGE ACCESS POLICIES — video-outputs
-- ─────────────────────────────────────────────────────────────────────────────

-- Users can read their own video files (path pattern: {user_id}/*)
CREATE POLICY video_outputs_select_own ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'video-outputs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can upload their own video files
CREATE POLICY video_outputs_insert_own ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'video-outputs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own video files
CREATE POLICY video_outputs_delete_own ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'video-outputs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. STORAGE ACCESS POLICIES — audio-outputs
-- ─────────────────────────────────────────────────────────────────────────────

-- Users can read their own audio files (path pattern: {user_id}/*)
CREATE POLICY audio_outputs_select_own ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'audio-outputs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can upload their own audio files
CREATE POLICY audio_outputs_insert_own ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'audio-outputs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own audio files
CREATE POLICY audio_outputs_delete_own ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'audio-outputs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. STORAGE ACCESS POLICIES — article-media (public read)
-- ─────────────────────────────────────────────────────────────────────────────

-- Anyone can read article media (public bucket)
CREATE POLICY article_media_select_public ON storage.objects
    FOR SELECT
    USING (bucket_id = 'article-media');

-- Only service role can upload article media (ingestion pipeline)
-- No INSERT policy for authenticated users — service_role bypasses RLS.
