import { getSupabaseBrowserClient } from '@/utils/supabaseClient';
import { z } from 'zod';
import { Track } from '@/models/track';

const supabase = getSupabaseBrowserClient();

export async function getArtistTracks(artistId: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Track[];
}

export async function updateTrack(trackId: string, updates: Partial<Track>): Promise<Track> {
  const { data, error } = await supabase
    .from('tracks')
    .update(updates)
    .eq('id', trackId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data as Track;
}

export async function deleteTrack(trackId: string): Promise<void> {
  const { error } = await supabase
    .from('tracks')
    .delete()
    .eq('id', trackId);
  
  if (error) throw error;
}

export async function getArtistSingles(artistId: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Track[];
}