import { getSupabaseBrowserClient } from '@/utils/supabaseClient';
import { Post } from '@/models/post';

export interface CreatePostInput {
  community_id: string;
  user_id: string;
  content: string;
  plan: 'free' | 'premium' | 'vip';
  type: 'text' | 'audio' | 'video';
  attachments?: {
    type: 'audio' | 'video' | 'image';
    url: string;
    duration?: string;
  }[];
  pinned?: boolean;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase
    .from('posts')
    .insert({
      community_id: input.community_id,
      user_id: input.user_id,
      content: input.content,
      plan: input.plan,
      type: input.type,
      attachments: input.attachments,
      pinned: input.pinned,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as Post;
}

export async function fetchPostsByCommunity(communityId: string): Promise<Post[]> {
  const supabase = getSupabaseBrowserClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('community_id', communityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Post[];
}

export async function likePost(postId: string, userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  
  const { error } = await supabase
    .from('post_likes')
    .insert({
      post_id: postId,
      user_id: userId
    });

  if (error) throw error;
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId);

  if (error) throw error;
}
