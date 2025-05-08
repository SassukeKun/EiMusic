import { z } from 'zod';

/**
 * Interface de track representando uma musica no banco de dados
 */
export interface Track {
  id: string;
  title: string;
  artist_id: string;
  duration: number; // em segundos
  file_url: string;
  cover_url?: string;
  created_at: string;
  release_date?: string;
  genre_ids?: string[];
  plays_count?: number;
  likes_count?: number;
  is_explicit?: boolean;
  featuring?: string[]; // IDs de artistas em destaque
}

/**
 * Schema Zod para validar os dados da musica
 */
export const trackSchema = z.object({
  id: z.string().uuid().optional(), // Opcional para criacao
  title: z.string().min(1, 'Título é obrigatório'),
  artist_id: z.string().uuid('ID do artista inválido'),
  duration: z.number().min(1, 'Duração deve ser maior que zero'),
  file_url: z.string().url('URL do arquivo inválida').optional(), // Opcional para o fluxo de criacao
  cover_url: z.string().url('URL da capa inválida').optional(),
  release_date: z.string().optional(),
  genre_ids: z.array(z.string()).optional(),
  is_explicit: z.boolean().default(false),
  featuring: z.array(z.string()).optional(),
});

/**
 * Tipo para criar uma nova musica (omite campos gerados pelo servidor)
 */
export type CreateTrackInput = z.infer<typeof trackSchema>;

export default Track; 