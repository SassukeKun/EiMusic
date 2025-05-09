import { z } from 'zod';

/**
 * Interface de artista representando um artista no banco de dados
 */
export interface Artist {
  id: string;
  name: string;
  bio: string;
  created_at: string;
  profile_image_url?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  genre_ids?: string[];
  followers_count?: number;
}

/**
 * Schema Zod para validar os dados do artista
 */
export const artistSchema = z.object({
  id: z.string().uuid().optional(), // Opcional para criacao
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  bio: z.string().max(500, 'Biografia limitada a 500 caracteres'),
  profile_image_url: z.string().url().optional(),
  social_links: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().url().optional(),
  }).optional(),
  genre_ids: z.array(z.string()).optional(),
});

/**
 * Tipo para criar um novo artista (omite campos gerados pelo servidor)
 */
export type CreateArtistInput = z.infer<typeof artistSchema>;

export default Artist; 