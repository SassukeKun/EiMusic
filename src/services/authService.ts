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
    
    // Check for valid refresh token
    if (!data.session?.refresh_token) {
      throw new Error('Invalid Refresh Token: Refresh Token Not Found');
    }
    // Verificar se é artista - se for, não permitir login como usuário regular
    if (data.user?.user_metadata?.is_artist === true) {
      throw new Error('Esta conta pertence a um artista. Por favor, use a área de login de artista.');
    }
    
    // Buscar dados extras do usuario (tabela users)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (userError) {
      // Se o erro for que nenhuma linha foi encontrada, vamos tentar criar o registro
      if (userError.code === 'PGRST116' || userError.message?.includes('rows returned')) {
        // Extrair dados dos metadados de autenticação para criar o registro
        const userMetadata = data.user.user_metadata || {};
        
        // Criar registro na tabela users
        const userRecord = {
          id: data.user.id,
          name: userMetadata.name || data.user.email?.split('@')[0] || 'Usuário',
          email: data.user.email,
          payment_method: userMetadata.payment_method || null,
          has_active_subscription: userMetadata.has_active_subscription || false,
        };
        
        const { data: newUserData, error: insertError } = await supabase
          .from('users')
          .upsert(userRecord, { onConflict: 'id' })
          .select()
          .single();
          
        if (insertError) {
          throw new Error('Falha ao acessar perfil de usuário. Por favor, contate o suporte.');
        }
        
        return {
          session: data.session,
          user: newUserData
        };
      } else {
        // Se for outro tipo de erro, lançar normalmente
      throw userError;
      }
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

    // Check for valid refresh token
    if (!data.session?.refresh_token) {
      throw new Error('Invalid Refresh Token: Refresh Token Not Found');
    }
    
    // Verificar se é realmente um artista - deve ter is_artist = true nos metadados
    // Isso é a verificação primária mais confiável
    const isArtistFromMetadata = data.user.user_metadata?.is_artist === true;
    
    if (!isArtistFromMetadata) {
      throw new Error('Esta conta não pertence a um artista. Por favor, use a área de login de usuário regular.');
    }
    
    // Buscar dados extras do artista (tabela artists)
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (artistError) {
      // Se o erro for que nenhuma linha foi encontrada, vamos tentar criar o registro
      if (artistError.code === 'PGRST116' || artistError.message?.includes('rows returned')) {
        // Extrair dados dos metadados de autenticação para criar o registro
        const userMetadata = data.user.user_metadata || {};
        
        // Criar registro na tabela artists
        const artistRecord = {
          id: data.user.id,
          name: userMetadata.name || data.user.email?.split('@')[0] || 'Artista',
          email: data.user.email,
          bio: userMetadata.bio || null,
          phone: userMetadata.phone || null,
          monetization_plan_id: userMetadata.monetization_plan_id || null,
          profile_image_url: userMetadata.profile_image_url || null,
          social_links: userMetadata.social_links || null,
        };
        
        const { data: newArtistData, error: insertError } = await supabase
          .from('artists')
          .upsert(artistRecord, { onConflict: 'id' })
          .select()
          .single();
          
        if (insertError) {
          // Apenas logamos o erro mas permitimos prosseguir, pois temos os metadados corretos
          console.error('Erro ao criar registro de artista:', insertError.message);
          
          // Criamos um objeto temporário para retornar ao usuário mesmo sem registro no DB
          const tempArtistData = {
            id: data.user.id,
            email: data.user.email,
            name: userMetadata.name || data.user.email?.split('@')[0] || 'Artista',
            is_artist: true
          };
          
          return {
            session: data.session,
            user: tempArtistData as any
          };
        }
        
        return {
          session: data.session,
          user: newArtistData
        };
      } else {
        // Se for outro tipo de erro, lançar normalmente
      throw artistError;
      }
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
        queryParams: {
          redirect_to: `${window.location.origin}/`
        }
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
    // Verificar se o email já existe
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('auth_email_check_view')
        .select('email, is_artist')
        .eq('email', userData.email)
        .maybeSingle();

      if (existingUser) {
        if (existingUser.is_artist) {
          throw new Error('Este email já está registrado como artista. Use um email diferente ou faça login como artista.');
        } else {
          throw new Error('Este email já está em uso. Faça login ou use a recuperação de senha se necessário.');
        }
      }
    } catch (viewError) {
      // Fallback - vamos tentar fazer login sem senha para ver se o email existe
      // Essa abordagem não é ideal, mas funciona para verificar se um email está cadastrado
      const { error: existingUserError } = await supabase.auth.signInWithOtp({
        email: userData.email,
        options: {
          shouldCreateUser: false // Não criar usuário se não existir
        }
      });
      
      // Se não retornar "User not found", significa que o email existe
      if (!existingUserError || !existingUserError.message.includes('User not found')) {
        throw new Error('Este email já está em uso. Faça login ou use a recuperação de senha se necessário.');
      }
    }
    
    // Simplificamos o URL de redirecionamento para enviar direto para a home
    // Não usamos mais a rota /auth/callback para evitar problemas com PKCE
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUrl = `${origin}/dashboard`;
    
    // Cadastrar novo usuario com o Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          payment_method: userData.payment_method || null,
          has_active_subscription: userData.has_active_subscription || false,
        },
        emailRedirectTo: redirectUrl,
      }
    });
    
    if (error) {
      throw error;
    }
    
    // Inserir dados adicionais na tabela users
    if (data.user) {
      try {
        // Garantir que estamos utilizando a sessão para autenticação
        // Isso é crucial para que as políticas RLS funcionem
        if (data.session) {
          await supabase.auth.setSession(data.session);
          
          // Criar um novo cliente com o token da sessão para garantir autenticação
          const authenticatedSupabase = supabase;
        
        // Criando o objeto com todos os campos possíveis que podem ser necessários
        const userRecord = {
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          payment_method: userData.payment_method || null,
          has_active_subscription: userData.has_active_subscription || false,
            created_at: new Date().toISOString(), // Adicionando campo de data se for necessário
        };
        
          // Tentativa com upsert usando o cliente autenticado
          const { error: profileError } = await authenticatedSupabase
          .from('users')
          .upsert(userRecord, { onConflict: 'id' });
          
        if (profileError) {
            // Tratamento silencioso de erro com política RLS
          }
        }
      } catch (err) {
        // Não lançamos erro aqui para permitir que o login prossiga,
        // já que armazenamos os metadados do usuário no Auth
      }
    } else {
      throw new Error('Falha ao criar usuário: dados do usuário não retornados pelo Supabase');
    }
    
    // Adicionando flag para indicar que a verificação de email é necessária
    // e redirecionar para a página de verificação
    return {
      ...data,
      needsEmailVerification: true,
      verificationUrl: `/auth/verification?email=${encodeURIComponent(userData.email)}&type=user`
    };
  },
  
  /**
   * Cadastro de artista
   * @param artistData - Dados do artista para cadastro
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signUpArtist(artistData: CreateArtistInput) {
    // Verificar se o email já existe
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('auth_email_check_view')
        .select('email, is_artist')
        .eq('email', artistData.email)
        .maybeSingle();

      if (existingUser) {
        if (!existingUser.is_artist) {
          throw new Error('Este email já está registrado como usuário regular. Use um email diferente ou faça login como usuário.');
        } else {
          throw new Error('Este email já está em uso. Faça login ou use a recuperação de senha se necessário.');
        }
      }
    } catch (viewError) {
      // Fallback - vamos tentar fazer login sem senha para ver se o email existe
      // Essa abordagem não é ideal, mas funciona para verificar se um email está cadastrado
      const { error: existingUserError } = await supabase.auth.signInWithOtp({
        email: artistData.email,
        options: {
          shouldCreateUser: false // Não criar usuário se não existir
        }
      });
      
      // Se não retornar "User not found", significa que o email existe
      if (!existingUserError || !existingUserError.message.includes('User not found')) {
        throw new Error('Este email já está em uso. Faça login ou use a recuperação de senha se necessário.');
      }
    }
    
    // Simplificamos o URL de redirecionamento para enviar direto para a home do artista
    // Não usamos mais a rota /auth/callback para evitar problemas com PKCE
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectUrl = `${origin}/artist/dashboard`;
    
    // Cadastrar novo artista com o Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email: artistData.email,
      password: artistData.password || '',
      options: {
        data: {
          name: artistData.name,
          bio: artistData.bio || null,
          phone: artistData.phone || null,
          monetization_plan_id: artistData.monetization_plan_id || null,
          profile_image_url: artistData.profile_image_url || null,
          social_links: artistData.social_links || null,
          is_artist: true,
        },
        emailRedirectTo: redirectUrl,
      }
    });
    
    if (error) {
      throw error;
    }
    
    // Inserir dados adicionais na tabela artists
    if (data.user) {
      try {
        // Garantir que estamos utilizando a sessão para autenticação
        // Isso é crucial para que as políticas RLS funcionem
        if (data.session) {
          await supabase.auth.setSession(data.session);
          
          // Criar um novo cliente com o token da sessão para garantir autenticação
          const authenticatedSupabase = supabase;
        
        // Criando o objeto com todos os campos possíveis que podem ser necessários
        const artistRecord = {
          id: data.user.id,
          name: artistData.name,
          email: artistData.email,
          bio: artistData.bio || null,
          phone: artistData.phone || null,
          monetization_plan_id: artistData.monetization_plan_id || null,
          profile_image_url: artistData.profile_image_url || null,
          social_links: artistData.social_links || null,
          created_at: new Date().toISOString(),  // Adicionando campo de data se for necessário
        };
        
          // Tentativa com upsert usando o cliente autenticado
          const { error: profileError } = await authenticatedSupabase
          .from('artists')
          .upsert(artistRecord, { onConflict: 'id' });
          
        if (profileError) {
            // Tratamento silencioso de erro com política RLS
          }
        }
      } catch (err) {
        // Não lançamos erro aqui para permitir que o login prossiga,
        // já que armazenamos os metadados do usuário no Auth
      }
    } else {
      throw new Error('Falha ao criar artista: dados do usuário não retornados pelo Supabase');
    }
    
    // Adicionando flag para indicar que a verificação de email é necessária
    // e redirecionar para a página de verificação
    return {
      ...data,
      needsEmailVerification: true,
      verificationUrl: `/auth/verification?email=${encodeURIComponent(artistData.email)}&type=artist`
    };
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
        return null;
      }
      
      if (!sessionData.session) {
        return null;
      }
      
      // Agora que sabemos que há uma sessão, obtém os dados do usuário
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        return null;
      }
      
      return data.user;
    } catch (error) {
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
      
      // First check if the is_artist flag is set in user metadata
      if (user.user.user_metadata && user.user.user_metadata.is_artist === true) {
        // Se é artista conforme metadados, vamos garantir que exista na tabela
        try {
          // Verificar se já existe na tabela
          const { count, error } = await supabase
            .from('artists')
            .select('id', { count: 'exact' })
            .eq('id', user.user.id);
            
          // Se não existe e não houve erro de permissão, criar o registro
          if (count === 0 && !error) {
            const userMetadata = user.user.user_metadata || {};
            
            // Criar registro na tabela artists
            const artistRecord = {
              id: user.user.id,
              name: userMetadata.name || user.user.email?.split('@')[0] || 'Artista',
              email: user.user.email,
              bio: userMetadata.bio || null,
              phone: userMetadata.phone || null,
              monetization_plan_id: userMetadata.monetization_plan_id || null,
              profile_image_url: userMetadata.profile_image_url || null,
              social_links: userMetadata.social_links || null,
            };
            
            await supabase
              .from('artists')
              .upsert(artistRecord, { onConflict: 'id' });
          }
        } catch (syncError) {
          // Continua considerando como artista mesmo se falhar a sincronização
        }
        
        return true;
      }
      
      // Verificar na tabela de artistas
      const { count, error } = await supabase
        .from('artists')
        .select('id', { count: 'exact' })
        .eq('id', user.user.id);
        
      if (error) {
        // Fallback to user metadata if DB query fails
        return !!(user.user.user_metadata && user.user.user_metadata.is_artist);
      }
      
      // Check if count is greater than 0 to determine if user is an artist
      return count !== null && count > 0;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verificar se o email do usuário está confirmado
   * @param userId - ID opcional do usuário (usa o usuário atual se não fornecido)
   * @returns Boolean indicando se o email está confirmado
   */
  async isEmailVerified(userId?: string) {
    try {
      // Primeiro, verificar se existe uma sessão ativa
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return false;
      }
      
      if (!sessionData.session) {
        return false;
      }
      
      let user;
      
      if (userId) {
        // Se um ID específico foi fornecido, tente buscar esse usuário via admin (não implementado)
        // Isso só seria possível com funções Edge/Server pelo Supabase
        return false;
      } else {
        // Buscar usuário atual
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          return false;
        }
        user = data.user;
      }

      if (!user) return false;
      
      // O Supabase define email_confirmed_at quando o email é verificado
      return user.email_confirmed_at !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Reenviar email de confirmação
   * @param email - Email do usuário
   * @returns Status da operação
   */
  async resendVerificationEmail(email: string) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro desconhecido' };
    }
  },

  /**
   * Configurar políticas RLS para inserção de novos usuários e artistas
   * Essa função deve ser executada por um usuário admin
   * @returns Status da operação
   */
  async configureRlsPolicies() {
    try {
      // Verifica se o usuário atual tem privilégios de admin
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || !user.user.app_metadata || !user.user.app_metadata.role || user.user.app_metadata.role !== 'admin') {
        throw new Error('Você não tem permissão para configurar políticas RLS');
      }

      // Execute SQL para criar políticas RLS para usuários
      const { error: usersError } = await supabase.rpc('execute_sql', {
        sql: `
          DROP POLICY IF EXISTS users_insert ON users;
          CREATE POLICY users_insert ON users 
            FOR INSERT WITH CHECK (auth.uid() = id);
        `
      });

      if (usersError) {
        console.error('Erro ao configurar política RLS para usuários:', usersError);
        return { success: false, error: usersError };
      }

      // Execute SQL para criar políticas RLS para artistas
      const { error: artistsError } = await supabase.rpc('execute_sql', {
        sql: `
          DROP POLICY IF EXISTS artists_insert ON artists;
          CREATE POLICY artists_insert ON artists 
            FOR INSERT WITH CHECK (auth.uid() = id);
        `
      });

      if (artistsError) {
        console.error('Erro ao configurar política RLS para artistas:', artistsError);
        return { success: false, error: artistsError };
      }

      return { success: true };
    } catch (error) {
      console.error('Exceção ao configurar políticas RLS:', error);
      return { success: false, error };
    }
  }
};

export default authService; 