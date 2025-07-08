// src/app/login/page.tsx (correção do erro)
'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa'

// Schema para validação do formulário
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser, loginArtist, loginWithOAuth, loading, error } = useAuth();
  const [userType, setUserType] = useState<'user' | 'artist'>('user');
  const [authError, setAuthError] = useState<string | null>(error);
  const [showPassword, setShowPassword] = useState(false);

  // Configuração do React Hook Form com validação Zod
  const {
    register,
    handleSubmit, // Aqui está a função handleSubmit que será usada mais abaixo
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Verificar erros nos parâmetros da URL
  useEffect(() => {
    if (searchParams) {
      const errorParam = searchParams.get('error');
      const errorMessage = searchParams.get('message');
      const clearCookies = searchParams.get('clear_cookies') === 'true';
      
      // Se tiver a flag clear_cookies, limpar apenas os tokens necessários do Supabase
      // Abordagem mais seletiva para evitar lentidão
      if (clearCookies && typeof window !== 'undefined') {
        console.log('Limpando tokens de autenticação específicos');
        
        // Obter o prefixo específico do projeto Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const projectId = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || 'unknown';
        const storagePrefix = `sb-${projectId}`;
        
        // Limpar apenas os tokens de autenticação específicos
        const authTokenKey = `${storagePrefix}-auth-token`;
        localStorage.removeItem(authTokenKey);
        sessionStorage?.removeItem(authTokenKey);
        
        // Limpar apenas o cookie de autenticação específico
        document.cookie = `${authTokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
      
      if (errorParam) {
        const errorMessages: Record<string, string> = {
          'auth_callback_error': 'Erro ao processar autenticação. Tente novamente.',
          'no_session': 'Sessão não encontrada. Tente fazer login novamente.',
          'no_code': 'Erro no código de autenticação. Por favor, tente fazer login novamente.',
          'invalid_code': 'Código de autenticação inválido ou expirado. Tente novamente.',
          'session_expired': 'Sua sessão expirou. Por favor, faça login novamente.',
          'pkce_error': 'Erro de verificação no processo de autenticação. Por favor, tente novamente.',
          'auth_error': errorMessage || 'Erro de autenticação. Tente novamente mais tarde.',
          'callback_processing': 'Erro ao processar callback de autenticação.',
        };

        // Limpar storage em caso de erros relacionados à sessão
        if (['session_expired', 'no_code', 'invalid_code', 'pkce_error'].includes(errorParam)) {
          if (typeof window !== 'undefined') {
            // Limpar tokens específicos do Supabase de localStorage para todos estes erros
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
              }
            });

            // Para sessionStorage, limpar todos os itens 'sb-' APENAS se NÃO for pkce_error.
            // Para pkce_error, o 'clear_cookies=true' já lida com o 'sb-...-auth-token' em sessionStorage,
            // e não queremos remover um novo 'code_verifier' que possa ter sido definido.
            if (errorParam !== 'pkce_error') {
              Object.keys(sessionStorage).forEach(key => { 
                if (key.startsWith('sb-')) {
                  sessionStorage.removeItem(key);
                }
              });
            }
          }
        }

        setAuthError(errorMessages[errorParam] || 'Erro ao processar autenticação.');
      }
    }
  }, [searchParams]);

  // Handler para login
  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);

    try {
      if (userType === 'artist') {
        const result = await loginArtist(data.email, data.password);
        if (result) {
          router.replace('/artist/dashboard');
        } else {
          setAuthError('Credenciais inválidas ou conta de artista não encontrada');
        }
      } else {
        const result = await loginUser(data.email, data.password);
        if (result) {
          router.replace('/');
        } else {
          setAuthError('Credenciais inválidas ou conta de usuário não encontrada');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    try {
      // Clear any previous error messages
      setAuthError(null);
      
      // Import our OAuth utility dynamically
      const { initiateOAuthSignIn } = await import('@/utils/supabaseOAuth');
      
      console.log(`Iniciando login com Google como ${userType}...`);
      
      // Call our direct OAuth utility
      // This will handle localStorage, sessionStorage cleaning, and the redirect
      await initiateOAuthSignIn('google', userType);
      
      // If we reach this point, the redirect didn't happen (which shouldn't occur in normal operation)
      console.warn('Redirecionamento OAuth não ocorreu como esperado');
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      setAuthError('Erro ao iniciar login com Google. Tente novamente.');
    }
  };

  // Alternar visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [animateContent, setAnimateContent] = useState(false);

useEffect(() => {
  setAnimateContent(true);
  const timer = setTimeout(() => setAnimateContent(false), 300);
  return () => clearTimeout(timer);
}, [userType]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 w-full overflow-hidden">
      <div className={`relative pt-20 pb-10 px-8 ${animateContent ? 'animate-pulse' : ''}`}></div>
      <div className="relative w-full max-w-md">
        {/* Elementos decorativos musicais */}
        <motion.div
          className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-gray-300/10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/4 -right-8 w-16 h-16 rounded-full bg-gray-400/10"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, delay: 1, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-8 -left-5 w-24 h-24 rounded-full bg-gray-200/10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, delay: 2, repeat: Infinity }}
        />

        {/* Notas musicais decorativas */}
        <div className="absolute top-0 right-1/4 text-gray-300/40 text-4xl">♪</div>
        <div className="absolute bottom-1/4 left-0 text-gray-300/40 text-5xl">♫</div>
        <div className="absolute bottom-10 right-5 text-gray-300/40 text-3xl">♩</div>

        {/* Card principal */}
        <motion.div
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl 
                   border border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative">
            {/* Barra de ritmo decorativa no topo */}
            <div className="h-2 bg-gradient-to-r from-gray-700 via-indigo-700 to-gray-700 w-full"></div>

            {/* Wave design - efeito de onda */}
            <div className="absolute top-2 left-0 w-full">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-8 w-full">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                  fill="rgba(255, 255, 255, 0.03)"></path>
              </svg>
            </div>

            <div className="pt-14 pb-8 px-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image src="/musicSS.svg" alt="Logo" width={100} height={100} priority className="rounded-full p-2 bg-gray-800/50" />
              </div>


              {/* Título */}
              <h1 className={`text-3xl font-bold ${userType === 'artist' ? 'text-indigo-300' : 'text-gray-100'} text-center mb-2`}>
                {userType === 'artist' ? 'Área do Artista' : 'Entre na sua conta'}
              </h1>
              <p className="text-gray-400 text-center mb-6">
                {userType === 'artist' ? 'Pronto, para brilhar ?' : 'Acesse sua conta de ouvinte'}
              </p>

              {/* Botões de alternância entre usuário e artista */}
              <div className="flex rounded-lg shadow-sm justify-center mb-6 bg-gray-800/50 p-1">
                <button
                  type="button"
                  onClick={() => setUserType('user')}
                  className={`relative px-5 py-2 text-sm font-medium rounded-md transition-colors ${userType === 'user'
                      ? 'bg-indigo-900 text-white shadow-inner'
                      : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                >
                  Usuário
                  {userType === 'user' && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl text-indigo-400">•</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('artist')}
                  className={`relative px-5 py-2 text-sm font-medium rounded-md transition-colors ${userType === 'artist'
                      ? 'bg-indigo-900 text-white shadow-inner'
                      : 'text-gray-300 hover:bg-gray-700/50'
                    }`}
                >
                  Artista
                  {userType === 'artist' && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xl text-indigo-400">•</span>
                  )}
                </button>
              </div>

              {/* Exibir mensagens de erro */}
              {authError && (
                <div className="rounded-md bg-red-900/30 p-4 mb-4 border border-red-800/40">
                  <h3 className="text-sm font-medium text-red-200">Erro de autenticação</h3>
                  <p className="mt-1 text-sm text-gray-300">{authError}</p>
                </div>
              )}

              {/* Formulário de login */}
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">@</span>
                  </div>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/80 text-white placeholder-gray-500
                             border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 
                             focus:border-indigo-600/50 transition"
                    placeholder="Seu email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">🔒</span>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-800/80 text-white placeholder-gray-500
                             border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50
                             focus:border-indigo-600/50 transition"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-indigo-600 
                               focus:ring-indigo-600 focus:ring-offset-gray-900"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                      Lembrar-me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      Esqueceu sua senha?
                    </Link>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-indigo-700 hover:bg-indigo-600
                          text-white font-semibold shadow transition 
                          disabled:bg-indigo-900 disabled:opacity-70"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </motion.button>
              </form>

              {/* resto do código continua igual... */}
              {/* Divisor "OU" */}
              <div className="my-6 flex items-center">
                <hr className="flex-grow border-gray-700" />
                <span className="mx-4 text-gray-500 text-sm">OU</span>
                <hr className="flex-grow border-gray-700" />
              </div>

              {/* Botão do Google
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-lg bg-gray-800 text-gray-200 font-medium 
                         border border-gray-700 shadow
                         flex items-center justify-center hover:bg-gray-700 transition"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FaGoogle className="mr-2 text-red-500" />
                Entrar com Google
              </motion.button> */}

              {/* Link para Registro */}
              <p className="mt-6 text-center text-gray-500 text-sm">
                Não tem uma conta?{' '}
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Cadastre-se
                </Link>
              </p>
            </div>

            {/* Wave design - efeito de onda inferior */}
            <div className="h-8 relative">
              <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-8">
                <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                  fill="rgba(255, 255, 255, 0.03)"></path>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Círculos decorativos inferiores */}
        <div className="absolute -bottom-5 right-20 w-24 h-3 bg-gray-500/10 rounded-full"></div>
        <div className="absolute -bottom-8 right-10 w-16 h-3 bg-gray-400/10 rounded-full"></div>
      </div>
    </div>
  );
}