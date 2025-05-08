'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  FaHome,
  FaChartLine,
  FaCompass,
  FaVideo,
  FaUsers,
  FaCalendarAlt,
  FaListUl,
  FaBook,
  FaUpload,
  FaCog,
  FaBell,
  FaBars,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Detecta se a tela é móvel e configura o estado inicial
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true)
        setIsCollapsed(true)
      } else {
        setIsMobile(false)
        setIsCollapsed(false)
      }
    }

    // Verificação inicial
    checkScreenSize()

    // Adiciona event listener para mudanças de tamanho da tela
    window.addEventListener('resize', checkScreenSize)

    // Cleanup do event listener
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  const menuItems = [
    { icon: <FaHome />, label: 'Home', href: '/' },
    { icon: <FaChartLine />, label: 'Trending', href: '/trending' },
    { icon: <FaCompass />, label: 'Explore', href: '/explore' },
    { icon: <FaVideo />, label: 'Vídeos', href: '/videos' },
    { icon: <FaUsers />, label: 'Comunidades', href: '/communities' },
    { icon: <FaCalendarAlt />, label: 'Eventos', href: '/events' },
    { icon: <FaListUl />, label: 'Playlists', href: '/playlists' },
    { icon: <FaBook />, label: 'Library', href: '/library' },
    { icon: <FaUpload />, label: 'Upload', href: '/upload' }
  ]

  // Classes para a sidebar baseadas no estado
  const sidebarClasses = `
    fixed z-40 h-full bg-gray text-gray-700 flex flex-col border-r transition-all duration-300
    ${isMobile 
      ? `${isOpen ? 'left-0' : '-left-full'} w-64 shadow-lg` 
      : `top-0 ${isCollapsed ? 'w-16' : 'w-64'} left-0`}
  `

  // Botão de toggle para desktop
  const ToggleButton = () => (
    <button 
      onClick={toggleSidebar}
      className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md text-gray-500 hover:text-gray-700"
      aria-label="Toggle sidebar"
    >
      {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
    </button>
  )

  // Botão de hambúrguer para mobile
  const MobileMenuButton = () => (
    <button 
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md text-gray-700"
      aria-label="Menu"
    >
      <FaBars />
    </button>
  )

  // Backdrop para fechar o menu no mobile quando clicado fora
  const Backdrop = () => (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={toggleSidebar}
    />
  )

  return (
    <>
      {isMobile && <MobileMenuButton />}
      {isMobile && <Backdrop />}
      
      <aside className={sidebarClasses}>
        {!isMobile && <ToggleButton />}
        
        {/* Topo: logo + nome + icons */}
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} p-4`}>
          <div className="flex items-center space-x-2">
            <Image src="/musicSS.svg" alt="EiMusic" width={32} height={32} priority />
            {(!isCollapsed || (isMobile && isOpen)) && (
              <span className="text-xl font-bold">EiMusic</span>
            )}
          </div>
          
          {(!isCollapsed || (isMobile && isOpen)) && (
            <div className="flex items-center space-x-3 text-gray-500">
              <FaCog className="text-xl hover:text-gray-700 cursor-pointer transition" />
              <FaBell className="text-xl hover:text-gray-700 cursor-pointer transition" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'px-4'} mb-6 ${!isCollapsed || (isMobile && isOpen) ? 'space-x-3' : ''}`}>
          <Image
            src="/avatar.svg"
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
          {(!isCollapsed || (isMobile && isOpen)) && (
            <div>
              <p className="text-sm font-semibold">Allallito-X</p>
              <p className="text-xs text-gray-500">@allennsantos07</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'px-3'} py-2 rounded-lg transition
                  ${isActive
                    ? 'bg-gradient-to-r from-[#006600] via-[#FFDF00] to-[#FF0000] text-white'
                    : 'hover:bg-gray-100'}
                `}
                title={isCollapsed && !isMobile ? item.label : ''}
              >
                <span className={`text-lg ${!isCollapsed || (isMobile && isOpen) ? 'mr-3' : ''}`}>{item.icon}</span>
                {(!isCollapsed || (isMobile && isOpen)) && (
                  <span>{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        {(!isCollapsed || (isMobile && isOpen)) && (
          <div className="p-4 text-sm text-gray-500">© 2025 EiMusic</div>
        )}
      </aside>
      
      {/* Espaçador para empurrar o conteúdo para a direita */}
      <div className={`${isMobile ? 'hidden' : `block transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}`} />
    </>
  )
}