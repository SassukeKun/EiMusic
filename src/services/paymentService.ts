// Interfaces simples para o serviço
interface PaymentProcessData {
  method: 'mpesa' | 'paypal'
  planName: string
  planPrice: number
  userEmail: string
  formData: any
}

interface PaymentResult {
  success: boolean
  transactionId?: string
  errorCode?: string
  errorMessage?: string
}

/**
 * Serviço de pagamento simplificado
 * Funciona sem dependências externas complexas
 */
class PaymentService {

  /**
   * Processa pagamento via M-Pesa (simulado)
   */
  private async processMpesaPayment(data: PaymentProcessData): Promise<PaymentResult> {
    try {
      // Simulação de processamento M-Pesa
      console.log('Processando pagamento M-Pesa:', {
        phone: data.formData.phoneNumber,
        amount: data.planPrice,
        plan: data.planName
      })

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Simular resultado (85% sucesso, 15% erro para teste)
      const isSuccess = Math.random() > 0.15

      if (isSuccess) {
        return {
          success: true,
          transactionId: `MPESA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      } else {
        // Simular diferentes tipos de erro
        const errors = [
          { code: 'INSUFFICIENT_FUNDS', message: 'Saldo insuficiente na conta M-Pesa' },
          { code: 'MPESA_TIMEOUT', message: 'Tempo limite esgotado. Verifica o teu telemóvel.' },
          { code: 'NETWORK_ERROR', message: 'Erro de ligação. Tenta novamente.' }
        ]
        const randomError = errors[Math.floor(Math.random() * errors.length)]
        
        return {
          success: false,
          errorCode: randomError.code,
          errorMessage: randomError.message
        }
      }
    } catch (error) {
      console.error('Erro no pagamento M-Pesa:', error)
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Erro de ligação. Tenta novamente.'
      }
    }
  }

  /**
   * Processa pagamento via PayPal/Visa (simulado)
   */
  private async processPayPalPayment(data: PaymentProcessData): Promise<PaymentResult> {
    try {
      // Simulação de processamento PayPal
      console.log('Processando pagamento PayPal/Visa:', {
        email: data.formData.email,
        type: data.formData.paymentType,
        amount: data.planPrice,
        plan: data.planName
      })

      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simular resultado (80% sucesso, 20% erro para teste)
      const isSuccess = Math.random() > 0.20

      if (isSuccess) {
        return {
          success: true,
          transactionId: `PAYPAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      } else {
        // Simular diferentes tipos de erro
        const errors = [
          { code: 'INVALID_CARD', message: 'Dados do cartão incorretos ou cartão inválido' },
          { code: 'DECLINED', message: 'Pagamento recusado pelo banco' },
          { code: 'NETWORK_ERROR', message: 'Erro de ligação. Tenta novamente.' }
        ]
        const randomError = errors[Math.floor(Math.random() * errors.length)]
        
        return {
          success: false,
          errorCode: randomError.code,
          errorMessage: randomError.message
        }
      }
    } catch (error) {
      console.error('Erro no pagamento PayPal:', error)
      return {
        success: false,
        errorCode: 'NETWORK_ERROR',
        errorMessage: 'Erro de ligação. Tenta novamente.'
      }
    }
  }

  /**
   * Simula atualização da assinatura (sem Supabase)
   */
  private async updateUserSubscription(
    userEmail: string, 
    planName: string, 
    transactionId: string
  ): Promise<boolean> {
    try {
      // Simulação de atualização da base de dados
      console.log('Atualizando assinatura:', {
        email: userEmail,
        plan: planName,
        transactionId: transactionId,
        status: 'active'
      })

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Aqui seria feita a integração real com Supabase
      // Por agora, simulamos sucesso
      return true

    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error)
      return false
    }
  }

  /**
   * Método principal para processar pagamento
   */
  async processPayment(data: PaymentProcessData): Promise<string> {
    let result: PaymentResult

    // Processar baseado no método de pagamento
    switch (data.method) {
      case 'mpesa':
        result = await this.processMpesaPayment(data)
        break
      case 'paypal':
        result = await this.processPayPalPayment(data)
        break
      default:
        result = {
          success: false,
          errorCode: 'INVALID_METHOD',
          errorMessage: 'Método de pagamento inválido'
        }
    }

    if (result.success && result.transactionId) {
      // Atualizar assinatura na base de dados
      const subscriptionUpdated = await this.updateUserSubscription(
        data.userEmail,
        data.planName,
        result.transactionId
      )

      if (subscriptionUpdated) {
        // Construir URL de sucesso com parâmetros
        const successParams = new URLSearchParams({
          transactionId: result.transactionId,
          method: data.method,
          planName: data.planName,
          planPrice: data.planPrice.toString(),
          userEmail: data.userEmail
        })

        return `/payment/success?${successParams.toString()}`
      } else {
        // Erro na atualização da base de dados
        const errorParams = new URLSearchParams({
          errorCode: 'DATABASE_ERROR',
          errorMessage: 'Pagamento processado mas erro na ativação. Contacta o suporte.',
          method: data.method,
          planName: data.planName,
          planPrice: data.planPrice.toString(),
          transactionId: result.transactionId
        })

        return `/payment/error?${errorParams.toString()}`
      }
    } else {
      // Construir URL de erro com parâmetros
      const errorParams = new URLSearchParams({
        errorCode: result.errorCode || 'UNKNOWN_ERROR',
        errorMessage: result.errorMessage || 'Erro desconhecido',
        method: data.method,
        planName: data.planName,
        planPrice: data.planPrice.toString()
      })

      return `/payment/error?${errorParams.toString()}`
    }
  }

  /**
   * Validar dados do formulário
   */
  validatePaymentData(data: PaymentProcessData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validações gerais
    if (!data.userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userEmail)) {
      errors.push('Email inválido')
    }

    if (!data.planName || !data.planPrice) {
      errors.push('Dados do plano inválidos')
    }

    // Validações específicas por método
    if (data.method === 'mpesa') {
      if (!data.formData.phoneNumber) {
        errors.push('Número de telefone obrigatório')
      } else if (!/^(\+258|258|0)?[8][2-7][0-9]{7}$/.test(data.formData.phoneNumber.replace(/\s/g, ''))) {
        errors.push('Formato de número M-Pesa inválido')
      }

      if (!data.formData.agreesToTerms) {
        errors.push('Deve aceitar os termos e condições')
      }
    } else if (data.method === 'paypal') {
      if (!data.formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.formData.email)) {
        errors.push('Email PayPal inválido')
      }

      if (data.formData.paymentType === 'visa') {
        if (!data.formData.cardNumber || !data.formData.expiryDate || !data.formData.cvv || !data.formData.cardHolder) {
          errors.push('Dados do cartão incompletos')
        }
      }

      if (!data.formData.agreesToTerms) {
        errors.push('Deve aceitar os termos e condições')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Método para testar o serviço
   */
  async testPayment(method: 'mpesa' | 'paypal' = 'mpesa'): Promise<string> {
    const testData: PaymentProcessData = {
      method: method,
      planName: 'Premium',
      planPrice: 199,
      userEmail: 'teste@exemplo.com',
      formData: method === 'mpesa' ? {
        phoneNumber: '+258 84 123 4567',
        confirmPhoneNumber: '+258 84 123 4567',
        agreesToTerms: true
      } : {
        email: 'teste@paypal.com',
        confirmEmail: 'teste@paypal.com',
        paymentType: 'paypal',
        agreesToTerms: true
      }
    }

    return await this.processPayment(testData)
  }
}

// Exportar instância singleton
export const paymentService = new PaymentService()
export default paymentService
