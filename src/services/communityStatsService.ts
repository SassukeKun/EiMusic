import { getSupabaseBrowserClient } from '@/utils/supabaseClient';

const supabase = getSupabaseBrowserClient();

export async function fetchCommunityStats() {
  try {
    // Get total members (count distinct user_ids from community_members)
    const { count: membersCount, error: membersError } = await supabase
      .from('community_members')
      .select('user_id', { count: 'exact', head: true })
      
    
    if (membersError) throw membersError;

    // Get posts from today
    const today = new Date().toISOString().split('T')[0];
    const { count: postsCount, error: postsError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today);
    
    if (postsError) throw postsError;

    return {
      totalMembers: membersCount || 0,
      postsToday: postsCount || 0
    };
  } catch (error) {
    console.log('Error fetching community stats:', error);
    throw error;
  }
}
