'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import supabase from '@/utils/supabaseClient'
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState<string>('Autenticando...')

  useEffect(() => {
    // Função para processar o retorno da autenticação
    async function handleAuthCallback() {
      try {
        // Verificar se existe um redirect_to nos parâmetros
        const redirectTo = searchParams?.get('redirect_to') || '/'
        
        // Recupera a sessão
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao processar callback de autenticação:', error)
          setStatus('error')
          setMessage('Falha na autenticação. Por favor, tente novamente.')
          // Redirecionar após 2 segundos
          setTimeout(() => router.push('/login?error=auth_callback_failed'), 2000)
          return
        }
        
        if (data?.session) {
          // Verificar se o email está confirmado
          const { data: userData } = await supabase.auth.getUser()
          
          if (!userData?.user?.email_confirmed_at) {
            // Email não confirmado, redirecionar para a página de verificação
            setStatus('error')
            setMessage('Email ainda não verificado. Por favor, verifique sua caixa de entrada.')
            
            // Redirecionar para a página de verificação após 2 segundos
            setTimeout(() => {
              const email = userData?.user?.email
              const isArtist = userData?.user?.user_metadata?.is_artist
              const type = isArtist ? 'artist' : 'user'
              
              if (email) {
                router.push(`/auth/verification?email=${encodeURIComponent(email)}&type=${type}`)
              } else {
                router.push('/login')
              }
            }, 2000)
            return
          }
          
          // Email confirmado, verificar se é artista
          setStatus('success')
          setMessage('Autenticação concluída com sucesso!')
          
          // Redirecionar para a página apropriada após 1 segundo
          setTimeout(() => {
            if (userData?.user?.user_metadata?.is_artist) {
              router.push(redirectTo !== '/' ? redirectTo : '/artist/dashboard')
          } else {
              router.push(redirectTo !== '/' ? redirectTo : '/dashboard')
          }
          }, 1000)
          return
        }
        
        // Se não tem sessão, redirecionar para login
        setStatus('error')
        setMessage('Sessão não encontrada. Por favor, faça login novamente.')
        setTimeout(() => router.push('/login'), 2000)
      } catch (error) {
        console.error('Exceção ao processar callback de autenticação:', error)
        setStatus('error')
        setMessage('Ocorreu um erro inesperado. Por favor, tente novamente.')
        setTimeout(() => router.push('/login?error=auth_callback_exception'), 2000)
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-black">
      <div className="bg-black bg-opacity-20 backdrop-blur-sm rounded-lg p-8 shadow-lg max-w-md w-full">
        {status === 'loading' && (
          <>
            <div className="text-4xl text-yellow-500 animate-spin mb-4 flex justify-center">
              <FaSpinner />
            </div>
            <h1 className="text-xl text-white font-medium text-center">{message}</h1>
            <p className="text-gray-300 mt-2 text-center">Você será redirecionado automaticamente.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-4xl text-green-500 mb-4 flex justify-center">
              <FaCheckCircle />
            </div>
            <h1 className="text-xl text-white font-medium text-center">{message}</h1>
            <p className="text-gray-300 mt-2 text-center">Redirecionando para sua área...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl text-red-500 mb-4 flex justify-center">
              <FaExclamationTriangle />
            </div>
            <h1 className="text-xl text-white font-medium text-center">{message}</h1>
            <p className="text-gray-300 mt-2 text-center">Redirecionando...</p>
          </>
        )}
      </div>
    </div>
  )
} 