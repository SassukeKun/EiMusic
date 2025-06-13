// src/components/ClientLayout.tsx
'use client'

import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import PlayerBar from '@/components/PlayerBar'
import { Providers } from '@/utils/providers'


export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/artist/login' ||
    pathname === '/artist/register' ||
    pathname === '/auth/callback'

  return (
    <Providers>
      <div className="flex flex-col min-h-screen bg-gray-900"> {/* Garante que o fundo seja escuro */}
        {isAuthPage ? (
          children
        ) : (
          <div className="flex flex-grow overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-gray-900"> {/* Garante que o conteúdo também tenha fundo escuro */}
              {children}
            </main>
          </div>
        )}

        {!isAuthPage && <PlayerBar />}
      </div>
    </Providers>
  )
}