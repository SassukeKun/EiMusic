'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';
import { CreateUserInput } from '../models/user';
import { CreateArtistInput } from '../models/artist';

type AuthUser = User | null;

/**
 * Hook para gerenciar estado de autenticacao
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isArtist, setIsArtist] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();

  // Verifica estado de autenticação ao carregar
  useEffect(() => {
    let isMounted = true;
    
    async function loadUser() {
      try {
        setLoading(true);
        // Buscar usuário atual do Supabase
        const currentUser = await authService.getCurrentUser();
        
        if (isMounted) {
          setUser(currentUser);
          
          // Verificar se é artista
          if (currentUser) {
            try {
              const artistCheck = await authService.isArtist();
              if (isMounted) {
                setIsArtist(artistCheck);
              }
              
              // Verificar se o email está confirmado
              const emailVerified = await authService.isEmailVerified();
              if (isMounted) {
                setIsEmailVerified(emailVerified);
              }
            } catch (artistError) {
              console.log("Erro ao verificar tipo de usuário:", artistError);
              if (isMounted) {
                setIsArtist(false); // Default to regular user on error
              }
            }
          } else {
            // Se não há usuário autenticado, não considerar como erro
            setError(null);
            setIsEmailVerified(false);
          }
        }
      } catch (err: any) {
        console.log('Erro ao carregar usuário:', err);
        if (isMounted) {
          // Não exibir erro de sessão ausente como mensagem de erro para o usuário
          if (err?.message?.includes('Auth session missing')) {
            console.log('Sessão não encontrada - usuário não está autenticado');
            setError(null);
          } else {
            setError('Falha ao carregar informações do usuário');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Efeito para manter o status de artista atualizado
  useEffect(() => {
    if (user) {
      // Verificação explícita do status de artista
      const artistStatus = user.user_metadata?.is_artist === true;
      setIsArtist(artistStatus);
      
      // Log para debug
      console.log('Auth Status:', {
        userId: user.id,
        email: user.email,
        isArtist: artistStatus,
        metadata: user.user_metadata
      });
    }
  }, [user]);

  // Verificar status do email periodicamente
  useEffect(() => {
    // Não verificar se não há usuário ou se o email já está verificado
    if (!user || isEmailVerified) return;
    
    let isMounted = true;
    
    const checkEmailVerification = async () => {
      try {
        // Apenas verificar se ainda temos o componente montado e um usuário
        if (!isMounted || !user) return;
        
        const verified = await authService.isEmailVerified();
        if (isMounted) {
          setIsEmailVerified(verified);
          
          // Se verificou com sucesso, podemos parar as verificações
          if (verified) {
            console.log("Email verificado com sucesso!");
          }
        }
      } catch (err) {
        // A função isEmailVerified já trata os erros internamente,
        // então não precisamos fazer nada aqui
      }
    };
    
    // Verificar imediatamente
    checkEmailVerification();
    
    // E então verificar a cada 10 segundos
    const interval = setInterval(checkEmailVerification, 10000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, isEmailVerified]);

  // Reenviar email de verificação
  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await authService.resendVerificationEmail(email);
      
      if (!result.success) {
        setError(result.error || 'Falha ao reenviar o email de verificação');
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.log('Erro ao reenviar email de verificação:', err);
      setError(err.message || 'Falha ao reenviar o email de verificação');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Login usuário regular
  const loginUser = useCallback(async (email: string, password: string) => {
    try {
      // Limpar possíveis tokens corrompidos antes de tentar login
      if (typeof window !== 'undefined') {
        // Limpar tokens específicos do Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      setLoading(true);
      setError(null);

      const { session, user: userData } = await authService.signInUser(email, password);

      if (!session || !session.refresh_token) {
        setError('Falha na autenticação: token de sessão inválido ou ausente. Tente novamente.');
        return null;
      }

      setUser(session.user || null);
      setIsArtist(false);

      // Verificar se o email está confirmado
      if (session.user) {
        const emailVerified = await authService.isEmailVerified();
        setIsEmailVerified(emailVerified);

        // Redirecionar imediatamente após login e verificação de email
        if (emailVerified) {
          // Redirecionando para a página inicial em vez de dashboard
          router.replace('/');
        } else {
          // Se não verificado, redirecionar para tela de verificação
          router.replace(`/auth/verification?email=${encodeURIComponent(email)}&type=user`);
        }
      }

      return userData;
    } catch (err: any) {
      // Tratamento de erros específicos
      if (err?.message?.includes('Invalid login credentials')) {
        setError('Credenciais inválidas. Verifique seu email e senha.');
      } else if (err?.message?.includes('Email not confirmed')) {
        setError('Seu email ainda não foi verificado. Verifique sua caixa de entrada.');
        // Redirecionar para tela de verificação
        router.replace(`/auth/verification?email=${encodeURIComponent(email)}&type=user`);
      } else if (err?.message?.includes('User not found')) {
        setError('Usuário não encontrado. Verifique seu email ou crie uma conta.');
      } else if (err?.message?.includes('Refresh Token')) {
        setError('Problema com a autenticação. Tente novamente.');
        // Limpar tokens corrompidos
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
      } else {
        setError(err.message || 'Erro de autenticação. Tente novamente mais tarde.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Login artista
  const loginArtist = useCallback(async (email: string, password: string) => {
    try {
      // Limpar possíveis tokens corrompidos antes de tentar login
      if (typeof window !== 'undefined') {
        // Limpar tokens específicos do Supabase
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      setLoading(true);
      setError(null);

      console.log('Iniciando login de artista...');
      const { session, user: artistData } = await authService.signInArtist(email, password);
      console.log('Resposta do login de artista:', { session: !!session, userData: !!artistData });

      if (!session || !session.refresh_token) {
        setError('Falha na autenticação: token de sessão inválido ou ausente. Tente novamente.');
        return null;
      }

      setUser(session.user || null);
      setIsArtist(true);

      // Verificar se o email está confirmado
      if (session.user) {
        const emailVerified = await authService.isEmailVerified();
        setIsEmailVerified(emailVerified);
        console.log('Email verificado:', emailVerified);

        // Redirecionar imediatamente após login e verificação de email
        if (emailVerified) {
          console.log('Redirecionando para página inicial...');
          // Redirecionando para a página inicial em vez de artist/dashboard
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          } else {
            router.replace('/');
          }
        } else {
          // Se não verificado, redirecionar para tela de verificação
          console.log('Redirecionando para verificação de email...');
          if (typeof window !== 'undefined') {
            window.location.href = `/auth/verification?email=${encodeURIComponent(email)}&type=artist`;
          } else {
            router.replace(`/auth/verification?email=${encodeURIComponent(email)}&type=artist`);
          }
        }
      }

      return artistData;
    } catch (err: any) {
      setError(err.message || 'Falha ao realizar login como artista');
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Login com OAuth
  const loginWithOAuth = useCallback(async (provider: 'google' | 'facebook' | 'twitter', userType: 'user' | 'artist') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Iniciando processo de login com ${provider} como ${userType}...`);
      
      // Notificar o usuário que o processo está em andamento
      setError('Preparando autenticação, aguarde...');
      
      // Importar dinâmicamente o utilitário OAuth
      const { initiateOAuthSignIn } = await import('../utils/supabaseOAuth');
      
      // Iniciar o fluxo de autenticação OAuth
      // Esta função redirecionará o usuário para o provedor OAuth
      await initiateOAuthSignIn(provider, userType);
      
      // Se chegarmos aqui, é porque o redirecionamento não aconteceu
      // (por exemplo, em um ambiente de teste ou simulação)
      console.log('Aviso: O redirecionamento OAuth não ocorreu como esperado');
      setError(null); // Limpar a mensagem de "aguarde"
      
      return true;
    } catch (err: any) {
      console.log('Erro ao iniciar login OAuth:', err);
      
      // Exibir mensagem de erro amigável
      if (err.message && err.message.includes('network')) {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (err.message && err.message.includes('configuration')) {
        setError('Erro de configuração do provedor de autenticação. Entre em contato com o suporte.');
      } else {
        setError('Erro ao iniciar login com ' + provider + '. Tente novamente mais tarde.');
      }
      
      return false;
    } finally {
      // Remover o estado de loading
      setLoading(false);
    }
  }, []);

  // Registro de usuário regular
  const registerUser = useCallback(async (userData: CreateUserInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.signUpUser(userData);
      setUser(data.user);
      setIsArtist(false);
      setIsEmailVerified(false); // Email recém-registrado não está verificado ainda
      
      // Verificar se precisa de verificação de email e redirecionar
      if (data.needsEmailVerification && data.verificationUrl) {
        router.push(data.verificationUrl);
        return data;
      }
      
      // Se não precisa de verificação ou se não temos URL, comportamento padrão
      if (data.user) {
        router.push('/dashboard');
      }
      
      return data;
    } catch (err: any) {
      console.log('Erro ao registrar:', err);
      // Improved error handling with better fallbacks
      if (err?.message) {
        setError(err.message);
      } else if (err?.error_description) {
        setError(err.error_description);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        // If err is an empty object or doesn't have useful properties
        setError('Falha ao criar conta. Verifique suas credenciais e tente novamente.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Registro de artista
  const registerArtist = useCallback(async (artistData: CreateArtistInput) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.signUpArtist(artistData);
      setUser(data.user);
      setIsArtist(true);
      setIsEmailVerified(false); // Email recém-registrado não está verificado ainda
      
      // Verificar se precisa de verificação de email e redirecionar
      if (data.needsEmailVerification && data.verificationUrl) {
        router.push(data.verificationUrl);
        return data;
      }
      
      // Se não precisa de verificação ou se não temos URL, comportamento padrão
      if (data.user) {
        router.push('/artist/dashboard');
      }
      
      return data;
    } catch (err: any) {
      console.log('Erro ao registrar artista:', err);
      // Improved error handling with better fallbacks
      if (err?.message) {
        setError(err.message);
      } else if (err?.error_description) {
        setError(err.error_description);
      } else if (typeof err === 'string') {
        setError(err);
      } else {
        // If err is an empty object or doesn't have useful properties
        setError('Falha ao criar conta de artista. Verifique suas credenciais e tente novamente.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.signOut();
      setUser(null);
      setIsArtist(false);
      setIsEmailVerified(false);
      
      // Redirecionar para página inicial
      router.push('/');
    } catch (err: any) {
      console.log('Erro ao fazer logout:', err);
      setError(err.message || 'Falha ao realizar logout');
    } finally {
      setLoading(false);
    }
  }, [router]);

  return {
    user,
    isArtist,
    isEmailVerified,
    loading,
    error,
    loginUser,
    loginArtist,
    loginWithOAuth,
    registerUser,
    registerArtist,
    resendVerificationEmail,
    logout,
    isAuthenticated: !!user,
  };
}

export default useAuth;