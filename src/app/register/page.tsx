// src/app/register/page.tsx
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

// Schema para validação do formulário
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, registerArtist, loginWithOAuth, loading, error } = useAuth();
  const [userType, setUserType] = useState<'user' | 'artist'>('user');
  const [authError, setAuthError] = useState<string | null>(error);

  // Configuração do React Hook Form com Zod
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  // Handler para registro
  const onSubmit = async (data: RegisterFormData) => {
    setAuthError(null);
    
    try {
      if (userType === 'artist') {
        const result = await registerArtist({
          name: data.name,
          email: data.email,
          password: data.password,
        });
        if (result && result.user) {
          console.log('Cadastro de artista bem-sucedido, redirecionando...');
          router.push('/artist/dashboard');
        } else {
          setAuthError('Falha ao criar conta de artista. Tente novamente.');
        }
      } else {
        const result = await registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
        });
        if (result && result.user) {
          console.log('Cadastro de usuário bem-sucedido, redirecionando...');
          router.push('/dashboard');
        } else {
          setAuthError('Falha ao criar conta de usuário. Tente novamente.');
        }
      }
    } catch (err: any) {
      console.error('Erro detalhado no cadastro:', err);
      if (err.message?.includes('already registered')) {
        setAuthError('Este email já está em uso. Tente fazer login ou use outro email.');
      } else {
        setAuthError(err.message || 'Falha ao realizar cadastro. Verifique os dados e tente novamente.');
      }
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
            Cadastre-se
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
              <h3 className="text-sm font-medium text-red-300">Erro no cadastro</h3>
              <p className="mt-1 text-sm text-red-200">{authError}</p>
            </div>
          )}

          {/* Formulário de Cadastro */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <motion.div>
              <motion.input
                {...register('name')}
                type="text"
                placeholder="Nome"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                whileFocus={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
              )}
            </motion.div>
            
            <motion.div>
              <motion.input
                {...register('email')}
                type="email"
                placeholder="E-mail"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                whileFocus={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </motion.div>
            
            <motion.div>
              <motion.input
                {...register('password')}
                type="password"
                placeholder="Senha"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                whileFocus={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </motion.div>
            
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition disabled:bg-green-800 disabled:opacity-70"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {loading ? 'Processando...' : 'Cadastrar'}
            </motion.button>
          </form>

          {/* Divisor "OU" */}
          <div className="my-6 flex items-center">
            <hr className="flex-grow border-gray-700" />
            <span className="mx-4 text-gray-400">OU</span>
            <hr className="flex-grow border-gray-700" />
          </div>

          {/* Botões Sociais */}
          <div className="space-y-4">
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaGoogle className="mr-2 text-xl text-red-500" />
              Cadastrar com Google
            </motion.button>
            <motion.button
              type="button"
              className="flex items-center justify-center w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaFacebook className="mr-2 text-xl text-blue-600" />
              Cadastrar com Facebook
            </motion.button>
          </div>

          {/* Link para Login */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            Já tem conta?{' '}
            <Link href="/login" className="text-green-400 hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
