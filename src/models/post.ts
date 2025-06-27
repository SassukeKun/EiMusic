import { z } from "zod";

export interface Post {
  id: string;
  community_id: string;
  author_id: string;
  content: string;
  type: 'text' | 'audio' | 'video' | 'live' | 'exclusive';
  plan: 'free' | 'premium' | 'vip';
  created_at: string;
  updated_at: string;
  likes: number;
  comments: number;
  attachments: {
    type: 'audio' | 'video' | 'image';
    url: string;
    duration?: string;
  }[];
  author?: {
    id: string;
    name: string;
    avatar: string;
    type: 'artist' | 'member';
    verified: boolean;
  };
  pinned?: boolean;
}

export const postSchema = z.object({
  id: z.string().uuid(),
  community_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.string(),
  type: z.enum(['texto', 'audio', 'video', 'live', 'exclusivo']),
  plan: z.enum(['free', 'premium', 'vip']),
  created_at: z.string(),
  updated_at: z.string(),
  likes: z.number(),
  comments: z.number(),
  attachments: z.array(
    z.object({
      type: z.enum(['audio', 'video', 'imagem']),
      url: z.string(),
      duration: z.string().optional(),
    })
  ),
  author: z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatar: z.string(),
    type: z.enum(['artista', 'membro']),
    verified: z.boolean(),
  }).optional(),
});

export type CreatePostInput = Omit<z.infer<typeof postSchema>, 'id'>;

export default Post;
