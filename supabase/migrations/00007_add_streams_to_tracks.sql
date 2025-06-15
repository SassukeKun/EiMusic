-- Migration: Add streams column to tracks table

ALTER TABLE public.tracks
ADD COLUMN IF NOT EXISTS streams INTEGER NOT NULL DEFAULT 0;

-- Ensure RLS is enabled
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow incrementing streams on tracks (any authenticated user)
CREATE POLICY "Allow increment streams on tracks"
  ON public.tracks FOR UPDATE
  USING (auth.role() != 'anon')
  WITH CHECK (auth.role() != 'anon');
