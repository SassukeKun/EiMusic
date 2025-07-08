// 📁 CAMINHO: src/app/payment/error/page.tsx
// 🎯 FUNÇÃO: Página Next.js de erro de pagamento
// 📝 DESCRIÇÃO: Recebe parâmetros da URL e renderiza o componente PaymentError

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaymentError from '../components/PaymentError'

/**
 * Página de erro de pagamento
 * Rota: /payment/error
 * 
 * Recebe parâmetros via URL:
 * - errorCode: Código do erro
 * - errorMessage: Mensagem do erro
 * - method: Método de pagamento que falhou
 * - planName: Nome do plano tentado
 * - planPrice: Preço do plano
 * - transactionId: ID da transação (opcional)
 * 
 * Arquitetura MVC:
 * - View: PaymentError component
 * - Controller: Esta página (hooks e handlers)
 * - Model: Dados do erro passados via URL params
 */
export default function PaymentErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorData, setErrorData] = useState<any>(null) // Tipagem corrigida
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extrair dados dos parâmetros da URL
    const errorCode = searchParams.get('errorCode')
    const errorMessage = searchParams.get('errorMessage')
    const method = searchParams.get('method') as 'mpesa' | 'paypal'
    const planName = searchParams.get('planName')
    const planPrice = searchParams.get('planPrice')
    const transactionId = searchParams.get('transactionId') // Opcional

    // Validar se parâmetros essenciais estão presentes
    if (errorCode && method && planName && planPrice) {
      const data = {
        errorCode,
        errorMessage: errorMessage || 'Erro desconhecido no processamento',
        method,
        planName,
        planPrice: parseInt(planPrice),
        transactionId: transactionId || undefined,
        timestamp: new Date().toLocaleDateString('pt-MZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      setErrorData(data)
      
      // Registrar evento de erro para analytics (opcional)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'exception', {
          description: `Payment failed: ${errorCode}`,
          fatal: false,
          custom_map: {
            method: method,
            plan: planName,
            error_code: errorCode
          }
        })
      }
      
    } else {
      // Se parâmetros inválidos, redirecionar para página de pagamento
      console.log('Parâmetros de erro inválidos:', {
        errorCode,
        errorMessage,
        method,
        planName,
        planPrice
      })
      router.push('/payment')
      return
    }
    
    setLoading(false)
  }, [searchParams, router])

  // Handler para tentar novamente
  const handleRetry = () => {
    // Construir URL de volta para pagamento com parâmetros do plano
    const planParam = errorData?.planName?.toLowerCase().includes('premium') ? 'premium' : 'vip'
    router.push(`/payment?plan=${planParam}`)
  }

  // Handler para voltar
  const handleGoBack = () => {
    router.back()
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Processando erro...</p>
        </div>
      </div>
    )
  }

  // Erro se não há dados de erro
  if (!errorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Erro ao carregar informações</p>
          <button 
            onClick={() => router.push('/payment')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg text-white font-medium transition-all duration-300"
          >
            Voltar ao Pagamento
          </button>
        </div>
      </div>
    )
  }

  return (
    <PaymentError 
      errorData={errorData}
      onRetry={handleRetry}
      onGoBack={handleGoBack}
    />
  )
}