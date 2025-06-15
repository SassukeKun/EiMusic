-- Migration: Create singles table with streams column

CREATE TABLE IF NOT EXISTS public.singles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  duration NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  streams INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.singles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow artists to insert their own singles
CREATE POLICY "Enable insert for artists on singles"
  ON public.singles FOR INSERT
  WITH CHECK (auth.uid() = artist_id);

-- Policy: Allow everyone to select singles
CREATE POLICY "Enable select on singles for all"
  ON public.singles FOR SELECT
  USING (true);

-- Policy: Allow artists to update their own singles
CREATE POLICY "Enable update on singles for artists"
  ON public.singles FOR UPDATE
  USING (auth.uid() = artist_id);

-- Policy: Allow artists to delete their own singles
CREATE POLICY "Enable delete on singles for artists"
  ON public.singles FOR DELETE
  USING (auth.uid() = artist_id);
