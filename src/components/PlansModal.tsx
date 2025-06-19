'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Crown, 
  Gem, 
  Globe,
  Check,
  Zap,
  Star,
  Shield,
  Headphones,
  MessageCircle,
  Calendar,
  Users,
  Heart,
  Sparkles
} from 'lucide-react'

// Interface para props do modal
interface PlansModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (planType: 'premium' | 'vip') => void
  currentPlan?: 'free' | 'premium' | 'vip'
}

// Interface para definição dos planos
interface Plan {
  id: 'free' | 'premium' | 'vip'
  name: string
  price: number
  period: string
  description: string
  icon: React.ReactNode
  gradient: string
  borderColor: string
  features: string[]
  popular?: boolean
  buttonText: string
  savings?: string
}

// Componente do Modal de Planos
export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  currentPlan = 'free'
}) => {

  // Definição dos planos com detalhes moçambicanos
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 0,
      period: 'sempre',
      description: 'Perfeito para descobrir a música moçambicana',
      icon: <Globe className="w-8 h-8" />,
      gradient: 'from-gray-500 to-gray-600',
      borderColor: 'border-gray-500',
      features: [
        'Acesso a eventos públicos',
        'Escuta de música básica',
        'Comunidades públicas',
        'Descoberta de artistas',
        'Suporte por email'
      ],
      buttonText: 'Plano Atual',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 120,
      period: 'mês',
      description: 'Para verdadeiros amantes da música moçambicana',
      icon: <Crown className="w-8 h-8" />,
      gradient: 'from-yellow-400 to-orange-500',
      borderColor: 'border-yellow-400',
      popular: true,
      features: [
        'Tudo do plano Gratuito',
        'Eventos exclusivos Premium',
        'Notificações antecipadas de shows',
        'Meet & greet selecionados',
        'Qualidade de áudio HD',
        'Downloads para offline',
        'Suporte prioritário'
      ],
      buttonText: 'Escolher Premium',
      savings: 'Mais popular'
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 250,
      period: 'mês',
      description: 'Experiência completa e exclusiva da cultura musical',
      icon: <Gem className="w-8 h-8" />,
      gradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-500',
      features: [
        'Tudo do plano Premium',
        'Contato direto com artistas',
        'Eventos exclusivos VIP',
        'Acesso a estúdios de gravação',
        'Sessões privadas e ensaios',
        'Conteúdo behind-the-scenes',
        'Suporte VIP 24/7',
        'Merchandise exclusivo'
      ],
      buttonText: 'Escolher VIP',
      savings: 'Experiência completa'
    }
  ]

  // Handler para seleção de plano
  const handlePlanSelection = (planId: 'premium' | 'vip') => {
    onSelectPlan(planId)
  }

  // Handler para fechar modal
  const handleClose = () => {
    onClose()
  }

  // Handler para tecla ESC
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-6xl max-h-[90vh] overflow-y-auto scrollbar-hide"
              onKeyDown={handleKeyDown}
              tabIndex={-1}
            >
              {/* Card principal com gradiente */}
              <div className="bg-gradient-to-br from-gray-800/95 via-purple-900/30 to-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700 shadow-2xl">
                
                {/* Header do modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        Escolhe o Teu Plano
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Desfruta da melhor música moçambicana sem limites
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </motion.button>
                </div>

                {/* Conteúdo dos planos */}
                <div className="p-6">
                  
                  {/* Estatísticas da plataforma */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                      <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">15.000+</p>
                      <p className="text-gray-400 text-sm">Artistas Moçambicanos</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500/10 to-yellow-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                      <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">500+</p>
                      <p className="text-gray-400 text-sm">Eventos por Mês</p>
                    </div>
                    
                    <div className="bg-gradient-to-r from-pink-500/10 to-red-500/10 border border-pink-500/20 rounded-xl p-4 text-center">
                      <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">50.000+</p>
                      <p className="text-gray-400 text-sm">Fãs Satisfeitos</p>
                    </div>
                  </div>

                  {/* Grid de planos */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`relative rounded-xl border-2 transition-all duration-300 ${
                          currentPlan === plan.id 
                            ? `${plan.borderColor} bg-gradient-to-br from-white/5 to-transparent`
                            : 'border-gray-600 hover:border-gray-500'
                        } ${
                          plan.popular ? 'transform lg:scale-105' : ''
                        }`}
                      >
                        {/* Badge Popular */}
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.5 }}
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-xs font-bold flex items-center space-x-1"
                            >
                              <Star className="w-3 h-3" />
                              <span>{plan.savings}</span>
                            </motion.div>
                          </div>
                        )}

                        {/* Badge Plano Atual */}
                        {currentPlan === plan.id && (
                          <div className="absolute -top-3 right-4">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>Atual</span>
                            </div>
                          </div>
                        )}

                        <div className="p-6">
                          {/* Header do plano */}
                          <div className="text-center mb-6">
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center`}>
                              {plan.icon}
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2">
                              {plan.name}
                            </h3>
                            
                            <p className="text-gray-400 text-sm mb-4">
                              {plan.description}
                            </p>
                            
                            <div className="mb-4">
                              {plan.price === 0 ? (
                                <div className="text-3xl font-bold text-white">
                                  Gratuito
                                </div>
                              ) : (
                                <div className="flex items-baseline justify-center space-x-1">
                                  <span className="text-3xl font-bold text-white">
                                    {plan.price}
                                  </span>
                                  <span className="text-lg text-gray-400">MT</span>
                                  <span className="text-sm text-gray-400">
                                    /{plan.period}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Features do plano */}
                          <div className="space-y-3 mb-6">
                            {plan.features.map((feature, featureIndex) => (
                              <motion.div
                                key={featureIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                                className="flex items-center space-x-3"
                              >
                                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-gray-300 text-sm">
                                  {feature}
                                </span>
                              </motion.div>
                            ))}
                          </div>

                          {/* Botão de ação */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => plan.id !== 'free' && handlePlanSelection(plan.id as 'premium' | 'vip')}
                            disabled={currentPlan === plan.id}
                            className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ${
                              currentPlan === plan.id
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : plan.id === 'free'
                                ? 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white'
                                : `bg-gradient-to-r ${plan.gradient} hover:scale-105 text-white shadow-lg`
                            }`}
                          >
                            {currentPlan === plan.id ? 'Plano Atual' : plan.buttonText}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Benefícios adicionais */}
                  <div className="mt-8 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 border border-purple-500/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 text-center">
                      🎵 Todos os Planos Incluem
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300 text-sm">Sem publicidade</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Headphones className="w-5 h-5 text-blue-400" />
                        <span className="text-gray-300 text-sm">Som cristalino</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300 text-sm">Suporte 24/7</span>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300 text-sm">Atualizações grátis</span>
                      </div>
                    </div>
                  </div>

                  {/* Garantia e segurança */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm mb-2">
                      🔒 Pagamento 100% seguro • 💳 Cancela quando quiseres • 🇲🇿 Suporte em Português
                    </p>
                    <p className="text-gray-500 text-xs">
                      Todos os preços em Meticais (MT). Suporte à música moçambicana.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}