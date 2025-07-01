-- 00009_alter_communities_table.sql

-- 1) Create enum types if they don’t already exist
DO $$ BEGIN
  CREATE TYPE community_access_type  AS ENUM('public','private');
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$ BEGIN
  CREATE TYPE community_activity_level AS ENUM('low','medium','high');
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

-- 2) Add missing columns to the existing communities table
ALTER TABLE communities
  ADD COLUMN IF NOT EXISTS artist_id        UUID                     REFERENCES artists(id),
  ADD COLUMN IF NOT EXISTS access_type      community_access_type    NOT NULL DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS category         VARCHAR(100)             NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active        BOOLEAN                  NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS is_trending      BOOLEAN                  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS activity_level   community_activity_level NOT NULL DEFAULT 'low',
  ADD COLUMN IF NOT EXISTS tags             TEXT[]                   NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS gradient_colors  TEXT[]                   NOT NULL DEFAULT ARRAY[]::TEXT[];

-- 3) Ensure RLS is enabled
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- 4) Re-create or ensure RLS policies
DO $$ BEGIN
  CREATE POLICY communities_select ON communities
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$ BEGIN
  CREATE POLICY communities_insert ON communities
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM artists WHERE id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$ BEGIN
  CREATE POLICY communities_update ON communities
    FOR UPDATE USING (artist_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END$$;

DO $$ BEGIN
  CREATE POLICY communities_delete ON communities
    FOR DELETE USING (artist_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END$$;
