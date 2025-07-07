import { z } from 'zod';

export interface Video {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string | null;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  artist_id: string;
  genre?: string | null;
  format?: string | null;
  description?: string | null;
  is_video_clip?: boolean;
  created_at: string;
}

export const videoSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  video_url: z.string().url('URL do vídeo inválida'),
  thumbnail_url: z.string().url('URL da thumbnail inválida').optional(),
  duration: z.number().min(1, 'Duração deve ser maior que zero'),
  views: z.number().min(0, 'Views deve ser não negativo'),
  likes: z.number().min(0, 'Likes deve ser não negativo'),
  dislikes: z.number().min(0, 'Dislikes deve ser não negativo'),
  artist_id: z.string().uuid('ID do artista inválido'),
  genre: z.string().optional(),
  format: z.string().optional(),
  description: z.string().optional(),
  is_video_clip: z.boolean().optional(),
});

export default Video;
