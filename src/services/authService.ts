import { User, CreateUserInput } from '../models/user';
import { Artist, CreateArtistInput } from '../models/artist';
import supabase from '../utils/supabaseClient';

// Remove a criação local do cliente Supabase para usar a instância centralizada
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Servico para operacoes de autenticacao
 */
const authService = {
  /**
   * Login com email e senha para usuarios regulares
   * @param email - Email do usuario
   * @param password - Senha do usuario
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signInUser(email: string, password: string) {
    // Autenticar usuario com o Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // Buscar dados extras do usuario (tabela users)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (userError) {
      throw userError;
    }
    
    return {
      session: data.session,
      user: userData as User
    };
  },
  
  /**
   * Login com email e senha para artistas
   * @param email - Email do artista
   * @param password - Senha do artista
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signInArtist(email: string, password: string) {
    // Autenticar artista com o Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    // Buscar dados extras do artista (tabela artists)
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (artistError) {
      throw artistError;
    }
    
    return {
      session: data.session,
      user: artistData as Artist
    };
  },
  
  /**
   * Login com provedor OAuth (Google, etc)
   * @param provider - Nome do provedor OAuth
   * @returns URL de redirecionamento
   */
  async signInWithOAuth(provider: 'google' | 'facebook' | 'twitter') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  /**
   * Cadastro de usuario regular
   * @param userData - Dados do usuário para cadastro
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signUpUser(userData: CreateUserInput) {
    // Cadastrar novo usuario com o Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    
    if (error) {
      throw error;
    }
    
    // Inserir dados adicionais na tabela users
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          payment_method: userData.payment_method,
          has_active_subscription: userData.has_active_subscription || false,
        });
        
      if (profileError) {
        // Rollback: tentar deletar o usuário criado
        await supabase.auth.admin.deleteUser(data.user.id);
        throw profileError;
      }
    }
    
    return data;
  },
  
  /**
   * Cadastro de artista
   * @param artistData - Dados do artista para cadastro
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signUpArtist(artistData: CreateArtistInput) {
    // Cadastrar novo artista com o Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: artistData.email,
      password: artistData.password || '',
    });
    
    if (error) {
      throw error;
    }
    
    // Inserir dados adicionais na tabela artists
    if (data.user) {
      const { error: profileError } = await supabase
        .from('artists')
        .insert({
          id: data.user.id,
          name: artistData.name,
          email: artistData.email,
          bio: artistData.bio,
          phone: artistData.phone,
          monetization_plan_id: artistData.monetization_plan_id,
          profile_image_url: artistData.profile_image_url,
          social_links: artistData.social_links,
        });
        
      if (profileError) {
        // Rollback: tentar deletar o artista criado
        await supabase.auth.admin.deleteUser(data.user.id);
        throw profileError;
      }
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
    try {
      // Primeiro verifica se há uma sessão ativa
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erro ao obter sessão:", sessionError.message);
        return null;
      }
      
      if (!sessionData.session) {
        console.log("Nenhuma sessão ativa encontrada");
        return null;
      }
      
      // Agora que sabemos que há uma sessão, obtém os dados do usuário
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error("Erro ao obter usuário:", error.message);
        return null;
      }
      
      return data.user;
    } catch (error) {
      console.error("Exceção ao obter usuário:", error);
      return null;
    }
  },
  
  /**
   * Verificar se o usuário atual é um artista
   * @returns Boolean indicando se é artista
   */
  async isArtist() {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return false;
      
      // Use count instead of trying to get a single row to avoid the "multiple rows returned" error
      const { data, error, count } = await supabase
        .from('artists')
        .select('id', { count: 'exact' })
        .eq('id', user.user.id);
        
      if (error) {
        console.error("Erro ao verificar artista:", error.message);
        return false;
      }
      
      // Check if count is greater than 0 to determine if user is an artist
      return count !== null && count > 0;
    } catch (error) {
      console.error("Exceção ao verificar artista:", error);
      return false;
    }
  }
};

export default authService; 