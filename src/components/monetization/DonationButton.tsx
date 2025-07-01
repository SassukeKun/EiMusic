// src/components/monetization/DonationButton.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGift, FaHeart } from 'react-icons/fa'

interface DonationButtonProps {
  artistId: string
  artistName: string
  trackId?: string
  variant?: 'primary' | 'secondary' | 'compact'
  className?: string
  onSuccess?: (amount: number) => void
}

export default function DonationButton({
  artistId,
  artistName,
  trackId,
  variant = 'primary',
  className = '',
  onSuccess
}: DonationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleClick = () => {
    // Simular ação de doação
    setIsLoading(true)
    
    // Simular loading
    setTimeout(() => {
      setIsLoading(false)
      alert(`Funcionalidade de apoio ao ${artistName} em breve!`)
      if (onSuccess) {
        onSuccess(25) // Valor demo
      }
    }, 1000)
  }
  
  const variants = {
    primary: 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-full font-semibold',
    secondary: 'bg-gray-800 hover:bg-gray-700 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg',
    compact: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-2 rounded-lg'
  }
  
  return (
    <motion.button
      onClick={handleClick}
      disabled={isLoading}
      className={`${variants[variant]} transition-all duration-200 flex items-center ${className} ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      whileHover={{ scale: variant === 'compact' ? 1.1 : 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Carregando...
        </div>
      ) : variant === 'compact' ? (
        <FaGift />
      ) : (
        <>
          <FaHeart className="mr-2" />
          {variant === 'primary' ? 'Apoiar Artista' : 'Apoiar'}
        </>
      )}
    </motion.button>
  )
}