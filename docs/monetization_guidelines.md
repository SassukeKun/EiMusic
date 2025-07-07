# EiMusic – Monetização

## Visão Geral
Este documento resume as políticas de segurança (RLS) e o fluxo MVC criado para os módulos de monetização: Assinaturas, Doações, Comunidades, Eventos e Receita.

---
## Row-Level Security (RLS)
| Tabela | Ação | Política | Papel / Condição |
|--------|-------|----------|------------------|
| `monetization_plans` | SELECT | Aberta | Qualquer usuário |
|  | INSERT/UPDATE/DELETE | Restrita | Somente `role = service_role` (admin) |
| `subscriptions` | SELECT | usuários veem suas assinaturas | `user_id = auth.uid()` |
|  | INSERT | Criar assinatura própria | `user_id = auth.uid()` |
|  | UPDATE | Cancelar assinatura própria | `user_id = auth.uid()` |
| `users` | UPDATE plano/flag | Trigger mantém `has_active_subscription` | executado por função |
| `donations` | INSERT/SELECT | Apenas dono | `user_id = auth.uid()` |
| `communities` | SELECT | Pública: todos; Premium/VIP: requer plano | teste via view `current_user_plan()` |
|  | INSERT/UPDATE/DELETE | Criador ou artista dono | `creator_id = auth.uid()` |
| `community_members` | SELECT/INSERT/DELETE | Membro ou criador | `user_id = auth.uid()` OR ref via community |
| `events` | SELECT | Todos visualizam | (pago controlado no app) |
|  | INSERT/UPDATE/DELETE | Artista criador | `artist_id = auth.uid()` |
| `event_attendees` | SELECT/INSERT | Usuário participante | `user_id = auth.uid()` |
| `revenue_transactions` | SELECT | Artista vê suas receitas | `artist_id = auth.uid()` |
| `artist_balances` | SELECT | Artista vê saldo | `artist_id = auth.uid()` |
|  | UPDATE | Somente trigger/processo semanal | função `process_weekly_revenue()` |

*Todas as tabelas possuem `RLS ENABLED`.*

---
## Fluxo MVC / Pastas
```
src/
  models/     ← Representação tipada e validação Zod (e.g., event.ts)
  services/   ← Lógica de negócios com Supabase (e.g., revenueService.ts)
  app/api/    ← Controllers/Handlers HTTP (Next.js Route Handlers)
  components/ ← Componentes React para UI monetização (client components)
  supabase/migrations/ ← Scripts SQL com DDL + RLS
  docs/       ← Documentação (este arquivo)
```

### Ciclo de exemplo (Doação):
1. UI chama `fetch('/api/donations', {artistId, amount})`.
2. Handler valida corpo, autenticação, e chama `donationService.tipArtist()`.
3. Service aplica regras (sem plano ≤50 MT/mês) e insere em `donations`.
4. Trigger ou service grava `revenue_transactions` com split 85/15.
5. RLS garante que apenas doador veja sua doação; artista enxerga receita agregada.

---
## Como rodar payouts semanais
Agendar (por ex. no Supabase Scheduler) a chamada:
```sql
select process_weekly_revenue();
```
Será pago apenas se `artist_balances.balance ≥ 100`.

---
## TODO / Próximos passos
- Cobertura de testes (Jest/Testing Library) para serviços e handlers.
- UI polishing: tela de Pricing (caso não encontrada no repo), exibir estados de loading/erro globais.
- Integração com gateway de pagamento real (e-Mola / M-Pesa).
