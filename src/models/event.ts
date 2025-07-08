import { z } from 'zod';

/**
 * Interface Event representa um evento pago criado por um artista.
 */
export interface Event {
  id: string;
  artist_id: string;
  title: string;
  event_type: "show" | "lancamento" | "tour" | "visita" | "colaboracao"; // Tipos de eventos (enum)
  price_min: number;
  price_max: number;
  description: string | null;
  start_time: string; // ISO timestamp
  location?: string;
  capacity: number | null;
  created_at: string;
  event_date: string;
  access_level: 'publico' | 'premium' | 'vip';
  event_status: 'confirmado' | 'agendado' | 'cancelado';
  image_url?: string; // URL da imagem de capa do evento
}

/**
 * Schema Zod para inserir ou atualizar eventos.
 */
export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  artist_id: z.string().uuid(),
  title: z.string().min(2),
  event_type: z.enum(['show', 'lancamento', 'tour', 'visita', 'colaboracao']).optional(),
  price_min: z.number().min(0),
  price_max: z.number().min(0),
  description: z.string().max(500).optional(),
  start_time: z.string().datetime(),
  event_date: z.string().datetime(),
  access_level: z.enum(['publico', 'premium', 'vip']),
  location: z.string().optional(),
  capacity: z.number().int().min(0).nullable().optional(),
  event_status: z.enum(['confirmado', 'agendado', 'cancelado']).optional(),
  image_url: z.string().url().optional(),
});

export type CreateEventInput = Omit<z.infer<typeof eventSchema>, 'id'>;

export default Event;
