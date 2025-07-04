// 📁 CAMINHO: src/components/PaymentTestButtons.tsx
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentTestButtons() {
  const router = useRouter()

  console.log('🧪 PaymentTestButtons renderizado!') // Para debug

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-lg shadow-lg"
      style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999 }}
    >
      <h3 className="text-sm font-bold mb-2">🧪 Teste Pagamento</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => {
            console.log('Clicou Premium!')
            router.push('/payment?plan=premium&name=Premium&price=199')
          }}
          className="block w-full bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-sm"
        >
          🟡 Premium (199 MT)
        </button>
        
        <button
          onClick={() => {
            console.log('Clicou VIP!')
            router.push('/payment?plan=vip&name=VIP&price=399')
          }}
          className="block w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
        >
          💎 VIP (399 MT)
        </button>

        <button
          onClick={() => {
            console.log('Clicou Sucesso!')
            const params = new URLSearchParams({
              transactionId: `TEST_${Date.now()}`,
              method: 'mpesa',
              planName: 'Premium',
              planPrice: '199',
              userEmail: 'teste@exemplo.com'
            })
            router.push(`/payment/success?${params.toString()}`)
          }}
          className="block w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
        >
          ✅ Tela Sucesso
        </button>

        <button
          onClick={() => {
            console.log('Clicou Erro!')
            const params = new URLSearchParams({
              errorCode: 'NETWORK_ERROR',
              errorMessage: 'Erro de ligação. Tenta novamente.',
              method: 'mpesa',
              planName: 'Premium',
              planPrice: '199'
            })
            router.push(`/payment/error?${params.toString()}`)
          }}
          className="block w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm"
        >
          ❌ Tela Erro
        </button>
      </div>
    </div>
  )
}