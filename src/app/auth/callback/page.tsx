'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import supabase from '@/utils/supabaseClient'
import { FaSpinner } from 'react-icons/fa'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Função para processar o retorno da autenticação
    async function handleAuthCallback() {
      try {
        // Verifica se há fragmentos na URL (tokens após #)
        const hashParams = window.location.hash
        
        // Verificar se existe um redirect_to nos parâmetros
        const redirectTo = searchParams?.get('redirect_to') || '/'
        
        if (hashParams) {
          // Recupera a sessão a partir dos parâmetros de hash
          const { data, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Erro ao processar callback de autenticação:', error)
            router.push('/login?error=auth_callback_failed')
            return
          }
          
          if (data?.session) {
            // Verificar se o usuário é artista para redirecionar à página correta
            const { data: userData } = await supabase.auth.getUser()
            
            if (userData?.user?.user_metadata?.is_artist) {
              router.push(redirectTo || '/artist/dashboard')
            } else {
              router.push(redirectTo || '/dashboard')
            }
            return
          }
        }
        
        // Se não tem hash ou sessão mas tem redirect_to, tentar usar esse redirect
        if (redirectTo && redirectTo !== '/') {
          // Verificar se já existe uma sessão 
          const { data } = await supabase.auth.getSession()
          if (data?.session) {
            router.push(redirectTo)
            return
          }
        }
        
        // Fallback para login se nada funcionar
        router.push('/login')
      } catch (error) {
        console.error('Exceção ao processar callback de autenticação:', error)
        router.push('/login?error=auth_callback_exception')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-black">
      <div className="text-4xl text-yellow-500 animate-spin mb-4">
        <FaSpinner />
      </div>
      <h1 className="text-xl text-white font-medium">Autenticando...</h1>
      <p className="text-gray-300 mt-2">Você será redirecionado automaticamente.</p>
    </div>
  )
} 