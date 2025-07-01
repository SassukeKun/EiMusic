import { z } from 'zod';
import { getSupabaseBrowserClient } from '@/utils/supabaseClient';

/* =========================================================
 * DonationService – lógica de gorjetas
 * =========================================================
 *  • tipArtist() — faz doação aplicando regras:
 *      – valor entre 5 e 500 MT
 *      – usuários Free: máximo 50 MT por artista/mês
 *      – aplica taxa plataforma 15 % (calculada no retorno)
 * =======================================================*/

const supabase = getSupabaseBrowserClient();

const tipSchema = z.object({
  userId: z.string().uuid(),
  artistId: z.string().uuid(),
  amount: z.number().min(5).max(500),
});

export type TipInput = z.infer<typeof tipSchema>;

export async function tipArtist(input: TipInput) {
  const parsed = tipSchema.parse(input);

  // 1. Verificar limite do usuário Free (50 MT por artista no mês)
  // Obtém o plano do usuário (assume users.plan ou join subscriptions)
  const { data: user } = await supabase
    .from('users')
    .select('plan')
    .eq('id', parsed.userId)
    .single();

  if (user?.plan === 'free') {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const { data: agg } = await supabase.rpc('total_donations_for_artist_month', {
      p_user_id: parsed.userId,
      p_artist_id: parsed.artistId,
      p_start: firstDayOfMonth.toISOString(),
    });

    const totalThisMonth = agg?.total ?? 0;
    if (totalThisMonth + parsed.amount > 50) {
      throw new Error('Limite mensal de 50 MT para usuários Free excedido.');
    }
  }

  // 2. Inserir doação
  const { data, error } = await supabase.from('donations').insert({
    user_id: parsed.userId,
    artist_id: parsed.artistId,
    amount: parsed.amount,
  }).select('*').single();

  if (error) throw error;

  // 3. Calcular montante artista (85 %) / plataforma (15 %)
  return {
    donation: data,
    artistShare: parsed.amount * 0.85,
    platformShare: parsed.amount * 0.15,
  };
}
