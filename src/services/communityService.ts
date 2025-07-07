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
  // 1. Verificar artist_id
  if (!input.artist_id) {
    throw new Error('Artist ID is required to create a community');
  }

  // 2. Verificar plano do artista para comunidades premium/vip
  if (['premium', 'vip'].includes(input.access_type)) {
    // Carrega plano do artista
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('monetization_plan_id')
      .eq('id', input.artist_id)
      .single();
    if (artistError) throw artistError;

    const planId = artistData?.monetization_plan_id;
    const isVipArtist = planId === '33333333-3333-3333-3333-333333333333';
    const isPremiumArtist = planId === '22222222-2222-2222-2222-222222222222';

    if (input.access_type === 'premium' && !(isPremiumArtist || isVipArtist)) {
      throw new Error('Somente artistas Premium ou VIP podem criar comunidades Premium');
    }
    if (input.access_type === 'vip' && !isVipArtist) {
      throw new Error('Somente artistas VIP podem criar comunidades VIP');
    }
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
      artist_id: input.artist_id,
      role: 'admin',
      joined_at: new Date().toISOString()
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
export async function getCommunityMembership(communityId: string, memberId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('community_members')
    .select()
    .eq('community_id', communityId)
    .or(`user_id.eq.${memberId},artist_id.eq.${memberId}`)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}

// Helper to determine if id exists in users table
async function isUser(id: string): Promise<boolean> {
  const { data } = await supabase.from('users').select('id').eq('id', id).maybeSingle();
  return !!data;
}

// Join a community as a member
export async function joinCommunity(communityId: string, memberId: string): Promise<void> {
  // 1. Buscar comunidade e tipo de acesso
  const { data: community, error: commErr } = await supabase
    .from('communities')
    .select('access_type')
    .eq('id', communityId)
    .single();
  if (commErr) throw commErr;

  // 2. Se premium/vip, verificar assinatura ativa do usuário
  if (community.access_type === 'premium' || community.access_type === 'vip') {
    if (await isUser(memberId)) {
      const { data: user } = await supabase
        .from('users')
        .select('has_active_subscription')
        .eq('id', memberId)
        .single();
      if (!user?.has_active_subscription) {
        throw new Error('É necessária uma assinatura ativa para entrar nesta comunidade');
      }
    }
  }

  const { error } = await supabase
    .from('community_members')
    .insert({ 
      community_id: communityId,
      ...(await isUser(memberId) ? { user_id: memberId } : { artist_id: memberId }),
      joined_at: new Date().toISOString(),
      role: 'member'
    });
  if (error) throw error;
}

// Leave a community (remove membership)
export async function leaveCommunity(communityId: string, memberId: string): Promise<void> {
  const { error } = await supabase
    .from('community_members')
    .delete()
    .match({ 
      community_id: communityId,
      ...(await isUser(memberId) ? { user_id: memberId } : { artist_id: memberId })
    });
  if (error) throw error;
}
