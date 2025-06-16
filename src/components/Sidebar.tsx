'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
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
  FaChevronRight,
  FaUserCircle,
  FaSignOutAlt,
  FaMusic,
  FaMicrophone,
  FaHeadphones
} from 'react-icons/fa'

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, isAuthenticated, logout, isArtist } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  // Função para fazer logout
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      // Não precisa redirecionar, pois o hook useAuth já faz isso
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Lista base de itens do menu
  const baseMenuItems = [
    { icon: <FaHome />, label: 'Home', href: '/' },
    { icon: <FaChartLine />, label: 'Trending', href: '/trending' },
    { icon: <FaCompass />, label: 'Explore', href: '/explore' },
    { icon: <FaMusic />, label: 'Músicas', href: '/musicas' },
    { icon: <FaVideo />, label: 'Vídeos', href: '/videos' },
    { icon: <FaUsers />, label: 'Comunidades', href: '/community' },
    { icon: <FaCalendarAlt />, label: 'Eventos', href: '/events' },
    { icon: <FaListUl />, label: 'Playlists', href: '/playlists' },
    { icon: <FaHeadphones />, label: 'Minha Biblioteca', href: '/library' },
    { icon: <FaMicrophone />, label: 'Artistas', href: '/artist' },
  ]
  
  // Adicionar o item de upload apenas se o usuário for um artista
  const uploadMenuItem = { icon: <FaUpload />, label: 'Upload', href: '/upload' }
  
  // Menu final filtrado baseado no tipo de usuário
  const menuItems = isArtist 
    ? [...baseMenuItems, uploadMenuItem] 
    : baseMenuItems;

  // Classes para a sidebar baseadas no estado
  const sidebarClasses = `
    fixed z-40 h-full flex flex-col transition-all duration-300
    ${isMobile 
      ? `${isOpen ? 'left-0' : '-left-full'} w-64 shadow-lg` 
      : `top-0 ${isCollapsed ? 'w-16' : 'w-64'} left-0`}
    bg-[#111111] text-[#ededed]
  `

  // Botão de toggle para desktop
  const ToggleButton = () => (
    <button 
      onClick={toggleSidebar}
      className="absolute -right-3 top-20 bg-[#222222] border border-[#333333] rounded-full p-1 shadow-md text-[#ededed] hover:bg-[#333333]"
      aria-label="Toggle sidebar"
    >
      {isCollapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
    </button>
  )

  // Botão de hambúrguer para mobile
  const MobileMenuButton = () => (
    <button 
      onClick={toggleSidebar}
      className="fixed top-4 left-4 z-50 bg-[#222222] p-2 rounded-md shadow-md text-[#ededed]"
      aria-label="Menu"
    >
      <FaBars />
    </button>
  )

  // Backdrop para fechar o menu no mobile quando clicado fora
  const Backdrop = () => (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-70 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={toggleSidebar}
    />
  )

  // Renderiza informações do usuário baseado no estado de autenticação
 const UserInfo = () => {
  if (loading) {
    return (
      <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'px-4'} mb-6 ${!isCollapsed || (isMobile && isOpen) ? 'space-x-3' : ''}`}>
        <div className="h-10 w-10 rounded-full bg-[#222222] animate-pulse"></div>
        {(!isCollapsed || (isMobile && isOpen)) && (
          <div className="space-y-2">
            <div className="h-4 w-24 bg-[#222222] rounded animate-pulse"></div>
            <div className="h-3 w-20 bg-[#222222] rounded animate-pulse"></div>
          </div>
        )}
      </div>
    )
  }

   if (!isAuthenticated) {
    return (
      <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'px-4'} mb-6 ${!isCollapsed || (isMobile && isOpen) ? 'space-x-3' : ''}`}>
        <div className="relative h-10 w-10 flex-shrink-0">
          <FaUserCircle className="h-10 w-10 text-[#ededed]" />
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-gray-500 rounded-full border-2 border-[#111111]"></div>
        </div>
        {(!isCollapsed || (isMobile && isOpen)) && (
          <div>
            <Link href="/login" className="text-sm font-semibold text-[#ededed] hover:text-yellow-400">Entrar</Link>
            <p className="text-xs text-gray-400">Visitante</p>
          </div>
        )}
      </div>
    )
  }

    // Dados do usuário autenticado
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuário';
  const userEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '/avatar.svg';
  const [imgError, setImgError] = useState(false);

  // 🔧 FUNÇÃO PARA NAVEGAR PARA O DASHBOARD DO ARTISTA
  const handleProfileClick = () => {
    if (isArtist) {
      // Se for artista, vai para o dashboard do artista
      window.location.href = '/artist/dashboard';
    } else {
      // Se for usuário comum, vai para o perfil do usuário
      window.location.href = '/profile';
    }
  };

    return (
    <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'px-4'} mb-6 ${!isCollapsed || (isMobile && isOpen) ? 'space-x-3' : ''}`}>
      {/* 🔧 CONTAINER DO PERFIL COM NAVEGAÇÃO */}
      <button
        onClick={handleProfileClick}
        className="flex items-center space-x-3 w-full text-left hover:bg-[#222222] rounded-lg p-2 transition-all duration-200 group cursor-pointer"
        title={isCollapsed && !isMobile ? (isArtist ? 'Dashboard do Artista' : 'Meu Perfil') : ''}
      >
        {imgError ? (
          <div className="h-10 w-10 flex-shrink-0 bg-[#222222] rounded-full flex items-center justify-center group-hover:bg-[#333333] transition-colors">
            <FaUserCircle className="h-8 w-8 text-[#ededed] group-hover:text-yellow-400 transition-colors" />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full border-2 border-[#333333] group-hover:border-yellow-400 overflow-hidden transition-colors">
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={40}
              height={40}
              className="rounded-full group-hover:scale-110 transition-transform duration-200"
              priority
              onError={() => setImgError(true)}
            />
          </div>
        )}
         {(!isCollapsed || (isMobile && isOpen)) && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-[#ededed] group-hover:text-yellow-400 transition-colors truncate">
                {userName}
              </p>
              {isArtist && (
                <span className="text-xs bg-yellow-600 text-black px-2 py-0.5 rounded-full font-medium">
                  Artista
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors truncate">
              {userEmail}
            </p>
            {/* 🔧 INDICADOR DE AÇÃO */}
            <p className="text-xs text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {isArtist ? 'Ir para Dashboard' : 'Ver Perfil'} →
            </p>
          </div>
        )}
      </button>
    </div>
  )
}
        
  return (
    <>
      {isMobile && <MobileMenuButton />}
      {isMobile && <Backdrop />}
      
      <aside className={sidebarClasses}>
        {!isMobile && <ToggleButton />}
        
        {/* Topo: logo + nome + icons */}
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} p-4`}>
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image 
                src="/musicSS.svg" 
                alt="EiMusic" 
                width={32} 
                height={32}
                className="drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]" 
                priority 
              />
            </div>
            {(!isCollapsed || (isMobile && isOpen)) && (
              <span className="text-xl font-bold text-[#FFDF00]">
                EiMusic
              </span>
            )}
          </div>
          
          {(!isCollapsed || (isMobile && isOpen)) && (
            <div className="flex items-center space-x-3 text-[#ededed]">
              <FaCog className="text-xl hover:text-yellow-400 cursor-pointer transition" />
              <div className="relative">
                <FaBell className="text-xl hover:text-yellow-400 cursor-pointer transition" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Info Component */}
        <div className="mt-4">
        <UserInfo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto scrollbar-hide py-2">
          {menuItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'px-3'} py-2 rounded-lg transition
                  ${isActive
                    ? 'bg-gradient-to-r from-[#FF0000] via-[#FFDF00] to-[#FF6600] text-white shadow-md'
                    : 'text-[#ededed] hover:bg-[#222222]'}
                `}
                title={isCollapsed && !isMobile ? item.label : ''}
              >
                <span className={`text-lg ${!isCollapsed || (isMobile && isOpen) ? 'mr-3' : ''}`}>
                  {item.icon}
                </span>
                {(!isCollapsed || (isMobile && isOpen)) && (
                  <span>{item.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="px-3 py-2">
          <div className="h-px bg-[#222222]"></div>
        </div>

        {/* Logout Button - Only show when authenticated */}
        {isAuthenticated && (
          <div className="px-2 pb-4">
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className={`
                w-full flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'px-3'} py-2 rounded-lg transition
                text-red-400 hover:bg-[#331111] disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title={isCollapsed && !isMobile ? 'Sair' : ''}
            >
              <span className={`text-lg ${!isCollapsed || (isMobile && isOpen) ? 'mr-3' : ''}`}>
                {isLoggingOut ? (
                  <div className="animate-spin h-5 w-5 border-2 border-red-400 rounded-full border-t-transparent"></div>
                ) : (
                  <FaSignOutAlt />
                )}
              </span>
              {(!isCollapsed || (isMobile && isOpen)) && (
                <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        {(!isCollapsed || (isMobile && isOpen)) && (
          <div className="p-4 text-sm text-gray-500">
            © 2025 EiMusic
          </div>
        )}
      </aside>
      
      {/* Espaçador para empurrar o conteúdo para a direita */}
      <div className={`${isMobile ? 'hidden' : `block transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}`} />
    </>
  )
}