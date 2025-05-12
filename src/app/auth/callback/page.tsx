'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabaseClient'
import authService from '@/services/authService'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Process the OAuth callback by Supabase Auth
    const handleAuthCallback = async () => {
      try {
        // Get session from URL hash
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting auth session:', error.message)
          return router.push('/login?error=auth_callback_error')
        }
        
        if (!data?.session) {
          console.error('No session found in callback')
          return router.push('/login?error=no_session')
        }
        
        // Check if user is an artist
        try {
          const isArtist = await authService.isArtist()
          
          // Redirect based on user type
          if (isArtist) {
            router.push('/artist/dashboard')
          } else {
            router.push('/dashboard')
          }
        } catch (artistError) {
          console.error('Error checking if user is artist:', artistError)
          // Default to user dashboard if we can't determine artist status
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=callback_processing')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#006600] via-[#FFDF00] to-[#FF0000]">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">Finalizando autenticação...</h2>
        <p className="text-gray-600">Você será redirecionado em instantes.</p>
      </div>
    </div>
  )
} 