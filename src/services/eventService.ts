import { z } from 'zod';
import { getSupabaseBrowserClient } from '@/utils/supabaseClient';
import { CreateEventInput, eventSchema } from '@/models/event';

/* =========================================================
 * EventService – gerenciamento de eventos pagos
 * =========================================================
 *  • createEvent()     – artista cria evento
 *  • updateEvent()     – artista atualiza evento
 *  • fetchEvents()     – lista eventos (filtrável)
 *  • fetchEventById()  – detalhes
 *  • purchaseTicket()  – usuário compra ingresso (futuro: integração M-Pesa)
 * =======================================================*/

const supabase = getSupabaseBrowserClient();

export async function createEvent(input: CreateEventInput) {
  const parsed = eventSchema.parse(input);

  // Segurança: confirmar que o artista logado === parsed.artist_id já foi validado no controller
  const { data, error } = await supabase
    .from('events')
    .insert(parsed)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateEvent(id: string, input: Partial<CreateEventInput>) {
  const { error } = await supabase
    .from('events')
    .update(input)
    .eq('id', id);
  if (error) throw error;
}

export async function fetchEvents(limit = 20) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function fetchEventById(id: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function purchaseTicket(eventId: string, userId: string) {
  // Futuro: chamar função edge/ cloud function para processar pagamento móvel
  // Placeholder: apenas registra inscrição em tabela event_attendees
  const { data: event } = await fetchEventById(eventId);
  if (!event) throw new Error('Evento não encontrado');

  // TODO: coletar pagamento via M-Pesa / e-Mola

  const { error } = await supabase.from('event_attendees').insert({
    event_id: eventId,
    user_id: userId,
  });
  if (error) throw error;

  return { message: 'Ingresso adquirido com sucesso (pagamento simulado).' };
}
