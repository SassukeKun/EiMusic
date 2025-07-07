'use client'

import { useRouter } from 'next/navigation'

export default function PaymentSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Pagamento concluído com sucesso!</h1>
      <p className="mb-8 text-gray-300 text-center max-w-md">
        O teu pagamento foi processado e a tua subscrição encontra-se activa.
      </p>
      <button
        onClick={() => router.push('/')}
        className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg font-medium"
      >
        Ir para Página Inicial
      </button>
    </div>
  )
}