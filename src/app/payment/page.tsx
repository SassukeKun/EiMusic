'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getSupabaseBrowserClient } from '@/utils/supabaseClient'
import PaymentMethods from './components/PaymentMethods'
import PaymentForm from './components/PaymentForm'
import PaymentSummary from './components/PaymentSummary'
import PaymentConfirmation from './components/PaymentConfirmation'

// Interface para dados do plano selecionado
interface PlanData {
  id: 'premium' | 'vip'
  name: string
  price: number
  description: string
}

// Interface para método de pagamento selecionado (versão simplificada)
interface SelectedPaymentMethod {
  id: 'mpesa' | 'paypal'
  name: string
  description: string
}

/**
 * Página principal de pagamento
 * Recebe parâmetros do PlansModal e gerencia todo o fluxo de pagamento
 */
export default function PaymentPage() {
  // Hooks para navegação e autenticação
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, loading } = useAuth()

  // Estados do fluxo de pagamento
  const [currentStep, setCurrentStep] = useState<'methods' | 'form' | 'confirmation'>('methods')
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<SelectedPaymentMethod | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Efeito para carregar dados do plano a partir dos parâmetros da URL
  useEffect(() => {
    const planId = searchParams.get('plan') as 'premium' | 'vip'
    const planPrice = searchParams.get('price')
    const planName = searchParams.get('name')

    // Validar se todos os parâmetros necessários estão presentes
    if (planId && planPrice && planName) {
      const planData: PlanData = {
        id: planId,
        name: planName,
        price: parseInt(planPrice),
        description: planId === 'premium' 
          ? 'Para verdadeiros amantes da música moçambicana'
          : 'Experiência completa e exclusiva da cultura musical'
      }
      setSelectedPlan(planData)
    } else {
      // Se não há parâmetros válidos, redirecionar para home
      router.push('/')
    }
  }, [searchParams, router])

  // Handler para voltar à página anterior
  const handleGoBack = () => {
    if (currentStep === 'methods') {
      router.back()
    } else if (currentStep === 'form') {
      setCurrentStep('methods')
      setSelectedMethod(null)
    } else if (currentStep === 'confirmation') {
      setCurrentStep('form')
    }
  }

  // Handler para seleção de método de pagamento
  const handleMethodSelect = (method: any) => {
    // Converter do formato completo para o formato simplificado
    const selectedMethodData: SelectedPaymentMethod = {
      id: method.id,
      name: method.name,
      description: method.description
    }
    setSelectedMethod(selectedMethodData)
    setCurrentStep('form')
  }

  // Handler para submissão do formulário de pagamento
  const handleFormSubmit = (data: any) => {
    setPaymentData(data)
    setCurrentStep('confirmation')
  }

  // Handler para processamento final do pagamento
  const handlePaymentProcess = async () => {
    if (!selectedPlan || !selectedMethod) return

    setIsProcessing(true)

    try {
      // Se o utilizador escolheu M-Pesa, seguir o fluxo real via API
      if (selectedMethod.id === 'mpesa') {
        // Gera um UUID para identificar esta assinatura como sourceId
        // Código de referência visível ao utilizador e usado na transação
        const referenceCode = `EM${Date.now().toString().slice(-8)}`;

        // Iniciar pagamento no backend
        const supabase = getSupabaseBrowserClient();
        // Timeout de 110 s para alinhar com backend (120 s)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 110000);
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        const initRes = await fetch('/api/payments/initiate', {
          signal: controller.signal,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({
            amount: selectedPlan.price,
            phone: paymentData.phoneNumber.replace(/\D/g, ''),
            sourceType: 'subscription',
            planId: selectedPlan.id,
            reference: referenceCode,
          }),
        })

        clearTimeout(timeout);
            const initJson = await initRes.json()
        if (!initRes.ok) {
          throw new Error(initJson.error || 'Falha ao iniciar pagamento')
        }

        let status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED' = initJson.status
        const paymentId = initJson.paymentId

        // Polling até estado final
        const poll = async () => {
          const res = await fetch(`/api/payments/${paymentId}/status`)
          const json = await res.json()
          if (res.ok) return json.status
          throw new Error(json.error || 'Erro ao consultar status')
        }

        // Esperar até completar ou falhar
        const POLL_INTERVAL_MS = 5000; // ajuste livre
          const MAX_WAIT_MS = 120_000; // 2 min
          let waited = 0
        let attempts = 0
        while (status === 'PENDING' && waited < MAX_WAIT_MS) {
            await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
            waited += POLL_INTERVAL_MS;
            status = await poll();
          }

        if (status === 'COMPLETED') {
          router.push(`/payment/success?plan=${selectedPlan.id}`)
        } else {
          router.push('/payment?error=payment_failed')
        }
      } else {
        // Outros métodos mantêm simulação local
        await new Promise(resolve => setTimeout(resolve, 2500))
        router.push(`/payment/success?plan=${selectedPlan.id}`)
      }
    } catch (err) {
      console.log(err)
      alert('Ocorreu um erro ao processar o pagamento. Tenta novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Loading state enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirecionar se não estiver autenticado
  if (!isAuthenticated) {
    router.push('/login?redirect=/payment')
    return null
  }

  // Redirecionar se não há plano selecionado
  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Plano não encontrado</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Linha gradiente no topo */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-yellow-500 to-green-500"></div>
      
      {/* Header com navegação */}
      <header className="border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </motion.button>
              
              <div className="h-6 w-px bg-gray-600"></div>
              
              <div>
                <h1 className="text-xl font-bold text-white">Pagamento Seguro</h1>
                <p className="text-gray-400 text-sm">Plano {selectedPlan.name} - {selectedPlan.price} MT/mês</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-green-400">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Pagamento Protegido</span>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna principal - Fluxo de pagamento */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
              
              {/* Indicador de progresso */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm font-medium ${currentStep === 'methods' ? 'text-purple-400' : 'text-gray-400'}`}>
                    1. Método de Pagamento
                  </span>
                  <span className={`text-sm font-medium ${currentStep === 'form' ? 'text-purple-400' : 'text-gray-400'}`}>
                    2. Dados de Pagamento
                  </span>
                  <span className={`text-sm font-medium ${currentStep === 'confirmation' ? 'text-purple-400' : 'text-gray-400'}`}>
                    3. Confirmação
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: '33%' }}
                    animate={{ 
                      width: currentStep === 'methods' ? '33%' : 
                             currentStep === 'form' ? '66%' : '100%' 
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                  />
                </div>
              </div>

              {/* Renderização condicional baseada no step atual */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 'methods' && (
                  <PaymentMethods
                    onMethodSelect={handleMethodSelect}
                    selectedMethod={selectedMethod}
                  />
                )}

                {currentStep === 'form' && selectedMethod && (
                  <PaymentForm
                    method={selectedMethod}
                    planData={selectedPlan}
                    onSubmit={handleFormSubmit}
                    onBack={() => setCurrentStep('methods')}
                  />
                )}

                {currentStep === 'confirmation' && selectedMethod && paymentData && (
                  <PaymentConfirmation
                    planData={selectedPlan}
                    method={selectedMethod}
                    paymentData={paymentData}
                    onConfirm={handlePaymentProcess}
                    onBack={() => setCurrentStep('form')}
                    isProcessing={isProcessing}
                  />
                )}
              </motion.div>
            </div>
          </div>

          {/* Sidebar - Resumo do pedido */}
          <div className="lg:col-span-1">
            <PaymentSummary
              planData={selectedPlan}
              method={selectedMethod}
              currentStep={currentStep}
            />
          </div>
        </div>
      </main>
    </div>
  )
}