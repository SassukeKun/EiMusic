// src/app/login/page.tsx
'use client'// ← isto TEM de vir antes de *todos* os imports

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaGoogle } from 'react-icons/fa'

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
  
  // Checar erros nos parâmetros da URL
  useEffect(() => {
    if (searchParams) {
      const errorParam = searchParams.get('error');
      if (errorParam) {
        const errorMessages: Record<string, string> = {
          'auth_callback_error': 'Erro ao processar autenticação. Tente novamente.',
          'no_session': 'Sessão não encontrada. Tente fazer login novamente.',
          'callback_processing': 'Erro ao processar callback de autenticação.',
        };
        
        setAuthError(errorMessages[errorParam] || 'Erro ao processar autenticação.');
      }
    }
  }, [searchParams]);
  
  // Configuração do React Hook Form com Zod
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Handler para login
  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    
    try {
      if (userType === 'artist') {
        const result = await loginArtist(data.email, data.password);
        if (result) {
          console.log('Login de artista bem-sucedido, redirecionando...');
          router.replace('/artist/dashboard'); // changed from push to replace
        } else {
          setAuthError('Credenciais inválidas ou conta de artista não encontrada');
        }
      } else {
        const result = await loginUser(data.email, data.password);
        if (result) {
          console.log('Login de usuário bem-sucedido, redirecionando...');
          router.replace('/'); // changed from push to replace
        } else {
          setAuthError('Credenciais inválidas ou conta de usuário não encontrada');
        }
      }
    } catch (err: any) {
      console.error('Erro detalhado de login:', err);
      setAuthError(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    await loginWithOAuth('google');
  };

  return (
    <div className="
      flex items-center justify-center min-h-screen
      bg-gradient-to-br from-[#006600] via-[#FFDF00] to-[#FF0000]
      px-4 sm:px-6 lg:px-8
    ">
      <motion.div
        className="p-1 bg-gradient-to-br from-[#FF0000] via-[#000000] to-[#006600] rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="
          bg-gradient-to-br from-black/80 to-green-900/60
          backdrop-blur-lg
          border border-white/20
          rounded-xl
          p-8 sm:p-10 lg:p-12
          w-full max-w-xs sm:max-w-sm md:max-w-md
        ">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/musicSS.svg" alt="Logo" width={100} height={100} priority />
          </div>

          {/* Título */}
          <h1 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8">
            Entre na sua conta
          </h1>
          
          {/* Botões de alternância entre usuário e artista */}
          <div className="flex rounded-md shadow-sm justify-center mb-6">
            <button
              type="button"
              onClick={() => setUserType('user')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                userType === 'user'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
            >
              Usuário
            </button>
            <button
              type="button"
              onClick={() => setUserType('artist')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                userType === 'artist'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
              }`}
            >
              Artista
            </button>
          </div>
          
          {/* Exibir mensagens de erro */}
          {authError && (
            <div className="rounded-md bg-red-900/50 p-4 mb-4 border border-red-500">
              <h3 className="text-sm font-medium text-red-300">Erro de autenticação</h3>
              <p className="mt-1 text-sm text-red-200">{authError}</p>
            </div>
          )}
          
          {/* Formulário de login */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <motion.div>
              <motion.input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Email"
                whileFocus={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </motion.div>
            
            <motion.div>
              <motion.input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Senha"
                whileFocus={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </motion.div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-green-400 hover:underline">
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition disabled:bg-green-800 disabled:opacity-70"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>
          
          {/* Divisor "OU" */}
          <div className="my-6 flex items-center">
            <hr className="flex-grow border-gray-700" />
            <span className="mx-4 text-gray-400">OU</span>
            <hr className="flex-grow border-gray-700" />
          </div>
          
          {/* Botão do Google */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <FaGoogle className="mr-2 text-xl text-red-500" />
            Entrar com Google
          </motion.button>
          
          {/* Link para Registro */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-green-400 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
