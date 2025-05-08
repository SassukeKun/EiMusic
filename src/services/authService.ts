import { createClient } from '@supabase/supabase-js';

// Inicializacao do cliente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Servico para operacoes de autenticacao
 */
export const authService = {
  /**
   * Login com email e senha
   * @param email - Email do usuario
   * @param password - Senha do usuario
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signIn(email: string, password: string) {
    // Autenticar usuario com o Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  /**
   * Cadastro com email e senha
   * @param email - Email do usuario
   * @param password - Senha do usuario
   * @param userData - Dados adicionais do usuario
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signUp(email: string, password: string, userData?: Record<string, unknown>) {
    // Cadastrar novo usuario com o Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  /**
   * Deslogar o usuario atual
   * @returns void
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  },
  
  /**
   * Obter o usuario logado atualmente
   * @returns A sessao do usuario atual
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }
    
    return data.user;
  }
};

export default authService; 