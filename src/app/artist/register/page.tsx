// src/app/artist/register/page.tsx
'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function ArtistRegisterPage() {
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
            Cadastro Artista
          </h1>

          {/* Formulário de Registro */}
          <form className="space-y-4">
            <motion.input
              type="text"
              placeholder="Nome completo"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            />
            <motion.input
              type="text"
              placeholder="Nome artístico"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            />
            <motion.input
              type="email"
              placeholder="E-mail"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            />
            <motion.input
              type="password"
              placeholder="Senha"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            />
            <motion.input
              type="password"
              placeholder="Confirmar senha"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              whileFocus={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            />
            <motion.button
              type="submit"
              className="w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Cadastrar Artista
            </motion.button>
          </form>

          {/* Link para login de artista */}
          <p className="mt-6 text-center text-gray-400 text-sm">
            Já possui conta?{' '}
            <a href="/artist/login" className="text-green-400 hover:underline">
              Entrar como Artista
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
