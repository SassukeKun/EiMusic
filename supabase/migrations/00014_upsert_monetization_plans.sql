-- 00014_upsert_monetization_plans.sql
-- Seed/atualização idempotente dos planos Free, Premium e VIP.
-- Usa UPSERT para manter referências de FK (artists, subscriptions) intactas.

INSERT INTO monetization_plans (id, name, monetization_type, platform_fee, description)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Free',    'subscription', 0.70,
   'Plano gratuito — acesso limitado, anúncios, 70% receita plataforma'),
  ('22222222-2222-2222-2222-222222222222', 'Premium', 'subscription', 0.60,
   'Plano Premium — catálogo completo, 120 MT/mês, 60% receita plataforma'),
  ('33333333-3333-3333-3333-333333333333', 'VIP',     'subscription', 0.50,
   'Plano VIP — extras + lossless, 250 MT/mês, 50% receita plataforma')
ON CONFLICT (id)
DO UPDATE SET
  name              = EXCLUDED.name,
  monetization_type = EXCLUDED.monetization_type,
  platform_fee      = EXCLUDED.platform_fee,
  description       = EXCLUDED.description;

-- Opcional: remova planos obsoletos que não estejam entre os três IDs acima.
DELETE FROM monetization_plans
WHERE id NOT IN ('11111111-1111-1111-1111-111111111111',
                 '22222222-2222-2222-2222-222222222222',
                 '33333333-3333-3333-3333-333333333333');
