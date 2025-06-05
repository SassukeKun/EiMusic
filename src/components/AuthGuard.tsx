'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function AuthGuard({ 
  children,
  requireArtist = false 
}: { 
  children: React.ReactNode
  requireArtist?: boolean 
}) {
  const { user, isArtist, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login')
      } else if (requireArtist && !isArtist) {
        router.replace('/')
      }
    }
  }, [user, isArtist, loading, requireArtist, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || (requireArtist && !isArtist)) {
    return null
  }

  return <>{children}</>
}
