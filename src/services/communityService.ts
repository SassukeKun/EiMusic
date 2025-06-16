import { getSupabaseBrowserClient } from '@/utils/supabaseClient';

export interface RawCommunity {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  access_type: 'public' | 'private';
  category: string;
  is_active: boolean;
  is_trending: boolean;
  activity_level: 'low' | 'medium' | 'high';
  tags: string[];
  gradient_colors: string[];
  artist: {
    id: string;
    name: string;
    profile_image_url: string | null;
    is_artist: boolean;
  }[];
}

const supabase = getSupabaseBrowserClient();

export async function fetchCommunities(): Promise<RawCommunity[]> {
  const { data, error } = await supabase
    .from('communities')
    .select(
      `id,
       name,
       description,
       created_at,
       access_type,
       category,
       is_active,
       is_trending,
       activity_level,
       tags,
       gradient_colors,
       artist:artists(id, name, profile_image_url, is_artist)`
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as RawCommunity[]; 
}

interface CreateInput {
  name: string;
  description?: string;
  access_type: 'public' | 'private';
  category: string;
  tags?: string[];
  gradient_colors?: string[];
}

export async function createCommunity(
  input: CreateInput
): Promise<RawCommunity> {
  const { data, error } = await supabase
    .from('communities')
    .insert({
      name: input.name,
      description: input.description || null,
      access_type: input.access_type,
      category: input.category,
      tags: input.tags || [],
      gradient_colors: input.gradient_colors || []
    })
    .select(
      `id,
       name,
       description,
       created_at,
       access_type,
       category,
       is_active,
       is_trending,
       activity_level,
       tags,
       gradient_colors,
       artist:artists(id, name, profile_image_url, is_artist)`
    )
    .single();
  if (error) throw error;
  return data as unknown as RawCommunity; 
}
