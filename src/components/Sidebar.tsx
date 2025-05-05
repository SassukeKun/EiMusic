// src/components/Sidebar.tsx
'use client'

import React from 'react'
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
  FaBell
} from 'react-icons/fa'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { icon: <FaHome />,        label: 'Home',        href: '/' },
    { icon: <FaChartLine />,   label: 'Trending',    href: '/trending' },
    { icon: <FaCompass />,     label: 'Explore',     href: '/explore' },
    { icon: <FaVideo />,       label: 'Vídeos',      href: '/videos' },
    { icon: <FaUsers />,       label: 'Comunidades', href: '/communities' },
    { icon: <FaCalendarAlt />, label: 'Eventos',     href: '/events' },
    { icon: <FaListUl />,      label: 'Playlists',   href: '/playlists' },
    { icon: <FaBook />,        label: 'Library',     href: '/library' },
    { icon: <FaUpload />,      label: 'Upload',      href: '/upload' }
  ]

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray text-gray-700 flex flex-col border-r">
      {/* topo: logo + nome + icons */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Image src="/musicSS.svg" alt="EiMusic" width={32} height={32} priority />
          <span className="text-xl font-bold">EiMusic</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-500">
          <FaCog className="text-xl hover:text-gray-700 cursor-pointer transition" />
          <FaBell className="text-xl hover:text-gray-700 cursor-pointer transition" />
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center px-4 mb-6 space-x-3">
        <Image
          src="/avatar.svg"
          alt="Avatar"
          width={40}
          height={40}
          className="rounded-full"
          priority
        />
        <div>
          <p className="text-sm font-semibold">Allallito-X</p>
          <p className="text-xs text-gray-500">@allennsantos07</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center px-3 py-2 rounded-lg transition
                ${isActive
                  ? 'bg-gradient-to-r from-[#006600] via-[#FFDF00] to-[#FF0000] text-white'
                  : 'hover:bg-gray-100'}
              `}
            >
              <span className="text-lg mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 text-sm text-gray-500">© 2025 EiMusic</div>
    </aside>
  )
}
