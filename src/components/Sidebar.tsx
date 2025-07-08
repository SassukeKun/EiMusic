'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { getSupabaseBrowserClient } from '@/utils/supabaseClient'
import {
  FaHome,
  FaChartLine,
  FaCompass,
  FaVideo,
  FaUsers,
  FaCalendarAlt,
  FaListUl,
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
  FaHeadphones,
  FaTimes,
  FaCheck,
  FaMoon,
  FaGlobe,
  FaLock,
  FaTrash,
  FaCircle
} from 'react-icons/fa'

// Interface para notificações
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  important: boolean
}

// Interface para configurações
interface Settings {
  theme: 'dark' | 'light'
  language: 'pt' | 'en'
  notifications: {
    enabled: boolean
    email: boolean
    push: boolean
    marketing: boolean
  }
  privacy: {
    profilePublic: boolean
    showActivity: boolean
    allowMessages: boolean
  }
}

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user, loading, isAuthenticated, logout, isArtist } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const supabase = getSupabaseBrowserClient();
  const [dbName, setDbName] = useState<string | null>(null);
  const [dbEmail, setDbEmail] = useState<string | null>(null);
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);

  // Remove espaços em branco do URL do avatar
  const avatarUrl = dbAvatar?.trim() || '/avatar.svg';

  // Busca nome do usuário ou artista dependendo do tipo
  useEffect(() => {
    if (!user?.id) return;
    const fetchCredentials = async () => {
      if (isArtist) {
        // Busca dados do artista
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('name, email, profile_image_url')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!artistError && artistData?.name) {
          setDbName(artistData.name as string);
          setDbEmail(artistData.email as string);
          setDbAvatar(artistData.profile_image_url as string);
          return;
        }
      }

      // Busca dados do usuário normal
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email, profile_image_url')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!userError && userData?.name) {
        setDbName(userData.name as string);
        setDbEmail(userData.email as string);
        setDbAvatar(userData.profile_image_url as string);
      }
    };
    fetchCredentials();
  }, [user, supabase, isArtist]);

  // Estados para mini-modals
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  
  // Refs para detectar cliques fora dos modals
  const settingsRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Estados para configurações
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    language: 'pt',
    notifications: {
      enabled: true,
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profilePublic: true,
      showActivity: true,
      allowMessages: true
    }
  })

  // Mock data para notificações
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nova música curtida',
      message: 'Sua música "Maputo Nights" recebeu 100 curtidas!',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      read: false,
      important: false
    },
    {
      id: '2',
      title: 'Artista te seguiu',
      message: 'DJ Tarico Jr começou a te seguir',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
      read: false,
      important: true
    },
    {
      id: '3',
      title: 'Playlist atualizada',
      message: 'Nova música adicionada à "Top Moçambique 2025"',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
      read: true,
      important: false
    },
    {
      id: '4',
      title: 'Pagamento processado',
      message: 'Seus ganhos de dezembro foram processados',
      type: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
      read: true,
      important: true
    }
  ])

  // Estados para filtros de notificações
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread' | 'important'>('all')

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

  // Fechar modals ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSettingsModal(false)
        setShowNotificationsModal(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Fechar modals ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsModal(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    } catch (error) {
      console.log('Erro ao fazer logout:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Função para filtrar notificações
  const getFilteredNotifications = () => {
    switch (notificationFilter) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'important':
        return notifications.filter(n => n.important)
      default:
        return notifications
    }
  }

  // Função para marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  // Função para deletar notificação
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Contar notificações não lidas
  const unreadCount = notifications.filter(n => !n.read).length

  // Função para formatar tempo
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  // Lista base de itens do menu
  const baseMenuItems = [
    { icon: <FaHome />, label: 'Home', href: '/' },
    { icon: <FaChartLine />, label: 'Trending', href: '/trending' },
    { icon: <FaCompass />, label: 'Explore', href: '/explore' },
    { icon: <FaMusic />, label: 'Músicas', href: '/track' },
    { icon: <FaVideo />, label: 'Vídeos', href: '/videos' },
    { icon: <FaUsers />, label: 'Comunidades', href: '/community' },
    { icon: <FaCalendarAlt />, label: 'Eventos', href: '/events' },
    { icon: <FaListUl />, label: 'Playlists', href: '/playlists' },
    // { icon: <FaHeadphones />, label: 'Minha Biblioteca', href: '/library' },
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
  const userName = dbName || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Usuário';
  const userEmail = dbEmail || user?.email || '';
  const avatarUrl = dbAvatar || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '/avatar.svg';
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

  // Modal de Configurações
  const SettingsModal = () => (
    <AnimatePresence>
      {showSettingsModal && (
        <motion.div
          ref={settingsRef}
          className={`fixed bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl w-80 h-96 overflow-hidden z-50 ${
            isCollapsed ? 'left-20' : 'left-72'
          } top-4`}
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCog className="text-white text-lg" />
              <h3 className="text-white font-semibold">Configurações</h3>
            </div>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-4 space-y-4 h-full overflow-y-auto">
            {/* Tema */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FaMoon className="text-purple-400" />
                Tema
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Escuro
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm transition-all ${
                    settings.theme === 'light'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Claro
                </button>
              </div>
            </div>

            {/* Idioma */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FaGlobe className="text-blue-400" />
                Idioma
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'pt' | 'en' }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="pt">Português</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Notificações */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FaBell className="text-yellow-400" />
                Notificações
              </label>
              <div className="space-y-2">
                {[
                  { key: 'enabled', label: 'Ativar notificações' },
                  { key: 'email', label: 'Notificações por email' },
                  { key: 'push', label: 'Notificações push' },
                  { key: 'marketing', label: 'Email marketing' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{label}</span>
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [key]: !prev.notifications[key as keyof typeof prev.notifications]
                        }
                      }))}
                      className={`w-10 h-5 rounded-full transition-all ${
                        settings.notifications[key as keyof typeof settings.notifications]
                          ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.notifications[key as keyof typeof settings.notifications]
                          ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacidade */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <FaLock className="text-green-400" />
                Privacidade
              </label>
              <div className="space-y-2">
                {[
                  { key: 'profilePublic', label: 'Perfil público' },
                  { key: 'showActivity', label: 'Mostrar atividade' },
                  { key: 'allowMessages', label: 'Permitir mensagens' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{label}</span>
                    <button
                      onClick={() => setSettings(prev => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          [key]: !prev.privacy[key as keyof typeof prev.privacy]
                        }
                      }))}
                      className={`w-10 h-5 rounded-full transition-all ${
                        settings.privacy[key as keyof typeof settings.privacy]
                          ? 'bg-green-600' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.privacy[key as keyof typeof settings.privacy]
                          ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Modal de Notificações
  const NotificationsModal = () => (
    <AnimatePresence>
      {showNotificationsModal && (
        <motion.div
          ref={notificationsRef}
          className={`fixed bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl w-80 h-96 overflow-hidden z-50 ${
            isCollapsed ? 'left-20' : 'left-72'
          } top-4`}
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaBell className="text-white text-lg" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <h3 className="text-white font-semibold">Notificações</h3>
            </div>
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Filtros */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'unread', label: 'Não lidas' },
                { key: 'important', label: 'Importantes' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setNotificationFilter(key as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    notificationFilter === key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="flex-1 overflow-y-auto">
            {getFilteredNotifications().length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FaBell className="mx-auto text-2xl mb-2 opacity-50" />
                <p className="text-sm">Nenhuma notificação encontrada</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {getFilteredNotifications().map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all hover:bg-gray-700/50 ${
                      notification.read
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-purple-600/10 border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FaCircle className={`text-xs ${
                            notification.type === 'success' ? 'text-green-400' :
                            notification.type === 'warning' ? 'text-yellow-400' :
                            notification.type === 'error' ? 'text-red-400' : 'text-blue-400'
                          }`} />
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          {notification.important && (
                            <FaLock className="text-yellow-400 text-xs" />
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                            title="Marcar como lida"
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Deletar"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
              {/* Botão de Configurações */}
              <button
                onClick={() => {
                  setShowSettingsModal(!showSettingsModal)
                  setShowNotificationsModal(false) // Fechar notificações se abertas
                }}
                className={`text-xl hover:text-yellow-400 cursor-pointer transition-all duration-300 ${
                  showSettingsModal ? 'text-yellow-400 scale-110' : ''
                }`}
                title="Configurações"
              >
                <FaCog />
              </button>

              {/* Botão de Notificações */}
              <button
                onClick={() => {
                  setShowNotificationsModal(!showNotificationsModal)
                  setShowSettingsModal(false) // Fechar configurações se abertas
                }}
                className={`relative text-xl hover:text-yellow-400 cursor-pointer transition-all duration-300 ${
                  showNotificationsModal ? 'text-yellow-400 scale-110' : ''
                }`}
                title="Notificações"
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
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

      {/* Modals */}
      <SettingsModal />
      <NotificationsModal />
    </>
  )
}