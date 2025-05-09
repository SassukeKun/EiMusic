// src/app/login/page.tsx
'use client'                                    // ← isto TEM de vir antes de *todos* os imports

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'

// Schema para validação do formulário
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Configuração do React Hook Form com Zod
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  // Função para lidar com o login
  const onSubmit = async (data: LoginFormData) => {
    try {
      setAuthError(null);
      // Chamada para o serviço de autenticação via hook
      await login({ 
        email: data.email, 
        password: data.password 
      });
      
      // Redirecionar após login bem-sucedido
      router.push('/');
    } catch (err: Error | unknown) {
      // Capturar e exibir erros de autenticação
      let errorMessage = 'Erro ao fazer login';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setAuthError(errorMessage);
    }
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
            Bem-vindo
          </h1>

          {/* Formulário */}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* Mensagem de erro de autenticação */}
            {authError && (
              <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded">
                {authError}
              </div>
            )}
            
            <div>
              <motion.input
                {...register('email')}
                type="email"
                placeholder="E-mail"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                whileFocus={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
              {errors.email && (
                <p className="mt-1 text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <motion.input
                {...register('password')}
                type="password"
                placeholder="Senha"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                whileFocus={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              />
              {errors.password && (
                <p className="mt-1 text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>
            
            <div className="text-right">
              <a href="#" className="text-green-400 hover:underline">
                Esqueceu sua senha?
              </a>
            </div>
            
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition disabled:opacity-50"
              whileHover={{ scale: isLoading ? 1 : 1.05 }}
              whileTap={{ scale: isLoading ? 1 : 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
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
              className="flex items-center justify-center w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaGoogle className="mr-2 text-xl text-red-500" />
              Login com Google
            </motion.button>
            <motion.button
              type="button"
              className="flex items-center justify-center w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <FaFacebook className="mr-2 text-xl text-blue-600" />
              Login com Facebook
            </motion.button>
          </div>

          {/* Link de Cadastro */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            Não tem conta?{' '}
            <a href="/register" className="text-green-400 hover:underline">
              Cadastre-se
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
