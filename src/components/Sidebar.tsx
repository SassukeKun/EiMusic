// src/components/Sidebar.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

// Importações de ícones
import { 
  FaHome, 
  FaChartLine, 
  FaCompass, 
  FaVideo, 
  FaUsers, 
  FaCalendarAlt, 
  FaList, 
  FaBook, 
  FaUpload, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa'

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Lista de itens da navegação - agora com "Sair" incluído na mesma lista
  const navItems = [
    { name: 'Home', href: '/', icon: <FaHome /> },
    { name: 'Trending', href: '/trending', icon: <FaChartLine /> },
    { name: 'Explore', href: '/explore', icon: <FaCompass /> },
    { name: 'Videos', href: '/videos', icon: <FaVideo /> },
    { name: 'Comunidades', href: '/communities', icon: <FaUsers /> },
    { name: 'Eventos', href: '/events', icon: <FaCalendarAlt /> },
    { name: 'Playlists', href: '/playlists', icon: <FaList /> },
    { name: 'Library', href: '/library', icon: <FaBook /> },
    { name: 'Upload', href: '/upload', icon: <FaUpload /> },
  ]

  // Função para verificar se um link está ativo
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  // Manipulador para alternar o estado de collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed)
  }

  // Manipulador para alternar a barra lateral em dispositivos móveis
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  // Animação para o botão de hamburger em dispositivos móveis
  const mobileButtonVariants = {
    open: { rotate: 0 },
    closed: { rotate: 180 },
  }

  return (
    <>
      {/* Botão de menu para dispositivos móveis */}
      <button 
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 bg-gray-800 p-2 rounded-full md:hidden text-white shadow-lg"
      >
        <motion.div
          animate={mobileOpen ? "open" : "closed"}
          variants={mobileButtonVariants}
          transition={{ duration: 0.3 }}
        >
          {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </motion.div>
      </button>

      {/* Sidebar principal */}
      <motion.div 
        className={`
          fixed top-0 left-0 h-screen z-40 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 border-r border-gray-800
          transition-all duration-300 ease-in-out shadow-xl flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-20' : 'w-64'}
          md:relative md:block
        `}
      >
        {/* Logo e cabeçalho */}
        <div className={`p-5 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link href="/" className="flex items-center">
            {collapsed ? (
              <div className="w-10 h-10 relative">
                <Image 
                  src="/musicSS.svg"
                  alt="EiMusic"
                  fill
                  className="rounded-full object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-10 h-10 relative mr-3">
                  <Image 
                    src="/musicSS.svg"
                    alt="EiMusic"
                    fill
                    className="rounded-full object-contain"
                  />
                </div>
                <span className="text-lg font-bold text-white">EiMusic</span>
              </div>
            )}
          </Link>
          
          {!collapsed && (
            <button 
              onClick={toggleCollapse}
              className="text-gray-400 hover:text-white transition-colors hidden md:block"
            >
              <FaBars />
            </button>
          )}
        </div>

        {/* Informações do usuário */}
        {!collapsed && (
          <div className="px-5 py-3 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image 
                  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=400&q=80"
                  alt="User"
                  fill
                  className="rounded-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">Wen Xuan</h3>
                <p className="text-xs text-gray-400 truncate">daiwenxuam78@gmail.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Links de navegação */}
        <nav className="px-3 py-4 flex-grow overflow-y-auto">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-colors
                    ${isActive(item.href) 
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-md' 
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}

            {/* Botão Sair incluído diretamente na lista de navegação */}
            <li className="mt-3">
              <button
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-lg transition-colors
                  text-gray-400 hover:bg-gray-800/60 hover:text-white
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="text-lg"><FaSignOutAlt /></span>
                {!collapsed && <span className="ml-3">Sair</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Botão de expandir/colapsar visível apenas quando colapsado */}
        {collapsed && (
          <button 
            onClick={toggleCollapse}
            className="absolute top-5 right-[-12px] bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white transition-colors border border-gray-700 hidden md:block"
          >
            <FaBars size={12} />
          </button>
        )}

        {/* Gradiente especial para o link "Home" */}
        {isActive('/') && !collapsed && (
          <div className="absolute left-0 top-[125px] w-full h-14 overflow-hidden pointer-events-none">
            <div className="absolute left-0 w-[5px] h-10 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-r-md"></div>
          </div>
        )}
        
        {/* Efeito gradiente mais escuro na parte inferior da sidebar */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
      </motion.div>
      
      {/* Overlay para fechar a barra lateral em dispositivos móveis */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={toggleMobileSidebar}
        />
      )}
    </>
  )
}