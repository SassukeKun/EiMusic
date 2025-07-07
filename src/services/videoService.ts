import { getSupabaseBrowserClient } from '@/utils/supabaseClient';
import { Video } from '@/models/video';

const supabase = getSupabaseBrowserClient();

export async function getArtistVideos(artistId: string): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Video[];
}

export async function updateVideo(videoId: string, updates: Partial<Video>): Promise<Video> {
  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', videoId)
    .select('*')
    .single();
  
  if (error) throw error;
  return data as Video;
}

export async function deleteVideo(videoId: string): Promise<void> {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', videoId);
  
  if (error) throw error;
}
