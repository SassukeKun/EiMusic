import { z } from 'zod';
import { getSupabaseBrowserClient } from '@/utils/supabaseClient';

/* =========================================================
 * SubscriptionService ‒ regras de negócio de assinaturas
 * =========================================================
 * Funções:
 *   • startSubscription(planId)   ‒ cria nova assinatura
 *   • cancelSubscription()        ‒ encerra assinatura ativa
 *   • hasActiveSubscription()     ‒ verifica flag/cache
 *
 * NOTA: prefere‐se executar estas funções em server actions / API
 * routes para proteger a chave de serviço. Aqui usamos o browser
 * client apenas como esqueleto.
 * =======================================================*/

const supabase = getSupabaseBrowserClient();

/** Schema de input para criar assinatura */
const startSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  monetizationPlanId: z.string().uuid(),
});

export type StartSubscriptionInput = z.infer<typeof startSubscriptionSchema>;

export async function startSubscription(input: StartSubscriptionInput) {
  const parsed = startSubscriptionSchema.parse(input);

  const { data, error } = await supabase.from('subscriptions').insert({
    user_id: parsed.userId,
    monetization_plan_id: parsed.monetizationPlanId,
    is_active: true,
    start_date: new Date().toISOString(),
  }).select('*').single();

  if (error) throw error;
  return data;
}

/** Cancela assinatura ativa do usuário (soft-cancel) */
export async function cancelSubscription(userId: string) {
  const { error } = await supabase.from('subscriptions').update({
    is_active: false,
    end_date: new Date().toISOString(),
  }).eq('user_id', userId).eq('is_active', true);

  if (error) throw error;
}

/** Consulta rápido da flag users.has_active_subscription */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('users')
    .select('has_active_subscription')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data?.has_active_subscription ?? false;
}
