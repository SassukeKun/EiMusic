// src/app/register/page.tsx (correção)
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

// Schema para validação do formulário
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, registerArtist,  loading, error } = useAuth();
  const [userType, setUserType] = useState<'user' | 'artist'>('user');
  const [authError, setAuthError] = useState<string | null>(error);
  const [showPassword, setShowPassword] = useState(false);

  // Configuração do React Hook Form com validação Zod
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
          console.log('Cadastro de artista bem-sucedido, aguardando verificação de email...');
          router.push('/auth/verification?email=' + encodeURIComponent(data.email) + '&type=artist');
        } else {
          setAuthError('Falha ao criar conta de artista. Tente novamente.');
        }
      } else {
        const result = await registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
          plan: "free", // Adicione esta linha se não quiser alterar o tipo
        });

        if (result && result.user) {
          console.log('Cadastro de usuário bem-sucedido, aguardando verificação de email...');
          router.push('/auth/verification?email=' + encodeURIComponent(data.email) + '&type=user');
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

  // Nota: Cadastro com Google foi removido pois essa funcionalidade já está disponível na página de login
  // e funciona tanto para cadastro quanto para login

  // Navegação programática para login
  const navigateToLogin = () => {
    router.push('/login');
  };

  // Alternar visibilidade da senha
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Efeito para animação de transição entre usuário e artista
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setAnimateContent(true);
    const timer = setTimeout(() => setAnimateContent(false), 300);
    return () => clearTimeout(timer);
  }, [userType]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4 w-full overflow-hidden">
      <div className="relative w-full max-w-md">
        {/* Elementos decorativos musicais */}
        <motion.div
          className="absolute -top-16 -left-8 w-40 h-10 rounded-full bg-gray-300/10 -rotate-12"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 -right-10 w-20 h-6 rounded-full bg-gray-400/10 rotate-12"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 6, delay: 1, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-10 left-10 w-40 h-6 rounded-full bg-gray-200/10 rotate-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 7, delay: 2, repeat: Infinity }}
        />

        {/* Notas musicais e elementos de piano decorativos */}
        <div className="absolute top-5 left-10 text-gray-300/40 text-4xl">♪</div>
        <div className="absolute bottom-1/3 right-5 text-gray-300/40 text-5xl">♫</div>
        <div className="absolute top-1/2 left-0 text-gray-300/40 text-3xl">♩</div>

        {/* Teclas de piano decorativas */}
        <div className="absolute -top-6 right-20 flex h-12">
          <div className="w-6 h-full bg-white border border-gray-200 rounded-b-md shadow-md"></div>
          <div className="w-4 h-8 bg-black -mx-2 z-10 rounded-b-md shadow-md"></div>
          <div className="w-6 h-full bg-white border border-gray-200 rounded-b-md shadow-md"></div>
          <div className="w-4 h-8 bg-black -mx-2 z-10 rounded-b-md shadow-md"></div>
          <div className="w-6 h-full bg-white border border-gray-200 rounded-b-md shadow-md"></div>
        </div>

        {/* Card principal com forma não retangular */}
        <motion.div
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl 
                    border border-gray-700 overflow-hidden"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 95%, 90% 100%, 10% 100%, 0% 95%)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="relative">
            {/* Barra de ritmo decorativa diagonal */}
            <div className="absolute top-0 left-0 w-full h-20 overflow-hidden">
              <div className="absolute top-0 -left-10 w-[120%] h-16 bg-gradient-to-r from-gray-700 via-indigo-700 to-gray-700 -rotate-3"></div>
            </div>

            {/* Conteúdo principal */}
            <div className={`relative pt-20 pb-10 px-8 ${animateContent ? 'animate-pulse' : ''}`}>
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <Image src="/musicSS.svg" alt="Logo" width={100} height={100} priority className="rounded-full p-2 bg-gray-800/50" />
              </div>

              {/* Título */}
              <h1 className={`text-3xl font-bold ${userType === 'artist' ? 'text-indigo-300' : 'text-gray-100'} text-center mb-2`}>
                {userType === 'artist' ? 'Área do Artista' : 'Cadastre-se'}
              </h1>
              <p className="text-gray-400 text-center mb-6">
                {userType === 'artist' ? 'Cadastre-se como criador' : 'Cadastre-se como ouvinte'}
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
                  <h3 className="text-sm font-medium text-red-200">Erro</h3>
                  <p className="mt-1 text-sm text-gray-300">{authError}</p>
                </div>
              )}

              {/* Formulário de cadastro */}
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Campo Nome */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">👤</span>
                  </div>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-800/80 text-white placeholder-gray-500
             border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 
             focus:border-indigo-600/50 transition"
                    placeholder={userType === 'artist' ? "Seu nome artístico" : "Seu nome"}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}

                </div>

                {/* Campo Email */}
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

                {/* Campo Senha */}
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

                {/* Botão de cadastro */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-indigo-700 hover:bg-indigo-600
                          text-white font-semibold shadow transition 
                          disabled:bg-indigo-900 disabled:opacity-70"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loading ? 'Processando...' : 'Cadastrar'}
                </motion.button>
              </form>

              {/* Botão do Google foi removido pois essa funcionalidade já está disponível na página de login */}

              {/* Link para Login - CORRIGIDO */}
              <p className="mt-6 text-center text-gray-500 text-sm relative z-20">
                Já tem uma conta?{' '}
                <button
                  onClick={navigateToLogin}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none p-0 cursor-pointer font-medium"
                >
                  Entrar
                </button>
              </p>
            </div>

            {/* Elemento decorativo inferior */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden h-16">
              <div className="absolute bottom-0 -right-5 h-32 w-32 bg-gray-700/10 rounded-full"></div>
              <div className="absolute bottom-5 left-10 h-20 w-20 bg-gray-600/10 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        {/* Elementos de equalização decorativos */}
        <div className="absolute -bottom-10 left-1/4 flex space-x-1 h-10">
          <div className="w-2 h-4 bg-gray-500/20 rounded-t-full"></div>
          <div className="w-2 h-8 bg-gray-500/20 rounded-t-full"></div>
          <div className="w-2 h-6 bg-gray-500/20 rounded-t-full"></div>
          <div className="w-2 h-10 bg-gray-500/20 rounded-t-full"></div>
          <div className="w-2 h-5 bg-gray-500/20 rounded-t-full"></div>
          <div className="w-2 h-7 bg-gray-500/20 rounded-t-full"></div>
        </div>
      </div>
    </div>
  );
}