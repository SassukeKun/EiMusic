import { getSafeSupabaseClient } from '../utils/supabaseClient';

// Obter o cliente Supabase
const supabase = getSafeSupabaseClient();

/**
 * Serviço para gerenciar operações relacionadas a usuários
 */
const userService = {
  /**
   * Deleta um usuário completamente (tanto da tabela users quanto da auth.users)
   * @param userId - ID do usuário a ser excluído
   * @returns Status da operação
   */
  async deleteUser(userId: string) {
    try {
      // 1. Primeiro removemos o registro da tabela users (ou artists)
      // Verificar se é um artista
      const { data: artistData } = await supabase
        .from('artists')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (artistData) {
        // Excluir da tabela de artistas
        const { error: artistDeleteError } = await supabase
          .from('artists')
          .delete()
          .eq('id', userId);
          
        if (artistDeleteError) {
          console.error('Erro ao excluir artista:', artistDeleteError);
          return { 
            success: false, 
            error: 'Falha ao excluir dados de artista: ' + artistDeleteError.message 
          };
        }
      } else {
        // Excluir da tabela de usuários regulares
        const { error: userDeleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
          
        if (userDeleteError) {
          console.error('Erro ao excluir usuário:', userDeleteError);
          return { 
            success: false, 
            error: 'Falha ao excluir dados de usuário: ' + userDeleteError.message 
          };
        }
      }
      
      // 2. Agora excluímos o usuário da tabela auth.users
      // NOTA: Isso requer a chave de serviço e só pode ser feito no servidor
      // Você deve criar um endpoint de API para isso
      
      return { 
        success: true, 
        message: 'Usuário excluído da tabela de perfil. Use o Admin API para completar a exclusão.'
      };
    } catch (error: any) {
      console.error('Exceção ao excluir usuário:', error);
      return { 
        success: false, 
        error: error.message || 'Erro desconhecido ao excluir usuário'
      };
    }
  }
};

export default userService; 