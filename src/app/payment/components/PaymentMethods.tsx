'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  Building2, 
  CreditCard, 
  Check,
  Star,
  Clock,
  Shield
} from 'lucide-react'

// Interface para método de pagamento
interface PaymentMethod {
  id: 'mpesa' | 'banco' | 'paypal'
  name: string
  description: string
  icon: React.ReactNode
  gradient: string
  borderColor: string
  features: string[]
  processingTime: string
  fees: string
  popular?: boolean
  recommended?: boolean
}

// Interface para props do componente
interface PaymentMethodsProps {
  onMethodSelect: (method: PaymentMethod) => void
  selectedMethod: { id: 'mpesa' | 'banco' | 'paypal'; name: string; description: string } | null
}

/**
 * Componente para seleção de métodos de pagamento
 * Oferece M-Pesa, Banco e PayPal com design moçambicano
 */
export default function PaymentMethods({ onMethodSelect, selectedMethod }: PaymentMethodsProps) {

  // Definição dos métodos de pagamento com dados moçambicanos
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      description: 'Pagamento rápido e seguro via telemóvel',
      icon: <Smartphone className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-green-600',
      borderColor: 'border-emerald-500',
      popular: true,
      recommended: true,
      features: [
        'Instantâneo e seguro',
        'Sem taxas adicionais',
        'Confirmação imediata',
        'Disponível 24/7',
        'Aceito em todo Moçambique'
      ],
      processingTime: 'Instantâneo',
      fees: 'Sem taxas'
    },
    {
      id: 'paypal',
      name: 'Visa / PayPal',
      description: 'Pagamento internacional via cartão Visa ou PayPal',
      icon: <CreditCard className="w-8 h-8" />,
      gradient: 'from-blue-600 to-indigo-700',
      borderColor: 'border-blue-500',
      features: [
        'Cartões Visa aceitos',
        'PayPal internacional',
        'Proteção do comprador',
        'Conversão automática USD→MT',
        'Segurança internacional PCI DSS'
      ],
      processingTime: 'Instantâneo',
      fees: 'Taxa de conversão 3.5%'
    }
  ]

  // Handler para seleção de método
  const handleMethodClick = (method: PaymentMethod) => {
    onMethodSelect(method)
  }

  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da seção */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Escolhe o Teu Método de Pagamento
        </h2>
        <p className="text-gray-400">
          Seleciona a forma mais conveniente para pagar a tua assinatura
        </p>
      </div>

      {/* Estatísticas de confiança com cores melhoradas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
          <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-white font-semibold">100% Seguro</p>
          <p className="text-gray-400 text-sm">Criptografia SSL</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
          <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Processamento Rápido</p>
          <p className="text-gray-400 text-sm">Ativação imediata</p>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
          <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-white font-semibold">Suporte 24/7</p>
          <p className="text-gray-400 text-sm">Ajuda sempre disponível</p>
        </div>
      </div>

      {/* Grid de métodos de pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative"
          >
            {/* Badge Recomendado - M-Pesa */}
            {method.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="bg-gradient-to-r from-emerald-400 to-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg"
                >
                  <Star className="w-3 h-3" />
                  <span>🇲🇿 Recomendado</span>
                </motion.div>
              </div>
            )}

            {/* Badge Popular */}
            {method.popular && !method.recommended && (
              <div className="absolute -top-3 right-4 z-10">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>Popular</span>
                </div>
              </div>
            )}

            {/* Card do método com destaque visual específico */}
            <motion.div
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => handleMethodClick(method)}
              className={`cursor-pointer rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${
                selectedMethod?.id === method.id 
                  ? `${method.borderColor} bg-gradient-to-br from-white/5 to-transparent shadow-lg`
                  : 'border-gray-600 hover:border-gray-500 hover:shadow-md'
              } ${
                method.recommended ? 'transform lg:scale-105 shadow-emerald-500/20' : ''
              }`}
            >
              {/* Gradiente de fundo específico por método */}
              <div className={`absolute inset-0 bg-gradient-to-br ${
                method.id === 'mpesa' 
                  ? 'from-emerald-500/5 via-green-500/3 to-transparent' 
                  : 'from-blue-500/5 via-indigo-500/3 to-transparent'
              } pointer-events-none`}></div>
              {/* Badge Selecionado */}
              {selectedMethod?.id === method.id && (
                <div className="absolute -top-3 right-4 z-10">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>Selecionado</span>
                  </div>
                </div>
              )}

              <div className="p-8 relative z-10">
                {/* Header do método com ícones específicos */}
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${method.gradient} flex items-center justify-center shadow-lg ${
                    method.id === 'mpesa' ? 'shadow-emerald-500/25' : 'shadow-blue-500/25'
                  }`}>
                    {method.id === 'mpesa' ? (
                      <div className="text-white text-2xl font-bold">M</div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-4 bg-white rounded-sm flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">VISA</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {method.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4">
                    {method.description}
                  </p>
                  
                  {/* Informações de processamento com cores específicas */}
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <p className="text-gray-500">Processamento:</p>
                      <p className={`font-medium ${
                        method.id === 'mpesa' ? 'text-emerald-300' : 'text-blue-300'
                      }`}>{method.processingTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Taxas:</p>
                      <p className={`font-medium ${
                        method.id === 'mpesa' ? 'text-emerald-300' : 'text-blue-300'
                      }`}>{method.fees}</p>
                    </div>
                  </div>
                </div>

                {/* Features do método */}
                <div className="space-y-3 mb-6">
                  {method.features.map((feature, featureIndex) => (
                    <motion.div
                      key={featureIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + featureIndex * 0.05 }}
                      className="flex items-center space-x-3"
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${method.gradient} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-300 text-sm">
                        {feature}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Botão de seleção com cores específicas */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMethodClick(method)}
                  className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 text-lg ${
                    selectedMethod?.id === method.id
                      ? `bg-gradient-to-r ${method.gradient} text-white shadow-lg scale-105`
                      : `border-2 ${method.borderColor} text-gray-300 hover:bg-gradient-to-r hover:${method.gradient} hover:text-white hover:border-transparent hover:shadow-lg`
                  }`}
                >
                  {selectedMethod?.id === method.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Check className="w-5 h-5" />
                      <span>Selecionado</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      {method.id === 'mpesa' ? (
                        <>
                          <span>📱</span>
                          <span>Escolher M-Pesa</span>
                        </>
                      ) : (
                        <>
                          <span>💳</span>
                          <span>Escolher Visa/PayPal</span>
                        </>
                      )}
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Informações de segurança com destaque M-Pesa */}
      <div className="mt-8 bg-gradient-to-r from-emerald-800/30 to-green-800/30 border border-emerald-700/50 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center">
              🔒 Pagamento 100% Seguro
              <span className="ml-3 text-emerald-400 text-sm">🇲🇿 Moçambique</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              <strong className="text-emerald-400">M-Pesa:</strong> Método oficial de pagamento móvel em Moçambique. Sem taxas adicionais, processamento instantâneo.<br/>
              <strong className="text-blue-400">Visa/PayPal:</strong> Segurança internacional com proteção do comprador e conversão automática de moeda.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span>🇲🇿 M-Pesa Oficial</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>🔐 Certificado SSL</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>💳 PCI DSS Compliant</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                <span>📞 Suporte 24/7</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      {selectedMethod && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-gray-400 text-sm">
            Método selecionado: <span className="text-white font-semibold">{selectedMethod.name}</span>
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Clica em "Continuar" para prosseguir com o pagamento
          </p>
        </motion.div>
      )}
    </div>
  )
}