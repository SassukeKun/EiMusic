-- Migration 00008: Create communities table with RLS and enum types

-- Create enum for access type
DO $$ BEGIN
  CREATE TYPE community_access_type AS ENUM ('public','private');
EXCEPTION
  WHEN duplicate_object THEN null;
END$$;

-- Create enum for activity level
DO $$ BEGIN
  CREATE TYPE community_activity_level AS ENUM ('low','medium','high');
EXCEPTION
  WHEN duplicate_object THEN null;
END$$;

-- Create communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  artist_id UUID NOT NULL REFERENCES artists(id),
  access_type community_access_type NOT NULL DEFAULT 'public',
  category VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  activity_level community_activity_level NOT NULL DEFAULT 'low',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  gradient_colors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[]
);

-- Enable Row Level Security
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

-- Policy: Any authenticated user can read communities
CREATE POLICY "communities_select" ON communities
  FOR SELECT USING (true);

-- Policy: Only artists can create communities
CREATE POLICY "communities_insert" ON communities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM artists WHERE id = auth.uid())
  );

-- Policy: Only the community's artist can update it
CREATE POLICY "communities_update" ON communities
  FOR UPDATE USING (artist_id = auth.uid());

-- Policy: Only the community's artist can delete it
CREATE POLICY "communities_delete" ON communities
  FOR DELETE USING (artist_id = auth.uid());
