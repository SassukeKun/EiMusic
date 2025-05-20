'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import useAuth from '@/hooks/useAuth'
import { FaCheckCircle, FaEnvelope, FaArrowLeft } from 'react-icons/fa'

export default function VerificationPage() {
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const searchParams = useSearchParams()
  const { resendVerificationEmail, isEmailVerified } = useAuth()
  
  const email = searchParams?.get('email') || ''
  const type = searchParams?.get('type') || 'user'
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])
  
  const handleResendEmail = async () => {
    if (countdown > 0 || !email) return
    
    setLoading(true)
    try {
      const success = await resendVerificationEmail(email)
      if (success) {
        setEmailSent(true)
        setCountdown(60) // 60 segundos de espera para reenvio
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-900 to-black p-4">
      <div className="w-full max-w-md rounded-lg bg-black bg-opacity-30 p-8 shadow-lg backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-600 p-3 text-white">
            <FaEnvelope className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="mb-4 text-center text-2xl font-bold text-white">Verifique seu email</h1>
        
        <p className="mb-6 text-center text-gray-300">
          Enviamos um link de confirmação para:
          <span className="block mt-2 font-semibold text-yellow-400">{email}</span>
        </p>
        
        <div className="mb-6 rounded-md bg-gray-800 bg-opacity-50 p-4">
          <p className="text-sm text-gray-300">
            Por favor, verifique sua caixa de entrada (e pasta de spam) e clique no link de verificação 
            que enviamos para ativar sua conta.
          </p>
        </div>
        
        <div className="mb-8">
          <button 
            onClick={handleResendEmail}
            disabled={countdown > 0 || loading || !email}
            className={`w-full rounded-md py-3 px-4 font-medium transition ${
              countdown > 0 || loading || !email
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {loading ? 'Enviando...' : 
             countdown > 0 ? `Reenviar em (${countdown}s)` : 
             'Reenviar email de verificação'}
          </button>
          
          {emailSent && (
            <p className="mt-2 text-center text-sm text-green-400">
              <FaCheckCircle className="inline mr-1" /> 
              Email enviado com sucesso!
            </p>
          )}
        </div>
        
        <div className="text-center text-sm text-gray-400">
          <Link href="/login" className="flex items-center justify-center text-yellow-500 hover:text-yellow-400">
            <FaArrowLeft className="mr-1" /> Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
} 