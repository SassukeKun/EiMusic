import { getSupabaseBrowserClient } from '@/utils/supabaseClient';

/* =========================================================
 * RevenueService – registra e consulta receitas de artistas
 * =========================================================
 *  • addTransaction() – grava split para artista
 *  • getArtistBalance() – saldo acumulado
 *  • triggerWeeklyProcess() – chama RPC process_weekly_revenue()
 * =======================================================*/

export type RevenueSource = 'subscription' | 'donation' | 'event' | 'community';

const supabase = getSupabaseBrowserClient();

interface AddTxInput {
  artistId: string;
  amount: number;
  sourceType: RevenueSource;
}

export async function addTransaction({ artistId, amount, sourceType }: AddTxInput) {
  const { error } = await supabase.from('revenue_transactions').insert({
    artist_id: artistId,
    amount,
    source_type: sourceType,
  });
  if (error) throw error;
}

export async function getArtistBalance(artistId: string) {
  const { data, error } = await supabase
    .from('artist_balances')
    .select('balance')
    .eq('artist_id', artistId)
    .single();
  if (error) throw error;
  return data?.balance ?? 0;
}

export async function triggerWeeklyProcess() {
  // Requer role com permissões EXECUTE na função (service key ou Edge Function)
  const { error } = await supabase.rpc('process_weekly_revenue');
  if (error) throw error;
  return { message: 'process_weekly_revenue triggered' };
}
