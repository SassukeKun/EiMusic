// src/components/monetization/SupportModal.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaHeart, FaGift, FaCrown, FaGem } from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'
import { getSupabaseBrowserClient } from '@/utils/supabaseClient'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  artist: {
    id: string
    name: string
    profile_image_url?: string
  }
  onSuccess: (amount: number) => void
}

const supportOptions = [
  {
    amount: 5,
    icon: <FaHeart />,
    label: 'Gostei!',
    color: 'bg-green-500',
    description: 'Um pequeno apoio'
  },
  {
    amount: 15,
    icon: <FaGift />,
    label: 'Muito bom!',
    color: 'bg-blue-500',
    description: 'Reconhecimento pela qualidade'
  },
  {
    amount: 30,
    icon: <FaCrown />,
    label: 'Excelente!',
    color: 'bg-purple-500',
    description: 'Trabalho excepcional'
  },
  {
    amount: 50,
    icon: <FaGem />,
    label: 'Fã número 1!',
    color: 'bg-yellow-500',
    description: 'Apoio total ao artista'
  }
]

export default function SupportModal({ isOpen, onClose, artist, onSuccess }: SupportModalProps) {
  const { user, isAuthenticated } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select')

  const handleSupport = async (amount: number) => {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    // Validação número M-Pesa de Moçambique: começa com 84 ou 85 e possui 9 dígitos
    if (!/^(84|85)\d{7}$/.test(phone)) {
      setPhoneError('Número inválido. Deve iniciar com 84 ou 85 e ter 9 dígitos.')
      return
    }
    setPhoneError('')
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      alert('Faça login para apoiar artistas')
      return
    }

    setIsLoading(true)
    
    try {
      // Chama API de pagamento
      const res = await fetch('/api/payments/donation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({ artistId: artist.id, amount, phone })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro no pagamento')
      if (data.status === 'COMPLETED') {
        onSuccess(amount)
        setStep('success')
      } else {
        alert('Pagamento iniciado. Conclua no seu telemóvel.')
        onSuccess(amount)
        setStep('success')
      }
      
      // Close modal after showing success
      setTimeout(() => {
        onClose()
        setStep('select')
        setSelectedAmount(null)
        setCustomAmount('')
        setMessage('')
      }, 2000)
      
    } catch (error) {
      console.log('Erro no apoio:', error)
      alert('Erro ao processar apoio. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getFinalAmount = () => {
    if (selectedAmount) return selectedAmount
    return parseInt(customAmount) || 0
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          className="relative bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-700"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {step === 'success' ? 'Apoio Enviado!' : `Apoiar ${artist.name}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition p-1"
            >
              <FaTimes />
            </button>
          </div>

          {step === 'select' && (
            <>
              {/* Artist Info */}
              <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-800 rounded-lg">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  {artist.profile_image_url ? (
                    <img src={artist.profile_image_url} alt={artist.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {artist.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{artist.name}</h3>
                  <p className="text-sm text-gray-400">Artista Moçambicano</p>
                </div>
              </div>

              {/* Support Options */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {supportOptions.map((option) => (
                  <motion.button
                    key={option.amount}
                    onClick={() => {
                      setSelectedAmount(option.amount)
                      setCustomAmount('')
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedAmount === option.amount
                        ? 'border-indigo-500 bg-indigo-500/20'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center text-white mb-2 mx-auto`}>
                      {option.icon}
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-white">{option.amount} MT</div>
                      <div className="text-xs text-gray-400">{option.label}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor personalizado
                </label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                  placeholder="Insira o valor em MT"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensagem (opcional) +5 MT
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={50}
                  placeholder="Deixe uma mensagem para o artista..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  rows={2}
                />
                <div className="text-xs text-gray-400 mt-1">
                  {message.length}/50 caracteres
                </div>
              </div>

              {/* Total */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Apoio:</span>
                  <span className="text-white">{getFinalAmount()} MT</span>
                </div>
                {message && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Mensagem:</span>
                    <span className="text-white">+5 MT</span>
                  </div>
                )}
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-white">Total:</span>
                    <span className="text-green-400">{getFinalAmount() + (message ? 5 : 0)} MT</span>
                  </div>
                </div>
              </div>

              {/* Telefone M-Pesa */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Número M-Pesa</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\s/g, ''))}
                  placeholder="84xxxxxxx"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {phoneError && <p className="text-red-400 text-sm mt-2">{phoneError}</p>}
              </div>

              {/* Action Button */}
              <motion.button
                onClick={() => handleSupport(getFinalAmount() + (message ? 5 : 0))}
                disabled={getFinalAmount() < 5 || isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200"
                whileHover={{ scale: getFinalAmount() >= 5 && !isLoading ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  `Apoiar com ${getFinalAmount() + (message ? 5 : 0)} MT`
                )}
              </motion.button>

              {getFinalAmount() < 5 && (
                <p className="text-red-400 text-sm text-center mt-2">
                  Valor mínimo: 5 MT
                </p>
              )}
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <motion.div
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <FaHeart className="text-white text-2xl" />
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">
                Obrigado pelo apoio!
              </h3>
              <p className="text-gray-400">
                Seu apoio significa muito para {artist.name}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}