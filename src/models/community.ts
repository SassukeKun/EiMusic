import { z } from 'zod';
import { Post } from './post';

/**
 * Interface de community representando uma comunidade no banco de dados
 */
export interface Community {
  id: string;
  name: string;
  description: string | null;
  category: string;
  access_type: string;
  tags: string[];
  is_active: boolean;
  activity_level: string;
  artist_id: string | null;
  created_at: string;
  /** banner image URL */
  banner: string | undefined;
  /** optional gradient colors for UI styling */


  /** total number of members in the community */
  members_count: number;
  /** total number of posts in the community */
  posts_count: number;
  /** recent posts in the community */
  recent_posts: any[];
  /** related artist */
  artist?: {
    artist_id: string;
    name: string;
    profile_image_url: string | null;
    verified: boolean;
  };
}

/**
 * Zod schema para validar dados de criação de comunidade
 */
export const communitySchema = z.object({
  banner: z.string().url().optional(),

  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  access_type: z.enum(['public', 'private']),
  tags: z.array(z.string()).optional(),
  artist_id: z.string().uuid().optional(),
});

/**
 * Tipo para criar uma nova comunidade (omite campos gerados pelo servidor)
 */
export type CreateCommunityInput = Omit<z.infer<typeof communitySchema>, 'id'>;

export default Community;
