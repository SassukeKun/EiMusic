import { getSupabaseBrowserClient } from '@/utils/supabaseClient';
import { Community, CreateCommunityInput } from '@/models/community';

const supabase = getSupabaseBrowserClient();

export async function fetchCommunities(): Promise<Community[]> {
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
       activity_level,
       tags,
       banner,
       artist:artists!communities_artist_id_fkey(artist_id:id, name, profile_image_url, verified)`
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as Community[]; 
}



export async function createCommunity(input: CreateCommunityInput): Promise<Community> {
  // Validate that artist_id is provided
  if (!input.artist_id) {
    throw new Error('Artist ID is required to create a community');
  }

  // Create the community
  const { data: community, error: createError } = await supabase
    .from('communities')
    .insert({
      artist_id: input.artist_id,
      name: input.name,
      description: input.description || null,
      access_type: input.access_type,
      category: input.category,
      tags: input.tags || [],
      banner: input.banner || null,
    })
    .select(
      `id,
       name,
       description,
       created_at,
       access_type,
       category,
       is_active,
       activity_level,
       tags,
       banner,
       artist:artists!communities_artist_id_fkey(artist_id:id, name, profile_image_url, verified)`
    )
    .single();
  if (createError) throw createError;

  // Add the creator as an admin member
  const { error: membershipError } = await supabase
    .from('community_members')
    .insert({
      community_id: community.id,
      user_id: input.artist_id,
      role: 'admin'
    });
  if (membershipError) throw membershipError;

  return community as unknown as Community;
}

export async function getCommunityById(id: string): Promise<Community> {
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
       activity_level,
       tags,
       banner,
       artist:artists!communities_artist_id_fkey(artist_id:id, name, profile_image_url, verified)`
    )
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as unknown as Community;
}

// Get membership status for a user in a community
export async function getCommunityMembership(communityId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('community_members')
    .select()
    .eq('community_id', communityId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

// Join a community as a member
export async function joinCommunity(communityId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .insert({ community_id: communityId, user_id: userId });
  if (error) throw error;
}

// Leave a community (remove membership)
export async function leaveCommunity(communityId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .match({ community_id: communityId, user_id: userId });
  if (error) throw error;
}
