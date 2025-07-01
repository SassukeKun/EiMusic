-- Migration: create videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES artists(id),
  title VARCHAR(255) NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  format VARCHAR(50),
  is_video_clip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
