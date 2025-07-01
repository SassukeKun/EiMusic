'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Smartphone, 
  CreditCard, 
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ArrowLeft,
  Shield
} from 'lucide-react'

// Interface para método de pagamento (versão simplificada)
interface PaymentMethod {
  id: 'mpesa' | 'paypal'
  name: string
  description: string
}

// Interface para dados do plano
interface PlanData {
  id: 'premium' | 'vip'
  name: string
  price: number
  description: string
}

// Interface para props do componente
interface PaymentFormProps {
  method: PaymentMethod
  planData: PlanData
  onSubmit: (data: any) => void
  onBack: () => void
}

// Interface para dados do formulário M-Pesa
interface MpesaFormData {
  phoneNumber: string
  confirmPhoneNumber: string
  agreesToTerms: boolean
}

// Interface para dados do formulário PayPal/Visa
interface PayPalFormData {
  email: string
  confirmEmail: string
  paymentType: 'paypal' | 'visa'
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardHolder?: string
  agreesToTerms: boolean
}

/**
 * Componente de formulário de pagamento
 * Renderiza formulários específicos para cada método de pagamento
 */
export default function PaymentForm({ method, planData, onSubmit, onBack }: PaymentFormProps) {
  
  // Estados para diferentes tipos de formulário
  const [mpesaData, setMpesaData] = useState<MpesaFormData>({
    phoneNumber: '',
    confirmPhoneNumber: '',
    agreesToTerms: false
  })
  
  const [paypalData, setPaypalData] = useState<PayPalFormData>({
    email: '',
    confirmEmail: '',
    paymentType: 'paypal',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    agreesToTerms: false
  })

  // Estados para controle da UI
  const [showCvv, setShowCvv] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<any>({})

  // Validação do formulário M-Pesa
  const validateMpesaForm = (): boolean => {
    const newErrors: any = {}
    
    // Validar número de telefone (formato moçambicano)
    if (!mpesaData.phoneNumber) {
      newErrors.phoneNumber = 'Número de telefone é obrigatório'
    } else if (!/^(\+258|258|0)?[8][2-7][0-9]{7}$/.test(mpesaData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Formato inválido. Ex: +258 84 123 4567'
    }
    
    // Validar confirmação do número
    if (mpesaData.phoneNumber !== mpesaData.confirmPhoneNumber) {
      newErrors.confirmPhoneNumber = 'Os números não coincidem'
    }
    
    // Validar termos
    if (!mpesaData.agreesToTerms) {
      newErrors.agreesToTerms = 'Deve aceitar os termos e condições'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validação do formulário PayPal/Visa
  const validatePayPalForm = (): boolean => {
    const newErrors: any = {}
    
    // Validar email
    if (!paypalData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (paypalData.email !== paypalData.confirmEmail) {
      newErrors.confirmEmail = 'Os emails não coincidem'
    }
    
    // Se escolheu Visa, validar campos do cartão
    if (paypalData.paymentType === 'visa') {
      if (!paypalData.cardNumber) newErrors.cardNumber = 'Número do cartão obrigatório'
      if (!paypalData.expiryDate) newErrors.expiryDate = 'Data de validade obrigatória'
      if (!paypalData.cvv) newErrors.cvv = 'CVV obrigatório'
      if (!paypalData.cardHolder) newErrors.cardHolder = 'Nome do titular obrigatório'
    }
    
    if (!paypalData.agreesToTerms) newErrors.agreesToTerms = 'Deve aceitar os termos e condições'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handler para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    let isValid = false
    let formData: any = {}
    
    // Validar baseado no método selecionado
    switch (method.id) {
      case 'mpesa':
        isValid = validateMpesaForm()
        formData = mpesaData
        break
      case 'paypal':
        isValid = validatePayPalForm()
        formData = paypalData
        break
      default:
        isValid = false
        formData = {}
    }
    
    if (isValid) {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit({ method: method.id, ...formData })
    }
    
    setIsSubmitting(false)
  }

  // Renderizar formulário M-Pesa com cores específicas
  const renderMpesaForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <div className="text-white text-3xl font-bold">M</div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Pagamento via M-Pesa</h3>
        <p className="text-gray-400 text-sm">
          🇲🇿 Insere o teu número de M-Pesa para pagar {planData.price} MT
        </p>
      </div>

      {/* Informações do M-Pesa com visual melhorado */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6">
        <h4 className="text-emerald-400 font-semibold mb-2 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Como funciona:
        </h4>
        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
          <li>📱 Insere o teu número de M-Pesa</li>
          <li>💬 Receberás um SMS com código de confirmação</li>
          <li>✅ Confirma o pagamento no teu telemóvel</li>
          <li>⚡ A tua assinatura será ativada instantaneamente</li>
        </ol>
      </div>

      <div className="space-y-4">
        {/* Número de telefone */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Número de M-Pesa *
          </label>
          <input
            type="tel"
            value={mpesaData.phoneNumber}
            onChange={(e) => setMpesaData({...mpesaData, phoneNumber: e.target.value})}
            placeholder="+258 84 123 4567"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-600'
            } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`}
          />
          {errors.phoneNumber && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.phoneNumber}
            </p>
          )}
        </div>

        {/* Confirmação do número */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Confirma o Número *
          </label>
          <input
            type="tel"
            value={mpesaData.confirmPhoneNumber}
            onChange={(e) => setMpesaData({...mpesaData, confirmPhoneNumber: e.target.value})}
            placeholder="+258 84 123 4567"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.confirmPhoneNumber ? 'border-red-500' : 'border-gray-600'
            } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`}
          />
          {errors.confirmPhoneNumber && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.confirmPhoneNumber}
            </p>
          )}
        </div>
      </div>
    </div>
  )

  // Renderizar formulário PayPal/Visa melhorado
  const renderPayPalForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <div className="flex items-center space-x-1">
            <div className="w-8 h-6 bg-white rounded-sm flex items-center justify-center">
              <span className="text-blue-600 text-xs font-bold">VISA</span>
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Pagamento Internacional</h3>
        <p className="text-gray-400 text-sm">
          💳 Paga com Visa ou PayPal - Conversão para {planData.price} MT
        </p>
      </div>

      {/* Informações de conversão melhoradas */}
      <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <h4 className="text-blue-400 font-semibold mb-2 flex items-center">
          💱 Conversão de Moeda:
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-300 font-medium">{planData.price} MT</p>
            <p className="text-gray-500 text-xs">Moçambique</p>
          </div>
          <div className="text-center">
            <p className="text-blue-400 font-medium">${(planData.price / 65).toFixed(2)} USD</p>
            <p className="text-gray-500 text-xs">Internacional</p>
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-2 text-center">
          Taxa: 1 USD = 65 MT • Taxa conversão: 3.5%
        </p>
      </div>

      {/* Seleção do método de pagamento */}
      <div className="mb-6">
        <label className="block text-gray-300 text-sm font-medium mb-3">
          Escolhe o método de pagamento:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaypalData({...paypalData, paymentType: 'paypal'})}
            className={`p-4 rounded-lg border-2 transition-all ${
              paypalData.paymentType === 'paypal'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🌐</div>
              <p className="text-white font-medium">PayPal</p>
              <p className="text-gray-400 text-xs">Conta PayPal</p>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setPaypalData({...paypalData, paymentType: 'visa'})}
            className={`p-4 rounded-lg border-2 transition-all ${
              paypalData.paymentType === 'visa'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <div className="w-12 h-8 bg-white rounded mx-auto mb-2 flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">VISA</span>
              </div>
              <p className="text-white font-medium">Cartão Visa</p>
              <p className="text-gray-400 text-xs">Débito/Crédito</p>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Email PayPal */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Email {paypalData.paymentType === 'paypal' ? 'PayPal' : 'para recibo'} *
          </label>
          <input
            type="email"
            value={paypalData.email}
            onChange={(e) => setPaypalData({...paypalData, email: e.target.value})}
            placeholder="seuemail@exemplo.com"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-600'
            } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Confirmação do email */}
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Confirma o Email *
          </label>
          <input
            type="email"
            value={paypalData.confirmEmail}
            onChange={(e) => setPaypalData({...paypalData, confirmEmail: e.target.value})}
            placeholder="seuemail@exemplo.com"
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.confirmEmail ? 'border-red-500' : 'border-gray-600'
            } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors`}
          />
          {errors.confirmEmail && (
            <p className="text-red-400 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.confirmEmail}
            </p>
          )}
        </div>

        {/* Campos do cartão Visa - apenas se selecionado */}
        {paypalData.paymentType === 'visa' && (
          <>
            {/* Número do cartão */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Número do Cartão Visa *
              </label>
              <input
                type="text"
                value={paypalData.cardNumber}
                onChange={(e) => setPaypalData({...paypalData, cardNumber: e.target.value})}
                placeholder="4532 1234 5678 9012"
                maxLength={19}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.cardNumber && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.cardNumber}
                </p>
              )}
            </div>

            {/* Nome do titular */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Nome no Cartão *
              </label>
              <input
                type="text"
                value={paypalData.cardHolder}
                onChange={(e) => setPaypalData({...paypalData, cardHolder: e.target.value})}
                placeholder="JOÃO ANTÓNIO SILVA"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.cardHolder ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.cardHolder && (
                <p className="text-red-400 text-sm mt-1 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.cardHolder}
                </p>
              )}
            </div>

            {/* Data de validade e CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Validade *
                </label>
                <input
                  type="text"
                  value={paypalData.expiryDate}
                  onChange={(e) => setPaypalData({...paypalData, expiryDate: e.target.value})}
                  placeholder="MM/AA"
                  maxLength={5}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-600'
                  } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors`}
                />
                {errors.expiryDate && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  CVV *
                </label>
                <div className="relative">
                  <input
                    type={showCvv ? "text" : "password"}
                    value={paypalData.cvv}
                    onChange={(e) => setPaypalData({...paypalData, cvv: e.target.value})}
                    placeholder="123"
                    maxLength={4}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border ${
                      errors.cvv ? 'border-red-500' : 'border-gray-600'
                    } bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showCvv ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.cvv && (
                  <p className="text-red-400 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.cvv}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

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
          <span>Voltar aos métodos</span>
        </motion.button>
      </div>

      {/* Formulário específico */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Renderização condicional baseada no step atual */}
        <motion.div
          key={method.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {method.id === 'mpesa' && renderMpesaForm()}
          {method.id === 'paypal' && renderPayPalForm()}

          {/* Termos e condições */}
          <div className="border-t border-gray-700 pt-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={method.id === 'mpesa' ? mpesaData.agreesToTerms : paypalData.agreesToTerms}
                onChange={(e) => {
                  if (method.id === 'mpesa') {
                    setMpesaData({...mpesaData, agreesToTerms: e.target.checked})
                  } else {
                    setPaypalData({...paypalData, agreesToTerms: e.target.checked})
                  }
                }}
                className="mt-1 w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-500 bg-gray-800"
              />
              <span className="text-gray-300 text-sm leading-relaxed">
                Aceito os{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                  Termos e Condições
                </a>{' '}
                e a{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                  Política de Privacidade
                </a>
                . Autorizo o débito automático mensal de {planData.price} MT.
              </span>
            </label>
            {errors.agreesToTerms && (
              <p className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.agreesToTerms}
              </p>
            )}
          </div>

          {/* Botão de submissão */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              isSubmitting 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : method.id === 'mpesa'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                {method.id === 'mpesa' ? (
                  <>
                    <span>📱</span>
                    <span>Continuar com M-Pesa</span>
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    <span>Continuar com {paypalData.paymentType === 'paypal' ? 'PayPal' : 'Visa'}</span>
                  </>
                )}
              </div>
            )}
          </motion.button>
        </motion.div>
      </form>
    </div>
  )
}