// 📁 CAMINHO: src/app/payment/error/PaymentErrorClient.tsx
// 🎯 FUNÇÃO: Componente de cliente para a página de erro de pagamento
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaymentError from '../components/PaymentError'

// Definição de tipo para os dados do erro
interface PaymentErrorData {
  errorCode: string;
  errorMessage: string;
  method: 'mpesa' | 'paypal';
  planName: string;
  planPrice: number;
  transactionId?: string;
  timestamp: string;
}

// Estender a interface Window para incluir gtag
declare global {
  interface Window {
    gtag?: (type: 'event', eventName: string, eventParams: Record<string, string | boolean | Record<string, string>>) => void;
  }
}

export default function PaymentErrorClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorData, setErrorData] = useState<PaymentErrorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const errorCode = searchParams.get('errorCode')
    const errorMessage = searchParams.get('errorMessage')
    const method = searchParams.get('method') as 'mpesa' | 'paypal'
    const planName = searchParams.get('planName')
    const planPrice = searchParams.get('planPrice')
    const transactionId = searchParams.get('transactionId')

    if (errorCode && method && planName && planPrice) {
      const data: PaymentErrorData = {
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
      
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
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
      console.error('Parâmetros de erro inválidos:', {
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

  const handleRetry = () => {
    const planParam = errorData?.planName?.toLowerCase().includes('premium') ? 'premium' : 'vip'
    router.push(`/payment?plan=${planParam}`)
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>A carregar detalhes do erro...</p>
      </div>
    )
  }

  if (!errorData) {
    return null // Evita renderizar o componente de erro sem dados
  }

  return (
    <PaymentError
      errorData={errorData}
      onRetry={handleRetry}
      onGoBack={handleGoBack}
    />
  )
}
