// 📁 CAMINHO: src/types/payment.ts
// 🎯 FUNÇÃO: Interfaces TypeScript para o sistema de pagamentos
// 📝 DESCRIÇÃO: Define todos os tipos, interfaces e constantes usadas nos pagamentos

/**
 * Interfaces TypeScript para o sistema de pagamentos
 * Seguindo o padrão de tipagem rigorosa da plataforma
 */

// Tipos de métodos de pagamento suportados
export type PaymentMethod = 'mpesa' | 'paypal'

// Tipos de planos disponíveis
export type PlanType = 'premium' | 'vip'

// Status possíveis de uma transação
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

// Severidade de erros
export type ErrorSeverity = 'low' | 'medium' | 'high'

/**
 * Interface para dados de pagamento bem-sucedido
 * Usada na tela de confirmação de sucesso
 */
export interface PaymentSuccessData {
  transactionId: string
  method: PaymentMethod
  planName: string
  planPrice: number
  userEmail: string
  activationDate: string
}

/**
 * Interface para dados de erro de pagamento
 * Usada na tela de erro com troubleshooting
 */
export interface PaymentErrorData {
  errorCode: string
  errorMessage: string
  method: PaymentMethod
  planName: string
  planPrice: number
  transactionId?: string
  timestamp: string
}

/**
 * Interface para dados de processamento de pagamento
 * Usada pelo serviço de pagamento
 */
export interface PaymentProcessData {
  method: PaymentMethod
  planName: string
  planPrice: number
  userEmail: string
  formData: MpesaFormData | PayPalFormData
}

/**
 * Interface para formulário M-Pesa
 * Dados específicos para pagamento via M-Pesa
 */
export interface MpesaFormData {
  phoneNumber: string
  confirmPhoneNumber: string
  agreesToTerms: boolean
}

/**
 * Interface para formulário PayPal/Visa
 * Dados específicos para pagamento internacional
 */
export interface PayPalFormData {
  email: string
  confirmEmail: string
  paymentType: 'paypal' | 'visa'
  // Campos opcionais para cartão Visa
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardHolder?: string
  agreesToTerms: boolean
}

/**
 * Interface para resultado de processamento
 * Retornada pelos métodos de pagamento
 */
export interface PaymentResult {
  success: boolean
  transactionId?: string
  errorCode?: string
  errorMessage?: string
}

/**
 * Interface para validação de dados
 * Retornada pela validação de formulários
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Interface para detalhes de erro
 * Mapeamento de códigos para mensagens amigáveis
 */
export interface ErrorDetails {
  title: string
  description: string
  severity: ErrorSeverity
}

/**
 * Interface para informações do método de pagamento
 * Usada para renderização condicional
 */
export interface PaymentMethodInfo {
  icon: React.ReactNode
  name: string
  color: string
  bgColor: string
  borderColor: string
  troubleshooting: string[]
}

/**
 * Interface para plano de assinatura
 * Dados do plano selecionado
 */
export interface SubscriptionPlan {
  id: PlanType
  name: string
  price: number
  description: string
  features: string[]
}

/**
 * Interface para dados da assinatura do usuário
 * Armazenada na base de dados
 */
export interface UserSubscription {
  id: string
  user_id: string
  plan_type: PlanType
  status: 'active' | 'inactive' | 'expired' | 'cancelled'
  start_date: string
  end_date: string
  transaction_id: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}

/**
 * Interface para transação de pagamento
 * Histórico de transações na base de dados
 */
export interface PaymentTransaction {
  id: string
  user_id: string
  transaction_id: string
  amount: number
  currency: 'MZN' | 'USD'
  status: TransactionStatus
  payment_method: PaymentMethod
  plan_type: PlanType
  processed_at: string
  created_at: string
  // Metadados adicionais
  metadata?: {
    phone_number?: string
    email?: string
    error_code?: string
    retry_count?: number
  }
}

/**
 * Interface para resposta da API de pagamento
 * Padronização das respostas das APIs externas
 */
export interface PaymentApiResponse {
  success: boolean
  transactionId?: string
  errorCode?: string
  errorMessage?: string
  metadata?: Record<string, any>
}

/**
 * Interface para configuração do provedor de pagamento
 * Configurações específicas por método
 */
export interface PaymentProviderConfig {
  mpesa: {
    apiUrl: string
    businessShortCode: string
    passkey: string
    callbackUrl: string
  }
  paypal: {
    clientId: string
    clientSecret: string
    environment: 'sandbox' | 'production'
    webhookUrl: string
  }
}

/**
 * Mapeamento de códigos de erro para mensagens
 * Usado para exibir mensagens amigáveis ao usuário
 */
export const ERROR_CODES: Record<string, ErrorDetails> = {
  INSUFFICIENT_FUNDS: {
    title: 'Saldo Insuficiente',
    description: 'Não tens saldo suficiente na tua conta para completar esta transação.',
    severity: 'medium'
  },
  INVALID_CARD: {
    title: 'Cartão Inválido',
    description: 'Os dados do cartão estão incorretos ou o cartão não é aceito.',
    severity: 'high'
  },
  NETWORK_ERROR: {
    title: 'Erro de Ligação',
    description: 'Problema de ligação durante o processamento. Tenta novamente.',
    severity: 'low'
  },
  MPESA_TIMEOUT: {
    title: 'Tempo Limite M-Pesa',
    description: 'Não recebemos confirmação do M-Pesa a tempo. Verifica o teu telemóvel.',
    severity: 'medium'
  },
  DECLINED: {
    title: 'Pagamento Recusado',
    description: 'O pagamento foi recusado pelo banco ou operadora.',
    severity: 'high'
  },
  VALIDATION_ERROR: {
    title: 'Dados Inválidos',
    description: 'Alguns dados fornecidos são inválidos. Verifica e tenta novamente.',
    severity: 'medium'
  },
  DATABASE_ERROR: {
    title: 'Erro do Sistema',
    description: 'Pagamento processado mas erro na ativação. Contacta o suporte.',
    severity: 'high'
  },
  UNEXPECTED_ERROR: {
    title: 'Erro Inesperado',
    description: 'Ocorreu um erro inesperado. Tenta novamente ou contacta o suporte.',
    severity: 'high'
  }
}

/**
 * Configurações padrão dos planos
 * Valores e características de cada plano
 */
export const SUBSCRIPTION_PLANS: Record<PlanType, SubscriptionPlan> = {
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 199,
    description: 'Para verdadeiros amantes da música moçambicana',
    features: [
      'Acesso ilimitado à música',
      'Qualidade de áudio premium',
      'Downloads offline',
      'Sem anúncios'
    ]
  },
  vip: {
    id: 'vip',
    name: 'VIP',
    price: 399,
    description: 'Experiência completa e exclusiva da cultura musical',
    features: [
      'Todos os benefícios Premium',
      'Acesso a videoclipes HD',
      'Conteúdo exclusivo',
      'Acesso antecipado a lançamentos',
      'Suporte prioritário'
    ]
  }
}

/**
 * Utilitários de tipo para TypeScript
 * Helpers para trabalhar com as interfaces
 */

// Tipo para props dos componentes de pagamento
export type PaymentComponentProps<T = any> = {
  data: T
  onSuccess?: (result: PaymentResult) => void
  onError?: (error: PaymentErrorData) => void
  onRetry?: () => void
  loading?: boolean
}

// Tipo para handlers de evento
export type PaymentEventHandler<T = any> = (data: T) => void | Promise<void>

// Tipo para parâmetros de URL de pagamento
export type PaymentUrlParams = {
  transactionId?: string
  method?: PaymentMethod
  planName?: string
  planPrice?: string
  userEmail?: string
  errorCode?: string
  errorMessage?: string
}

// Export default para facilitar importação
export default {
  ERROR_CODES,
  SUBSCRIPTION_PLANS
}