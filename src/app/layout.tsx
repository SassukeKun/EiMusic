'use client'
import '../../styles/globals.css'
import { usePathname } from 'next/navigation'
import React from 'react'
import Sidebar from '@/components/Sidebar'
import PlayerBar from '@/components/PlayerBar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/artist/login' ||
    pathname === '/artist/register'

  return (
    <html lang="pt-PT">
      <head />
      <body className={isAuthPage ? '' : 'pb-24 bg-gray-50'}>
        {isAuthPage ? (
          children
        ) : (
          <div className="flex">
            <Sidebar />
            <main className="flex-1 max-w-7xl px-4">
              {children}
            </main>
          </div>
        )}

        {!isAuthPage && <PlayerBar />}
      </body>
    </html>
  )
}
