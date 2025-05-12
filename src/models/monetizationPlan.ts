import { z } from 'zod';

/**
 * Interface de plano de monetizcao representando um plano no banco de dados
 * 
 */
export interface MonetizationPlan {
  id: string; // ID_Plano (PK)
  name: string; // Nome_Plano
  monetization_type: string; // Tipo_Monetizacao
  platform_fee: number; // Taxa_Plataforma
  description?: string; // Descricao
}

/**
 * Schema Zod para validar os dados do plano de monetização
 */
export const monetizationPlanSchema = z.object({
  id: z.string().uuid().optional(), // Opcional para criacao
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  monetization_type: z.enum(['subscription', 'per_stream', 'download', 'donation']),
  platform_fee: z.number().min(0).max(100, 'Taxa não pode ser maior que 100%'),
  description: z.string().max(500, 'Descrição limitada a 500 caracteres').optional(),
});

/**
 * Tipo para criar um novo plano (omite campos gerados pelo servidor)
 */
export type CreateMonetizationPlanInput = Omit<z.infer<typeof monetizationPlanSchema>, 'id'>;

export default MonetizationPlan; 