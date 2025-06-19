'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, 
  Gem, 
  CheckCircle2,
  ArrowLeft,
  Shield,
  Smartphone,
  Building2,
  CreditCard,
  Clock,
  Zap,
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react'

// Interface para dados do plano
interface PlanData {
  id: 'premium' | 'vip'
  name: string
  price: number
  description: string
}

// Interface para método de pagamento (versão simplificada)
interface PaymentMethod {
  id: 'mpesa' | 'paypal'
  name: string
  description: string
}

// Interface para props do componente
interface PaymentConfirmationProps {
  planData: PlanData
  method: PaymentMethod
  paymentData: any
  onConfirm: () => void
  onBack: () => void
  isProcessing: boolean
}

/**
 * Componente de confirmação de pagamento
 * Tela final para revisar e confirmar o pagamento
 */
export default function PaymentConfirmation({ 
  planData, 
  method, 
  paymentData, 
  onConfirm, 
  onBack, 
  isProcessing 
}: PaymentConfirmationProps) {

  // Estados para animações e feedback
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)

  // Simular steps do processamento
  useEffect(() => {
    if (isProcessing) {
      const steps = [
        'Validando dados...',
        'Conectando ao gateway...',
        'Processando pagamento...',
        'Ativando assinatura...'
      ]
      
      let currentStep = 0
      const interval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++
          setProcessingStep(currentStep)
        } else {
          clearInterval(interval)
        }
      }, 600)
      
      return () => clearInterval(interval)
    }
  }, [isProcessing])

  // Calcular taxas e total
  const calculateFees = () => {
    switch (method.id) {
      case 'mpesa':
        return 0
      case 'paypal':
        return Math.round(planData.price * 0.035)
      default:
        return 0
    }
  }

  const fees = calculateFees()
  const totalAmount = planData.price + fees

  // Gerar código de referência mock
  const referenceCode = `EM${Date.now().toString().slice(-6)}`

  // Handler para copiar código de referência
  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(referenceCode)
      setShowCopiedFeedback(true)
      setTimeout(() => setShowCopiedFeedback(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  // Renderizar dados específicos do método
  const renderMethodSpecificData = () => {
    switch (method.id) {
      case 'mpesa':
        return (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <h4 className="text-emerald-400 font-semibold mb-3 flex items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              Detalhes M-Pesa
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Número:</span>
                <span className="text-gray-300 font-mono">{paymentData.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor:</span>
                <span className="text-emerald-400 font-bold">{totalAmount} MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Código de Referência:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-300 font-mono">{referenceCode}</span>
                  <button
                    onClick={handleCopyReference}
                    className="text-green-400 hover:text-green-300 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-emerald-500/5 rounded border border-emerald-500/10">
              <p className="text-emerald-400 text-xs font-medium mb-1">📱 Instruções:</p>
              <ol className="text-gray-300 text-xs space-y-1 list-decimal list-inside">
                <li>Receberás um SMS para confirmar o pagamento</li>
                <li>Insere o código {referenceCode} quando solicitado</li>
                <li>Confirma o pagamento de {totalAmount} MT</li>
                <li>A tua assinatura será ativada automaticamente</li>
              </ol>
            </div>
          </div>
        )

      case 'paypal':
        return (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
              <div className="w-8 h-6 bg-white rounded-sm flex items-center justify-center mr-2">
                <span className="text-blue-600 text-xs font-bold">VISA</span>
              </div>
              Detalhes {paymentData.paymentType === 'visa' ? 'Visa' : 'PayPal'}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-gray-300">{paymentData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Método:</span>
                <span className="text-gray-300">{paymentData.paymentType === 'visa' ? 'Cartão Visa' : 'PayPal'}</span>
              </div>
              {paymentData.paymentType === 'visa' && paymentData.cardNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Cartão:</span>
                  <span className="text-gray-300 font-mono">****{paymentData.cardNumber?.slice(-4)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Valor (USD):</span>
                <span className="text-gray-300">${(planData.price / 65).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Taxa conversão:</span>
                <span className="text-gray-300">{fees} MT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total (MT):</span>
                <span className="text-blue-400 font-bold">{totalAmount} MT</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-500/5 rounded border border-blue-500/10">
              <p className="text-blue-400 text-xs font-medium mb-1">🌍 Pagamento Internacional:</p>
              <p className="text-gray-300 text-xs">
                Processamento seguro via {paymentData.paymentType === 'visa' ? 'Visa' : 'PayPal'}. 
                Taxa de conversão incluída. Cobrança aparecerá como "EiMusic Subscription" no extrato.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Renderizar tela de processamento
  if (isProcessing) {
    const processingSteps = [
      'Validando dados...',
      'Conectando ao gateway...',
      'Processando pagamento...',
      'Ativando assinatura...'
    ]

    return (
      <div className="space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
            />
          </motion.div>
          
          <h3 className="text-2xl font-bold text-white mb-2">
            Processando Pagamento
          </h3>
          <p className="text-gray-400">
            Por favor, aguarda enquanto processamos a tua assinatura
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <div className="space-y-4">
            {processingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: index <= processingStep ? 1 : 0.3,
                  x: 0 
                }}
                transition={{ delay: index * 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index < processingStep ? 'bg-green-500' :
                  index === processingStep ? 'bg-purple-500' :
                  'bg-gray-600'
                }`}>
                  {index < processingStep ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : index === processingStep ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-3 h-3 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                
                <span className={`text-sm ${
                  index <= processingStep ? 'text-white' : 'text-gray-400'
                }`}>
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            ⚠️ Não feches esta página durante o processamento
          </p>
        </div>
      </div>
    )
  }

  // Tela principal de confirmação
  return (
    <div className="space-y-8">
      
      {/* Botão voltar */}
      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Editar dados</span>
        </motion.button>
      </div>

      {/* Header da confirmação */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${
            planData.id === 'premium' 
              ? 'from-yellow-400 to-orange-500' 
              : 'from-purple-500 to-pink-500'
          } flex items-center justify-center`}
        >
          {planData.id === 'premium' ? 
            <Crown className="w-10 h-10 text-white" /> : 
            <Gem className="w-10 h-10 text-white" />
          }
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Confirmar Assinatura
        </h2>
        <p className="text-gray-400">
          Revisa os detalhes antes de finalizar o pagamento
        </p>
      </div>

      {/* Resumo do plano */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Resumo do Pedido</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-700">
            <div>
              <p className="text-white font-medium">Plano {planData.name}</p>
              <p className="text-gray-400 text-sm">{planData.description}</p>
            </div>
            <span className="text-xl font-bold text-white">{planData.price} MT</span>
          </div>
          
          {fees > 0 && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-400">Taxa {method.name}</span>
              <span className="text-gray-300">{fees} MT</span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-3 border-t border-gray-600">
            <span className="text-lg font-semibold text-white">Total Mensal</span>
            <span className="text-2xl font-bold text-white">{totalAmount} MT</span>
          </div>
        </div>
      </div>

      {/* Dados do método de pagamento */}
      {renderMethodSpecificData()}

      {/* Informações importantes */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-yellow-400 font-semibold mb-2">Importante:</h4>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>A assinatura renova automaticamente todos os meses</li>
              <li>Podes cancelar a qualquer momento sem penalizações</li>
              <li>O acesso aos benefícios é ativado imediatamente após o pagamento</li>
              <li>Receberás um email de confirmação com os detalhes da assinatura</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-xl border-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white font-bold transition-all duration-300"
        >
          Editar Dados
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="flex-1 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Zap className="w-5 h-5" />
          <span>Confirmar Pagamento</span>
        </motion.button>
      </div>

      {/* Feedback de código copiado */}
      <AnimatePresence>
        {showCopiedFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">Código copiado!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer de segurança */}
      <div className="text-center pt-6 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">Pagamento 100% Seguro</span>
        </div>
        <p className="text-gray-500 text-xs">
          🔒 Dados protegidos por criptografia SSL • 🇲🇿 Suporte em Português 24/7
        </p>
      </div>
    </div>
  )
}