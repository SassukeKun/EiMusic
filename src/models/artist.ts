import { z } from 'zod';

/**
 * Interface de artista representando um artista no banco de dados
 */
export interface Artist {
  id: string; // ID_Artista (PK)
  name: string; // Nome_Artista
  email: string; // Email
  password: string; // Senha
  created_at: string; // Data_Registro
  monetization_plan_id?: string; // Plano_Monetizacao_ID (FK)
  bio?: string; // Biografia
  phone?: string; // Telefone
  profile_image_url?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
}

/**
 * Schema Zod para validar os dados do artista
 */
export const artistSchema = z.object({
  id: z.string().uuid().optional(), // Opcional para criacao
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').optional(),
  monetization_plan_id: z.string().uuid().optional(),
  bio: z.string().max(500, 'Biografia limitada a 500 caracteres').optional(),
  phone: z.string().optional(),
  profile_image_url: z.string().url().optional(),
  social_links: z.object({
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

/**
 * Tipo para criar um novo artista (omite campos gerados pelo servidor)
 */
export type CreateArtistInput = Omit<z.infer<typeof artistSchema>, 'id' | 'created_at'>;

/**
 * Tipo para login (apenas email e senha)
 */
export type ArtistLoginInput = Pick<Artist, 'email' | 'password'>;

export default Artist; 