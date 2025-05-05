'use client'
import '../../styles/globals.css'
import { usePathname } from 'next/navigation'
import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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
      <body className={isAuthPage ? '' : 'pb-24'}>
        {/* Auth pages: apenas children */}
        {isAuthPage ? (
          children
        ) : (
          <div className="flex">
            <Sidebar />
            <main className="ml-64 flex-1">{children}</main>
          </div>
        )}

        {/* Header/Footer para outras páginas */}
        {!isAuthPage && <PlayerBar />}
      </body>
    </html>
  )
}
