// 📁 CAMINHO: src/app/payment/components/PaymentSuccess.tsx
// 🎯 FUNÇÃO: Componente visual de confirmação de pagamento bem-sucedido
// 📝 DESCRIÇÃO: Exibe detalhes da transação, animações de sucesso e redireciona automaticamente

'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  Star, 
  Music, 
  Video, 
  Clock,
  ArrowRight,
  Smartphone,
  CreditCard
} from 'lucide-react'

// Interface para dados do pagamento bem-sucedido
interface PaymentSuccessData {
  transactionId: string
  method: 'mpesa' | 'paypal'
  planName: string
  planPrice: number
  userEmail: string
  activationDate: string
}

// Interface para props do componente
interface PaymentSuccessProps {
  paymentData: PaymentSuccessData
  onContinue?: () => void
}

/**
 * Componente de confirmação de pagamento bem-sucedido
 * Exibe detalhes da transação e benefícios ativados
 * Segue o padrão visual e arquitetura da plataforma
 */
function PaymentSuccess({ paymentData, onContinue }: PaymentSuccessProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(10)
  const [showConfetti, setShowConfetti] = useState(true)

  // Efeito para countdown automático para home
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Redirecionar para home após countdown
          router.push('/')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Limpar timer após 3 segundos para remover confetti
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    return () => {
      clearInterval(timer)
      clearTimeout(confettiTimer)
    }
  }, [router])

  // Handler para continuar manualmente
  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      router.push('/')
    }
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

  // Definir ícone e cor baseado no método de pagamento
  const getPaymentMethodInfo = () => {
    switch (paymentData.method) {
      case 'mpesa':
        return {
          icon: <Smartphone className="w-6 h-6" />,
          name: 'M-Pesa',
          color: 'from-emerald-500 to-green-600',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30'
        }
      case 'paypal':
        return {
          icon: <CreditCard className="w-6 h-6" />,
          name: 'Visa/PayPal',
          color: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30'
        }
      default:
        return {
          icon: <CreditCard className="w-6 h-6" />,
          name: 'Pagamento',
          color: 'from-purple-500 to-pink-600',
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30'
        }
    }
  }

  const paymentMethodInfo = getPaymentMethodInfo()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      {/* Linha gradiente no topo */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-yellow-500 to-green-500 z-50"></div>

      {/* Animação de confetti (partículas comemorativas) */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              initial={{
                x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 400,
                y: -20,
                rotate: 0
              }}
              animate={{
                y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                rotate: 360
              }}
              transition={{
                duration: 3,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full"
      >
        {/* Card principal */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          
          {/* Header com ícone de sucesso */}
          <motion.div 
            variants={itemVariants}
            className="text-center py-12 px-8 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-b border-gray-700/50"
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
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/25"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-3xl font-bold text-white mb-3">
              🎉 Pagamento Confirmado!
            </h1>
            
            <p className="text-gray-300 text-lg">
              A tua assinatura foi ativada com sucesso
            </p>
          </motion.div>

          {/* Detalhes da transação */}
          <div className="p-8 space-y-6">
            
            {/* Informações do plano */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 text-yellow-400 mr-2" />
                Plano Ativado
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Plano</p>
                  <p className="text-white font-medium">{paymentData.planName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Valor</p>
                  <p className="text-white font-medium">{paymentData.planPrice} MT</p>
                </div>
              </div>
            </motion.div>

            {/* Detalhes do pagamento */}
            <motion.div 
              variants={itemVariants}
              className={`${paymentMethodInfo.bgColor} border ${paymentMethodInfo.borderColor} rounded-xl p-6`}
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                {paymentMethodInfo.icon}
                <span className="ml-2">Detalhes do Pagamento</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Método</p>
                  <p className="text-white font-medium">{paymentMethodInfo.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">ID da Transação</p>
                  <p className="text-white font-mono text-sm">{paymentData.transactionId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Data de Ativação</p>
                  <p className="text-white font-medium">{paymentData.activationDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium">{paymentData.userEmail}</p>
                </div>
              </div>
            </motion.div>

            {/* Benefícios ativados */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                🎵 O que tens acesso agora:
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Música Premium</p>
                    <p className="text-gray-400 text-sm">Acesso ilimitado</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Videoclipes HD</p>
                    <p className="text-gray-400 text-sm">Qualidade máxima</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Conteúdo Exclusivo</p>
                    <p className="text-gray-400 text-sm">Artistas em destaque</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Acesso Antecipado</p>
                    <p className="text-gray-400 text-sm">Novos lançamentos</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Botões de ação */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContinue}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-4 rounded-xl text-white font-medium transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Explorar Conteúdo</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Countdown automático */}
            <motion.div 
              variants={itemVariants}
              className="text-center pt-4 border-t border-gray-700/50"
            >
              <p className="text-gray-400 text-sm">
                🏠 Redirecionamento automático em{' '}
                <span className="text-white font-medium">{countdown}s</span>
              </p>
            </motion.div>

          </div>
        </div>

        {/* Nota de segurança */}
        <motion.div 
          variants={itemVariants}
          className="mt-6 text-center"
        >
          <p className="text-gray-500 text-sm">
            🔒 Transação segura • 🇲🇿 Processado em Moçambique
          </p>
        </motion.div>

      </motion.div>
    </div>
  )
}

export default PaymentSuccess