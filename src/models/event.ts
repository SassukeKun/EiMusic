import { z } from 'zod';

/**
 * Interface Event representa um evento pago criado por um artista.
 */
export interface Event {
  id: string;
  artist_id: string;
  name: string;
  event_type: string;
  price: number;
  description: string | null;
  start_time: string; // ISO timestamp
  capacity: number | null;
  created_at: string;
}

/**
 * Schema Zod para inserir ou atualizar eventos.
 */
export const eventSchema = z.object({
  id: z.string().uuid().optional(),
  artist_id: z.string().uuid(),
  name: z.string().min(2),
  event_type: z.string().min(2),
  price: z.number().min(0),
  description: z.string().max(500).optional(),
  start_time: z.string().datetime(),
  capacity: z.number().int().min(0).nullable().optional(),
});

export type CreateEventInput = Omit<z.infer<typeof eventSchema>, 'id'>;

export default Event;
