'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Gem, 
  Check,
  Calendar,
  CreditCard,
  Shield,
  Star,
  Clock,
  Users
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
interface PaymentSummaryProps {
  planData: PlanData
  method: PaymentMethod | null
  currentStep: 'methods' | 'form' | 'confirmation'
}

/**
 * Componente de resumo do pagamento (sidebar)
 * Mostra detalhes do plano, método selecionado e total
 */
export default function PaymentSummary({ planData, method, currentStep }: PaymentSummaryProps) {

  // Calcular taxas baseado no método
  const calculateFees = () => {
    if (!method) return 0
    
    switch (method.id) {
      case 'mpesa':
        return 0 // M-Pesa sem taxas
      case 'paypal':
        return Math.round(planData.price * 0.035) // 3.5% taxa internacional
      default:
        return 0
    }
  }

  const fees = calculateFees()
  const totalAmount = planData.price + fees

  // Benefícios por plano
  const planBenefits = {
    premium: [
      'Tudo do plano Gratuito',
      'Eventos exclusivos Premium',
      'Qualidade de áudio HD',
      'Downloads para offline',
      'Suporte prioritário',
      'Notificações antecipadas'
    ],
    vip: [
      'Tudo do plano Premium',
      'Contato direto com artistas',
      'Eventos exclusivos VIP',
      'Acesso a estúdios',
      'Sessões privadas',
      'Merchandise exclusivo',
      'Suporte VIP 24/7'
    ]
  }

  return (
    <div className="space-y-6">
      
      {/* Card principal do resumo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
      >
        
        {/* Header do resumo */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${
            planData.id === 'premium' 
              ? 'from-yellow-400 to-orange-500' 
              : 'from-purple-500 to-pink-500'
          } flex items-center justify-center`}>
            {planData.id === 'premium' ? 
              <Crown className="w-8 h-8 text-white" /> : 
              <Gem className="w-8 h-8 text-white" />
            }
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            Plano {planData.name}
          </h3>
          
          <p className="text-gray-400 text-sm">
            {planData.description}
          </p>
        </div>

        {/* Detalhes do preço */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Plano {planData.name}</span>
              <span className="text-white font-semibold">{planData.price} MT</span>
            </div>
            
            {method && fees > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  Taxa {method.name}
                  {method.id === 'paypal' && ' (3.5%)'}
                </span>
                <span className="text-gray-300">{fees} MT</span>
              </div>
            )}
            
            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-white">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">{totalAmount} MT</span>
                  <p className="text-gray-400 text-sm">por mês</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Método de pagamento selecionado */}
        {method && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="border-t border-gray-700 pt-6 mb-6"
          >
            <h4 className="text-gray-300 text-sm font-medium mb-3">Método de Pagamento:</h4>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                method.id === 'mpesa' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-medium">{method.name}</p>
                <p className="text-gray-400 text-xs">{method.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Próxima cobrança */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-white font-medium">Próxima Cobrança</p>
              <p className="text-gray-400 text-sm">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-MZ', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Benefícios do plano */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
      >
        <h4 className="text-lg font-bold text-white mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-yellow-400" />
          O Que Inclui
        </h4>
        
        <div className="space-y-3">
          {planBenefits[planData.id].map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-3"
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${
                planData.id === 'premium' 
                  ? 'from-yellow-400 to-orange-500' 
                  : 'from-purple-500 to-pink-500'
              } flex items-center justify-center flex-shrink-0`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-gray-300 text-sm">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Garantias e suporte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6"
      >
        <h4 className="text-green-400 font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Garantias
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-300 text-sm font-medium">Cancela quando quiseres</p>
              <p className="text-gray-400 text-xs">Sem taxas de cancelamento</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-300 text-sm font-medium">Suporte 24/7</p>
              <p className="text-gray-400 text-xs">Ajuda sempre disponível</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-300 text-sm font-medium">Pagamento seguro</p>
              <p className="text-gray-400 text-xs">Certificado SSL e criptografia</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-300 text-sm font-medium">Ativação imediata</p>
              <p className="text-gray-400 text-xs">Acesso instantâneo após pagamento</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas da comunidade */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
      >
        <h4 className="text-lg font-bold text-white mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-400" />
          Junte-se à Comunidade
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">15K+</p>
            <p className="text-gray-400 text-xs">Artistas</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-gray-400 text-xs">Eventos/mês</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-white">50K+</p>
            <p className="text-gray-400 text-xs">Fãs ativos</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-white">98%</p>
            <p className="text-gray-400 text-xs">Satisfação</p>
          </div>
        </div>
      </motion.div>

      {/* Informações de contato */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="text-center"
      >
        <p className="text-gray-400 text-sm mb-2">
          Precisas de ajuda?
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span>📧 suporte@eimusic.mz</span>
          <span>•</span>
          <span>📞 +258 84 000 0000</span>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-gray-500 text-xs">
            🇲🇿 Proudly Mozambican • 🎵 Supporting Local Artists
          </p>
        </div>
      </motion.div>

      {/* Progress indicator baseado no step atual */}
      {currentStep !== 'methods' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {currentStep === 'form' ? (
                <Clock className="w-5 h-5 text-yellow-400" />
              ) : (
                <Check className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                {currentStep === 'form' ? 'Preenchendo dados...' : 'Pronto para confirmar!'}
              </p>
              <p className="text-gray-400 text-xs">
                {currentStep === 'form' 
                  ? 'Complete o formulário para continuar'
                  : 'Revise e confirme o seu pagamento'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}