// 📁 CAMINHO: src/app/payment/success/page.tsx
// 🎯 FUNÇÃO: Página Next.js de confirmação de pagamento bem-sucedido
// 📝 DESCRIÇÃO: Recebe parâmetros da URL e renderiza o componente PaymentSuccess

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaymentSuccess from '../components/PaymentSuccess'

/**
 * Página de confirmação de pagamento bem-sucedido
 * Rota: /payment/success
 * 
 * Recebe parâmetros via URL:
 * - transactionId: ID da transação
 * - method: Método de pagamento usado
 * - planName: Nome do plano adquirido
 * - planPrice: Preço do plano
 * - userEmail: Email do usuário
 * 
 * Arquitetura MVC:
 * - View: PaymentSuccess component
 * - Controller: Esta página (hooks e handlers)
 * - Model: Dados passados via URL params
 */
export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null) // Tipagem corrigida
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Extrair dados dos parâmetros da URL
    const transactionId = searchParams.get('transactionId')
    const method = searchParams.get('method') as 'mpesa' | 'paypal'
    const planName = searchParams.get('planName')
    const planPrice = searchParams.get('planPrice')
    const userEmail = searchParams.get('userEmail')

    // Validar se todos os parâmetros necessários estão presentes
    if (transactionId && method && planName && planPrice && userEmail) {
      const data = {
        transactionId,
        method,
        planName,
        planPrice: parseInt(planPrice),
        userEmail,
        activationDate: new Date().toLocaleDateString('pt-MZ', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      
      setPaymentData(data)
      
      // Registrar evento de conversão para analytics (opcional)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          transaction_id: transactionId,
          value: parseInt(planPrice),
          currency: 'MZN',
          items: [{
            item_id: method,
            item_name: planName,
            category: 'subscription',
            quantity: 1,
            price: parseInt(planPrice)
          }]
        })
      }
      
    } else {
      // Se parâmetros inválidos, redirecionar para home
      console.error('Parâmetros de pagamento inválidos:', {
        transactionId,
        method,
        planName,
        planPrice,
        userEmail
      })
      router.push('/')
      return
    }
    
    setLoading(false)
  }, [searchParams, router])

  // Handler para continuar (ir para home)
  const handleContinue = () => {
    router.push('/')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Confirmando pagamento...</p>
        </div>
      </div>
    )
  }

  // Erro se não há dados de pagamento
  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Erro ao carregar dados do pagamento</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-2 rounded-lg text-white font-medium transition-all duration-300"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  return (
    <PaymentSuccess 
      paymentData={paymentData}
      onContinue={handleContinue}
    />
  )
}