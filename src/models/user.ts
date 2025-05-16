import { z } from 'zod';

/**
 * Interface de usuario representando um usuario no banco de dados
 */
export interface User {
  id: string; // ID_Usuario (PK)
  email: string; // Email (unico)
  password: string; // Senha (hash)
  name: string; // Nome_Usuario
  created_at: string; // Data_Registro
  payment_method?: string; // Metodo_Pagamento_Preferido
  has_active_subscription?: boolean; // Assinatura_Ativa
}

/**
 * Schema Zod para validar os dados do usuario
 */
export const userSchema = z.object({
  id: z.string().uuid().optional(), // Opcional para criacao
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  payment_method: z.string().optional(),
  has_active_subscription: z.boolean().optional(),
});

/**
 * Tipo para criar um novo usuario (omite campos gerados pelo servidor)
 */
export type CreateUserInput = Omit<z.infer<typeof userSchema>, 'id' | 'created_at'>;

/**
 * Tipo para login (apenas email e senha)
 */
export type UserLoginInput = Pick<User, 'email' | 'password'>;

export default User; 