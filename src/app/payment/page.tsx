// 📁 CAMINHO: src/app/payment/page.tsx
// 🎯 FUNÇÃO: Página principal de pagamento com integração às telas de sucesso/erro
// 📝 DESCRIÇÃO: Fluxo completo de pagamento com simulação e redirecionamento automático

'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Shield } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import PaymentMethods from './components/PaymentMethods'
import PaymentForm from './components/PaymentForm'
import PaymentSummary from './components/PaymentSummary'
import PaymentConfirmation from './components/PaymentConfirmation'
import { paymentService } from '@/services/paymentService'

// Configuração do Supabase (ajustar conforme necessário)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Interface para dados do plano selecionado
interface PlanData {
  id: 'premium' | 'vip'
  name: string
  price: number
  description: string
}

// Interface para método de pagamento selecionado
interface SelectedPaymentMethod {
  id: 'mpesa' | 'paypal'
  name: string
  description: string
}

/**
 * Página principal de pagamento
 * Gerencia todo o fluxo de pagamento e integra com telas de sucesso/erro
 */
export default function PaymentPage() {
  // Hooks para navegação
  const router = useRouter()
  const searchParams = useSearchParams()

  // Estados de autenticação
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Estados do fluxo de pagamento
  const [currentStep, setCurrentStep] = useState<'methods' | 'form' | 'confirmation'>('methods')
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<SelectedPaymentMethod | null>(null)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          setIsAuthenticated(true)
        } else {
          // Redirecionar para login se não autenticado
          router.push('/login?redirect=/payment')
          return
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        router.push('/login?redirect=/payment')
        return
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Carregar dados do plano a partir dos parâmetros da URL
  useEffect(() => {
    const planId = searchParams.get('plan') as 'premium' | 'vip'
    const planPrice = searchParams.get('price')
    const planName = searchParams.get('name')

    // Definir planos padrão se não vier nos parâmetros
    const defaultPlans = {
      premium: { name: 'Premium', price: 199, description: 'Para verdadeiros amantes da música moçambicana' },
      vip: { name: 'VIP', price: 399, description: 'Experiência completa e exclusiva da cultura musical' }
    }

    if (planId && (planId === 'premium' || planId === 'vip')) {
      const planData: PlanData = {
        id: planId,
        name: planName || defaultPlans[planId].name,
        price: planPrice ? parseInt(planPrice) : defaultPlans[planId].price,
        description: defaultPlans[planId].description
      }
      setSelectedPlan(planData)
    } else {
      // Se não há parâmetros válidos, usar plano premium como padrão
      const planData: PlanData = {
        id: 'premium',
        name: defaultPlans.premium.name,
        price: defaultPlans.premium.price,
        description: defaultPlans.premium.description
      }
      setSelectedPlan(planData)
    }
  }, [searchParams])

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

  // ✅ HANDLER PRINCIPAL - INTEGRADO COM TELAS DE SUCESSO/ERRO
  const handlePaymentProcess = async () => {
    if (!selectedPlan || !selectedMethod || !paymentData || !user) return

    setIsProcessing(true)

    try {
      console.log('🚀 Iniciando processamento de pagamento...', {
        plan: selectedPlan.name,
        method: selectedMethod.id,
        user: user.email
      })

      // Preparar dados para o serviço de pagamento
      const paymentProcessData = {
        method: selectedMethod.id,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        userEmail: user.email!,
        formData: paymentData
      }

      // Validar dados antes do processamento
      const validation = paymentService.validatePaymentData(paymentProcessData)
      
      if (!validation.isValid) {
        console.error('❌ Validação falhou:', validation.errors)
        
        // Construir URL de erro para validação
        const errorParams = new URLSearchParams({
          errorCode: 'VALIDATION_ERROR',
          errorMessage: validation.errors.join(', '),
          method: selectedMethod.id,
          planName: selectedPlan.name,
          planPrice: selectedPlan.price.toString()
        })

        router.push(`/payment/error?${errorParams.toString()}`)
        return
      }

      console.log('✅ Dados validados, processando pagamento...')

      // Processar pagamento através do serviço
      const redirectUrl = await paymentService.processPayment(paymentProcessData)
      
      console.log('🎯 Redirecionando para:', redirectUrl)

      // Redirecionar para a URL retornada (sucesso ou erro)
      router.push(redirectUrl)

    } catch (error: any) {
      console.error('💥 Erro no processamento do pagamento:', error)
      
      // Redirecionar para tela de erro genérico
      const errorParams = new URLSearchParams({
        errorCode: 'UNEXPECTED_ERROR',
        errorMessage: error.message || 'Erro inesperado. Tenta novamente.',
        method: selectedMethod?.id || 'unknown',
        planName: selectedPlan?.name || 'Plano',
        planPrice: selectedPlan?.price?.toString() || '0'
      })

      router.push(`/payment/error?${errorParams.toString()}`)
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

      {/* Botão de teste rápido (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 space-y-2">
          <button
            onClick={async () => {
              const result = await paymentService.testPayment('mpesa')
              console.log('Teste M-Pesa:', result)
              router.push(result)
            }}
            className="block w-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded text-white text-sm"
          >
            🧪 Teste M-Pesa
          </button>
          <button
            onClick={async () => {
              const result = await paymentService.testPayment('paypal')
              console.log('Teste PayPal:', result)
              router.push(result)
            }}
            className="block w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm"
          >
            🧪 Teste PayPal
          </button>
        </div>
      )}
    </div>
  )
}