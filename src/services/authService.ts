import { User, CreateUserInput } from '../models/user';
import { CreateArtistInput } from '../models/artist';
import { getSupabaseBrowserClient } from '../utils/supabaseClient';

// Helper for logging sessionStorage
const PKCE_VERIFIER_KEY_PREFIX = 'sb-';
const PKCE_VERIFIER_KEY_SUFFIX = '-auth-session-code-verifier';
const PROJECT_REF = "rayacnytyvuytjmlklot"; // From your Supabase URL
const EXPECTED_PKCE_KEY = `${PKCE_VERIFIER_KEY_PREFIX}${PROJECT_REF}${PKCE_VERIFIER_KEY_SUFFIX}`;

const logSessionStoragePkceVerifier = (context: string) => {
  console.log(`[SessionStorage PKCE Check - ${context}]`);
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const verifierValue = sessionStorage.getItem(EXPECTED_PKCE_KEY);
    if (verifierValue) {
      console.log(`  FOUND PKCE verifier key '${EXPECTED_PKCE_KEY}'. Value (first 50 chars): ${verifierValue.substring(0, 50)}`);
    } else {
      console.log(`  PKCE verifier key '${EXPECTED_PKCE_KEY}' NOT FOUND.`);
    }
    // Log all sessionStorage keys for broader context
    const allKeys = Object.keys(sessionStorage);
    console.log(`  All sessionStorage keys (${allKeys.length}): [${allKeys.join(', ')}]`);
    if (allKeys.length > 0 && !verifierValue) {
      allKeys.forEach(key => {
        if (key.includes('verifier') || key.includes('pkce')) {
          console.log(`  Other potential PKCE/verifier related key found: ${key} = ${sessionStorage.getItem(key)?.substring(0,50)}...`);
        }
      });
    }
  } else {
    console.log('  sessionStorage not available or window is undefined.');
  }
};

/**
 * Service for authentication operations
 */
const authService = {
  /**
   * Clear all auth-related storage
   */
  clearAuthStorage() {
    if (typeof window === 'undefined') return;

    // Clear Supabase-specific items from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      } 
    });

    // Clear Supabase-specific items from sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  },

  /**
   * Login with email and password for artists
   */
  async signInArtist(email: string, password: string) {
    // Clear any existing auth data first
    this.clearAuthStorage();
    
    const supabaseClient = getSupabaseBrowserClient();
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw error;
    }
    
    if (!data.session?.refresh_token) {
      throw new Error('Invalid Refresh Token: Refresh Token Not Found');
    }

    // Verify that this is an artist account
    if (data.user?.user_metadata?.is_artist !== true) {
      throw new Error('Esta conta não pertence a um artista. Por favor, use a área de login de usuário regular.');
    }

    // Get additional artist data
    const { data: artistData, error: artistError } = await supabaseClient
      .from('artists')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (artistError) {
      if (artistError.code === 'PGRST116') {
        const artistRecord = {
          id: data.user.id,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Artista',
          email: data.user.email,
          created_at: new Date().toISOString(),
        };

        const { data: newArtistData, error: insertError } = await supabaseClient
          .from('artists')
          .upsert(artistRecord)
          .select()
          .single();

        if (insertError) {
          throw new Error('Falha ao acessar perfil de artista. Por favor, contate o suporte.');
        }

        return {
          session: data.session,
          user: newArtistData
        };
      }
      throw artistError;
    }

    return {
      session: data.session,
      user: artistData
    };
  },

  /**
   * Login com email e senha para usuarios regulares
   * @param email - Email do usuario
   * @param password - Senha do usuario
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signInUser(email: string, password: string) {
    const supabaseClient = getSupabaseBrowserClient();
    
    // Autenticar usuario com o Supabase auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
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
    const { data: userData, error: userError } = await supabaseClient
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
        
        const { data: newUserData, error: insertError } = await supabaseClient
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
   * Login com provedor OAuth (Google, etc)
   * @param provider - Nome do provedor OAuth
   * @param userType - Tipo de usuário ('user' ou 'artist')
   * @returns URL de redirecionamento
   */
  async signInWithOAuth(provider: 'google' | 'facebook' | 'twitter', userType: 'user' | 'artist' = 'user') {
    if (typeof window === 'undefined') {
      throw new Error('signInWithOAuth can only be called on the client side.');
    }

    // Clear existing auth data
    this.clearAuthStorage();
    
    logSessionStoragePkceVerifier('signInWithOAuth - Start');
    
    const supabaseClient = getSupabaseBrowserClient();
    
    await supabaseClient.auth.signOut();
    logSessionStoragePkceVerifier('signInWithOAuth - After signOut');
    
    const origin = window.location.origin;
    const callbackUrl = `${origin}/auth/callback`;
    
    logSessionStoragePkceVerifier('signInWithOAuth - Before OAuth');
    
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          userType // Pass userType as a query parameter
        }
      }
    });
    
    if (error) {
      console.error('OAuth Error:', error);
      logSessionStoragePkceVerifier('signInWithOAuth - Error');
      throw error;
    }
    
    if (!data?.url) {
      console.error('No redirect URL in OAuth response');
      logSessionStoragePkceVerifier('signInWithOAuth - No URL');
      throw new Error('Failed to generate auth URL');
    }
    
    logSessionStoragePkceVerifier('signInWithOAuth - Success');
    return data.url;
  },

  /**
   * Cadastro de usuario regular
   * @param userData - Dados do usuário para cadastro
   * @returns Dados da sessao de autenticacao ou erro
   */
  async signUpUser(userData: CreateUserInput) {
    const supabaseClient = getSupabaseBrowserClient();
    
    // Verificar se o email já existe
    try {
      const { data: existingUser, error: checkError } = await supabaseClient
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
      const { error: existingUserError } = await supabaseClient.auth.signInWithOtp({
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
    const origin = window.location.origin;
    const redirectUrl = `${origin}/dashboard`;
    
    // Cadastrar novo usuario com o Supabase auth
    const { data, error } = await supabaseClient.auth.signUp({
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
      console.error('Supabase auth error:', error);
      throw error;
    }
    
    // Inserir dados adicionais na tabela users
    if (data.user) {
      try {
        // Garantir que estamos utilizando a sessão para autenticação
        // Isso é crucial para que as políticas RLS funcionem
        if (data.session) {
          await supabaseClient.auth.setSession(data.session);
          
          // Criar um novo cliente com o token da sessão para garantir autenticação
          const authenticatedSupabase = supabaseClient;
        
        // Criando o objeto com todos os campos possíveis que podem ser necessários
        const userRecord = {
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          payment_method: userData.payment_method || null,
          has_active_subscription: userData.has_active_subscription || false,
          // Não envie created_at, deixe o banco preencher
          is_sso_user: false,
          is_anonymous: false,
          is_admin: false,
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
    const supabaseClient = getSupabaseBrowserClient();
    
    // Verificar se o email já existe
    try {
      const { data: existingUser, error: checkError } = await supabaseClient
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
      const { error: existingUserError } = await supabaseClient.auth.signInWithOtp({
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
    const origin = window.location.origin;
    const redirectUrl = `${origin}/artist/dashboard`;
    
    // Cadastrar novo artista com o Supabase auth
    const { data, error } = await supabaseClient.auth.signUp({
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
          await supabaseClient.auth.setSession(data.session);
          
          // Criar um novo cliente com o token da sessão para garantir autenticação
          const authenticatedSupabase = supabaseClient;
        
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
          created_at: new Date().toISOString(),
          // Campos obrigatórios da tabela artists
          verified: false, // ou true, se quiser marcar como verificado por padrão
          subscribers: 0,
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
    const supabaseClient = getSupabaseBrowserClient();
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw error;
    }
  },

  /**
   * Obter o usuario logado atualmente
   * @returns A sessao do usuario atual
   */
  async getCurrentUser() {
    const supabaseClient = getSupabaseBrowserClient();
    // Primeiro verifica se há uma sessão ativa
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError) {
      return null;
    }
    
    if (!sessionData.session) {
      return null;
    }
    
    // Agora que sabemos que há uma sessão, obtém os dados do usuário
    const { data, error } = await supabaseClient.auth.getUser();
    
    if (error) {
      return null;
    }
    
    return data.user;
  },

  /**
   * Verificar se o usuário atual é um artista
   * @returns Boolean indicando se é artista
   */
  async isArtist() {
    const supabaseClient = getSupabaseBrowserClient();
    const { data: user } = await supabaseClient.auth.getUser();
    
    if (!user.user) return false;
    
    // First check if the is_artist flag is set in user metadata
    if (user.user.user_metadata && user.user.user_metadata.is_artist === true) {
      // Se é artista conforme metadados, vamos garantir que exista na tabela
      try {
        // Verificar se já existe na tabela
        const { count, error } = await supabaseClient
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
            
          await supabaseClient
            .from('artists')
            .upsert(artistRecord, { onConflict: 'id' });
        }
      } catch (syncError) {
        // Continua considerando como artista mesmo se falhar a sincronização
      }
        
      return true;
    }
    
    // Verificar na tabela de artistas
    const { count, error } = await supabaseClient
      .from('artists')
      .select('id', { count: 'exact' })
      .eq('id', user.user.id);
        
    if (error) {
      // Fallback to user metadata if DB query fails
      return !!(user.user.user_metadata && user.user.user_metadata.is_artist);
    }
    
    // Check if count is greater than 0 to determine if user is an artist
    return count !== null && count > 0;
  },

  /**
   * Verificar se o email do usuário está confirmado
   * @param userId - ID opcional do usuário (usa o usuário atual se não fornecido)
   * @returns Boolean indicando se o email está confirmado
   */
  async isEmailVerified(userId?: string) {
    const supabaseClient = getSupabaseBrowserClient();
    // Primeiro, verificar se existe uma sessão ativa
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
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
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) {
        return false;
      }
      user = data.user;
    }

    if (!user) return false;
    
    // O Supabase define email_confirmed_at quando o email é verificado
    return user.email_confirmed_at !== null;
  },

  /**
   * Reenviar email de confirmação
   * @param email - Email do usuário
   * @returns Status da operação
   */
  async resendVerificationEmail(email: string) {
    const supabaseClient = getSupabaseBrowserClient();
    const { error } = await supabaseClient.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  },

  /**
   * Configurar políticas RLS para inserção de novos usuários e artistas
   * Essa função deve ser executada por um usuário admin
   * @returns Status da operação
   */
  async configureRlsPolicies() {
    const supabaseClient = getSupabaseBrowserClient();
    // Verifica se o usuário atual tem privilégios de admin
    const { data: user } = await supabaseClient.auth.getUser();
    if (!user.user || !user.user.app_metadata || !user.user.app_metadata.role || user.user.app_metadata.role !== 'admin') {
      throw new Error('Você não tem permissão para configurar políticas RLS');
    }

    // Execute SQL para criar políticas RLS para usuários
    const { error: usersError } = await supabaseClient.rpc('execute_sql', {
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
    const { error: artistsError } = await supabaseClient.rpc('execute_sql', {
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
  }
};

export default authService;