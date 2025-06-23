import { z } from "zod";

export interface Post {
  id: string;
  autor: {
    artist_id: string
    name: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  type: "texto" | "audio" | "video" | "live" | "exclusivo";
  plan: "free" | "premium" | "vip";
  created_at: string;
  likes: number;
  comments: number;
  attachments?: {
    type: "audio" | "video" | "imagem";
    url: string;
    duration?: string;
  }[];
  pinned?: boolean;
}

export const postSchema = z.object({
  id: z.string().uuid().optional(),
  autor: z.object({
    artist_id: z.string().uuid(),
    name: z.string(),
    avatar: z.string().optional(),
    verified: z.boolean().optional(),
  }),
  content: z.string(),
  type: z.enum(['texto', 'audio', 'video', 'live', 'exclusivo']),
  plan: z.enum(['free', 'premium', 'vip']),
  created_at: z.string(),
  likes: z.number().optional(),
  comments: z.number().optional(),
  attachments: z.array(
    z.object({
      type: z.enum(['audio', 'video', 'imagem']),
      url: z.string(),
      duration: z.string().optional(),
    })
  ).optional(),
  pinned: z.boolean().optional(),
});

export type CreatePostInput = Omit<z.infer<typeof postSchema>, 'id'>;

export default Post;
