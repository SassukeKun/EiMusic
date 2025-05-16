'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PlayerBar from '@/components/PlayerBar'
import { Providers } from '@/utils/providers'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/artist/login' ||
    pathname === '/artist/register' ||
    pathname === '/auth/callback'

  // Interceptar tokens na URL e redirecionar para a página de callback
  useEffect(() => {
    // Ignorar este efeito na própria página de callback para evitar loops
    if (pathname === '/auth/callback') {
      return;
    }

    // Verificar se há tokens na URL (hash)
    if (
      typeof window !== 'undefined' && 
      window.location.hash && 
      (
        window.location.hash.includes('access_token=') || 
        window.location.hash.includes('refresh_token=') ||
        window.location.hash.includes('type=signup')
      )
    ) {
      router.push('/auth/callback');
    }
  }, [pathname, router]);

  return (
    <Providers>
      {isAuthPage ? (
        children
      ) : (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 max-w-7xl px-4 pb-24 bg-gray-50">
            {children}
          </main>
        </div>
      )}

      {!isAuthPage && <PlayerBar />}
    </Providers>
  )
} 