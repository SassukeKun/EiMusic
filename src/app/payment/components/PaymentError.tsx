// 📁 CAMINHO: src/app/payment/components/PaymentError.tsx
// 🎯 FUNÇÃO: Componente visual de erro de pagamento
// 📝 DESCRIÇÃO: Exibe detalhes do erro, troubleshooting e opções de recuperação

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ArrowLeft,
  Phone,
  CreditCard,
  HelpCircle,
  Mail,
  Clock,
  Shield
} from 'lucide-react'

// Interface para dados do erro de pagamento
interface PaymentErrorData {
  errorCode: string
  errorMessage: string
  method: 'mpesa' | 'paypal'
  planName: string
  planPrice: number
  transactionId?: string
  timestamp: string
}

// Interface para props do componente
interface PaymentErrorProps {
  errorData: PaymentErrorData
  onRetry?: () => void
  onGoBack?: () => void
}

/**
 * Componente de erro de pagamento
 * Exibe detalhes do erro e opções de recuperação
 * Segue o padrão visual e arquitetura da plataforma
 */
function PaymentError({ errorData, onRetry, onGoBack }: PaymentErrorProps) {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)

  // Handler para tentar novamente
  const handleRetry = async () => {
    setIsRetrying(true)
    
    // Simular delay antes de tentar novamente
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (onRetry) {
      onRetry()
    } else {
      // Voltar para a página de pagamento
      router.push('/payment')
    }
    
    setIsRetrying(false)
  }

  // Handler para voltar
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
    } else {
      router.back()
    }
  }

  // Handler para ir para home
  const handleGoHome = () => {
    router.push('/')
  }

  // Animações simplificadas para evitar problemas de tipagem
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  // Definir informações baseado no método de pagamento
  const getPaymentMethodInfo = () => {
    switch (errorData.method) {
      case 'mpesa':
        return {
          icon: <Phone className="w-6 h-6" />,
          name: 'M-Pesa',
          color: 'from-emerald-500 to-green-600',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          troubleshooting: [
            'Verifica se o teu número de M-Pesa está correto',
            'Confirma se tens saldo suficiente na conta',
            'Verifica se o M-Pesa não está bloqueado',
            'Tenta novamente após alguns minutos'
          ]
        }
      case 'paypal':
        return {
          icon: <CreditCard className="w-6 h-6" />,
          name: 'Visa/PayPal',
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          troubleshooting: [
            'Verifica os dados do cartão (número, validade, CVV)',
            'Confirma se o cartão tem limite disponível',
            'Verifica se o cartão está ativo para compras online',
            'Experimenta um método de pagamento diferente'
          ]
        }
      default:
        return {
          icon: <CreditCard className="w-6 h-6" />,
          name: 'Pagamento',
          color: 'from-purple-500 to-pink-600',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30',
          troubleshooting: [
            'Verifica a tua ligação à internet',
            'Tenta novamente após alguns minutos',
            'Contacta o suporte se o problema persistir'
          ]
        }
    }
  }

  const paymentMethodInfo = getPaymentMethodInfo()

  // Mapear códigos de erro para mensagens amigáveis
  const getErrorDetails = () => {
    const commonErrors: Record<string, { title: string; description: string; severity: 'high' | 'medium' | 'low' }> = {
      'INSUFFICIENT_FUNDS': {
        title: 'Saldo Insuficiente',
        description: 'Não tens saldo suficiente na tua conta para completar esta transação.',
        severity: 'medium'
      },
      'INVALID_CARD': {
        title: 'Cartão Inválido',
        description: 'Os dados do cartão estão incorretos ou o cartão não é aceito.',
        severity: 'high'
      },
      'NETWORK_ERROR': {
        title: 'Erro de Ligação',
        description: 'Problema de ligação durante o processamento. Tenta novamente.',
        severity: 'low'
      },
      'MPESA_TIMEOUT': {
        title: 'Tempo Limite M-Pesa',
        description: 'Não recebemos confirmação do M-Pesa a tempo. Verifica o teu telemóvel.',
        severity: 'medium'
      },
      'DECLINED': {
        title: 'Pagamento Recusado',
        description: 'O pagamento foi recusado pelo banco ou operadora.',
        severity: 'high'
      }
    }

    return commonErrors[errorData.errorCode] || {
      title: 'Erro no Pagamento',
      description: errorData.errorMessage || 'Ocorreu um erro inesperado durante o processamento.',
      severity: 'medium' as const
    }
  }

  const errorDetails = getErrorDetails()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/10 to-gray-900 flex items-center justify-center p-4">
      {/* Linha gradiente no topo */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 z-50"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full"
      >
        {/* Card principal */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          
          {/* Header com ícone de erro */}
          <motion.div 
            variants={itemVariants}
            className="text-center py-12 px-8 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b border-gray-700/50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.2, 
                type: "spring", 
                stiffness: 200, 
                damping: 10 
              }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25"
            >
              <XCircle className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-3">
              ⚠️ Pagamento Não Processado
            </h1>
            
            <p className="text-gray-300 text-lg">
              {errorDetails.title}
            </p>
          </motion.div>

          {/* Detalhes do erro */}
          <div className="p-8 space-y-6">
            
            {/* Descrição do erro */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 bg-gradient-to-r ${
                  errorDetails.severity === 'high' ? 'from-red-500 to-red-600' :
                  errorDetails.severity === 'medium' ? 'from-orange-500 to-orange-600' :
                  'from-yellow-500 to-yellow-600'
                } rounded-lg flex-shrink-0`}>
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {errorDetails.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {errorDetails.description}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Detalhes técnicos */}
            <motion.div 
              variants={itemVariants}
              className={`${paymentMethodInfo.bgColor} border ${paymentMethodInfo.borderColor} rounded-xl p-6`}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                {paymentMethodInfo.icon}
                <span className="ml-2">Detalhes da Tentativa</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Método de Pagamento</p>
                  <p className="text-white font-medium">{paymentMethodInfo.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Plano</p>
                  <p className="text-white font-medium">{errorData.planName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Valor</p>
                  <p className="text-white font-medium">{errorData.planPrice} MT</p>
                </div>
                <div>
                  <p className="text-gray-400">Hora</p>
                  <p className="text-white font-medium">{errorData.timestamp}</p>
                </div>
                {errorData.transactionId && (
                  <div className="md:col-span-2">
                    <p className="text-gray-400">ID de Referência</p>
                    <p className="text-white font-mono text-xs">{errorData.transactionId}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-gray-400">Código de Erro</p>
                  <p className="text-white font-mono text-xs">{errorData.errorCode}</p>
                </div>
              </div>
            </motion.div>

            {/* Resolução de problemas */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 text-blue-400 mr-2" />
                O que podes fazer:
              </h3>
              
              <ul className="space-y-3">
                {paymentMethodInfo.troubleshooting.map((tip, index) => (
                  <motion.li 
                    key={index}
                    variants={itemVariants}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-xs font-medium">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{tip}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Botões de ação */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 px-6 py-4 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Tentando...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    <span>Tentar Novamente</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoBack}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-4 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Voltar</span>
              </motion.button>
            </motion.div>

            {/* Link para home */}
            <motion.div 
              variants={itemVariants}
              className="text-center pt-4 border-t border-gray-700/50"
            >
              <button
                onClick={handleGoHome}
                className="text-gray-400 hover:text-white transition-colors text-sm underline"
              >
                🏠 Voltar à página inicial
              </button>
            </motion.div>

          </div>
        </div>

        {/* Informações de suporte */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 bg-gray-800/50 backdrop-blur border border-gray-700/30 rounded-xl p-6"
        >
          <h4 className="text-white font-semibold mb-3 flex items-center">
            <Shield className="w-5 h-5 text-green-400 mr-2" />
            Precisa de Ajuda?
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Email de Suporte</p>
                <p className="text-gray-400">suporte@plataforma.mz</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">Suporte M-Pesa</p>
                <p className="text-gray-400">*123# ou 123</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-blue-300 text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Atendimento: Segunda a Sexta, 8h às 18h
            </p>
          </div>
        </motion.div>

        {/* Nota de segurança */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-sm">
            🔒 Os teus dados estão seguros • 🇲🇿 Suporte local disponível
          </p>
        </motion.div>

      </motion.div>
    </div>
  )
}

export default PaymentError