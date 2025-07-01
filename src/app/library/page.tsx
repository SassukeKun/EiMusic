'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FaSearch, 
  FaPlay, 
  FaHeart, 
  FaShare, 
  FaPlus,
  FaMusic,
  FaUsers,
  FaListUl,
  FaHistory,
  FaDownload,
  FaFilter,
  FaTh,
  FaList,
  FaSort,
  FaClock,
  FaCalendarAlt,
  FaUser,
  FaHeadphones,
  FaTrash,
  FaEdit
} from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

// Interfaces
interface LibraryItem {
  id: string
  type: 'music' | 'playlist' | 'artist' | 'album'
  title: string
  artist?: string
  image: string
  duration?: string
  trackCount?: number
  followers?: number
  addedAt: Date
  lastPlayed?: Date
  isOwned?: boolean
  isDownloaded?: boolean
}

// Tipos para filtros
type LibraryFilter = 'all' | 'music' | 'playlists' | 'artists' | 'albums' | 'downloaded'
type SortBy = 'recent' | 'alphabetical' | 'artist' | 'duration' | 'added'
type ViewMode = 'grid' | 'list'

export default function LibraryPage() {
  const { user, isAuthenticated } = useAuth()
  
  // Estados
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para dados
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<LibraryItem[]>([])

  // Mock data da biblioteca do usuário
  const mockLibraryData: LibraryItem[] = [
    // Músicas salvas
    {
      id: 'lib1',
      type: 'music',
      title: 'Maputo Nights',
      artist: 'Lizha James',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      duration: '3:45',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 dias atrás
      lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h atrás
      isDownloaded: true
    },
    {
      id: 'lib2',
      type: 'music',
      title: 'Beira Sunset',
      artist: 'Sofia Waves',
      image: 'https://images.unsplash.com/photo-1512733596533-7b00ccf8ebaf?auto=format&fit=crop&w=600&q=80',
      duration: '4:02',
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 dias atrás
      lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
      isDownloaded: false
    },
    // Playlists criadas
    {
      id: 'lib3',
      type: 'playlist',
      title: 'Minha Playlist Favorita',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      trackCount: 25,
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 dias atrás
      lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
      isOwned: true
    },
    {
      id: 'lib4',
      type: 'playlist',
      title: 'Top Moçambique 2025',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80',
      trackCount: 50,
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 semana atrás
      lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12h atrás
      isOwned: false
    },
    // Artistas seguidos
    {
      id: 'lib5',
      type: 'artist',
      title: 'DJ Tarico Jr',
      image: 'https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?auto=format&fit=crop&w=600&q=80',
      followers: 18700,
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 dias atrás
      lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 8) // 8h atrás
    },
    {
      id: 'lib6',
      type: 'artist',
      title: 'Anita Macuácua',
      image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&w=600&q=80',
      followers: 12500,
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // 20 dias atrás
      lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 dias atrás
    },
    // Álbuns salvos
    {
      id: 'lib7',
      type: 'album',
      title: 'Sons de Moçambique',
      artist: 'Vários Artistas',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80',
      trackCount: 12,
      addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 1 mês atrás
      lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 dias atrás
    }
  ]

  // Função para filtrar itens
  const filterItems = () => {
    let filtered = mockLibraryData

    // Filtro por tipo
    if (activeFilter !== 'all') {
      if (activeFilter === 'downloaded') {
        filtered = filtered.filter(item => item.isDownloaded)
      } else {
        filtered = filtered.filter(item => item.type === activeFilter)
      }
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.artist && item.artist.toLowerCase().includes(query))
      )
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title)
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '')
        case 'duration':
          return (a.duration || '').localeCompare(b.duration || '')
        case 'added':
          return b.addedAt.getTime() - a.addedAt.getTime()
        case 'recent':
        default:
          return (b.lastPlayed?.getTime() || 0) - (a.lastPlayed?.getTime() || 0)
      }
    })

    return filtered
  }

  // Função para formatar data
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    if (days < 30) return `${Math.floor(days / 7)}sem atrás`
    return `${Math.floor(days / 30)}mês atrás`
  }

  // Effect para filtrar dados
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const filtered = filterItems()
      setFilteredItems(filtered)
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [activeFilter, searchQuery, sortBy])

  // Effect inicial
  useEffect(() => {
    setLibraryItems(mockLibraryData)
    setFilteredItems(mockLibraryData)
  }, [])

  // Estatísticas da biblioteca
  const stats = {
    totalTracks: libraryItems.filter(item => item.type === 'music').length,
    totalPlaylists: libraryItems.filter(item => item.type === 'playlist').length,
    totalArtists: libraryItems.filter(item => item.type === 'artist').length,
    totalDownloaded: libraryItems.filter(item => item.isDownloaded).length
  }

  // Componente para card da biblioteca
  const LibraryCard = ({ item }: { item: LibraryItem }) => (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group cursor-pointer"
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link href={`/${item.type === 'music' ? 'musicas' : item.type === 'artist' ? 'artistas' : item.type === 'album' ? 'albums' : 'playlists'}/${item.id}`}>
        <div className="relative">
          {/* Imagem */}
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {item.isDownloaded && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <FaDownload className="text-xs" /> OFFLINE
                </span>
              )}
              {item.isOwned && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  CRIADA
                </span>
              )}
            </div>

            {/* Overlay com botões */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    // Lógica para tocar
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transition-colors"
                >
                  <FaPlay className="text-lg" />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    // Lógica para remover da biblioteca
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-4">
            <h3 className="font-semibold text-white truncate mb-1">{item.title}</h3>
            {item.artist && (
              <p className="text-gray-400 text-sm truncate mb-2">{item.artist}</p>
            )}
            
            {/* Informações específicas por tipo */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              {item.type === 'music' && (
                <>
                  <span>{item.duration}</span>
                  <span>Adicionada {formatDate(item.addedAt)}</span>
                </>
              )}
              {item.type === 'playlist' && (
                <>
                  <span>{item.trackCount} músicas</span>
                  <span>Criada {formatDate(item.addedAt)}</span>
                </>
              )}
              {item.type === 'artist' && (
                <>
                  <span>{item.followers?.toLocaleString()} seguidores</span>
                  <span>Seguindo desde {formatDate(item.addedAt)}</span>
                </>
              )}
              {item.type === 'album' && (
                <>
                  <span>{item.trackCount} faixas</span>
                  <span>Salvo {formatDate(item.addedAt)}</span>
                </>
              )}
            </div>

            {/* Última reprodução */}
            {item.lastPlayed && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FaClock className="text-xs" />
                <span>Ouvido {formatDate(item.lastPlayed)}</span>
              </div>
            )}

            {/* Tipo do item */}
            <div className="mt-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.type === 'music' ? 'bg-green-500/20 text-green-400' :
                item.type === 'playlist' ? 'bg-purple-500/20 text-purple-400' :
                item.type === 'artist' ? 'bg-blue-500/20 text-blue-400' :
                'bg-orange-500/20 text-orange-400'
              }`}>
                {item.type === 'music' ? '🎵 Música' :
                 item.type === 'playlist' ? '📋 Playlist' :
                 item.type === 'artist' ? '🎤 Artista' : '💿 Álbum'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )

  // Componente para visualização em lista
  const LibraryListItem = ({ item, index }: { item: LibraryItem; index: number }) => (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all duration-300 p-4 group cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/${item.type === 'music' ? 'musicas' : item.type === 'artist' ? 'artistas' : item.type === 'album' ? 'albums' : 'playlists'}/${item.id}`}>
        <div className="flex items-center gap-4">
          {/* Imagem */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Informações principais */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{item.title}</h3>
            {item.artist && (
              <p className="text-gray-400 text-sm truncate">{item.artist}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="hidden md:block">
            <span className={`px-2 py-1 rounded-full text-xs ${
              item.type === 'music' ? 'bg-green-500/20 text-green-400' :
              item.type === 'playlist' ? 'bg-purple-500/20 text-purple-400' :
              item.type === 'artist' ? 'bg-blue-500/20 text-blue-400' :
              'bg-orange-500/20 text-orange-400'
            }`}>
              {item.type === 'music' ? 'Música' :
               item.type === 'playlist' ? 'Playlist' :
               item.type === 'artist' ? 'Artista' : 'Álbum'}
            </span>
          </div>

          {/* Info específica */}
          <div className="hidden lg:flex items-center text-sm text-gray-400 min-w-0">
            {item.type === 'music' && <span>{item.duration}</span>}
            {item.type === 'playlist' && <span>{item.trackCount} músicas</span>}
            {item.type === 'artist' && <span>{item.followers?.toLocaleString()} seguidores</span>}
            {item.type === 'album' && <span>{item.trackCount} faixas</span>}
          </div>

          {/* Data de adição */}
          <div className="hidden xl:block text-sm text-gray-500 min-w-0">
            {formatDate(item.addedAt)}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {item.isDownloaded && (
              <FaDownload className="text-green-400 text-sm" title="Disponível offline" />
            )}
            {item.isOwned && (
              <FaUser className="text-blue-400 text-sm" title="Criado por você" />
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault()
                // Lógica para tocar
              }}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
            >
              <FaPlay className="text-sm" />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault()
                // Lógica para remover
              }}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )

  // Se não estiver autenticado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <FaHeadphones className="mx-auto text-6xl text-gray-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-300 mb-2">Sua Biblioteca Está Vazia</h2>
          <p className="text-gray-400 mb-6">Faça login para ver suas músicas, playlists e artistas favoritos</p>
          <Link 
            href="/login"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        
        {/* Header da página */}
        <div className="mb-8">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Minha Biblioteca
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Suas músicas, playlists e artistas favoritos em um só lugar
          </motion.p>
        </div>

        {/* Estatísticas da biblioteca */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 text-center">
            <FaMusic className="mx-auto text-2xl text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalTracks}</p>
            <p className="text-sm text-gray-400">Músicas</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 text-center">
            <FaListUl className="mx-auto text-2xl text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalPlaylists}</p>
            <p className="text-sm text-gray-400">Playlists</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 text-center">
            <FaUsers className="mx-auto text-2xl text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalArtists}</p>
            <p className="text-sm text-gray-400">Artistas</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 text-center">
            <FaDownload className="mx-auto text-2xl text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalDownloaded}</p>
            <p className="text-sm text-gray-400">Offline</p>
          </div>
        </motion.div>

        {/* Controles e filtros */}
        <motion.div 
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Barra de busca */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar na sua biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Filtros por tipo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Filtrar por tipo</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Todos', icon: '📚' },
                { key: 'music', label: 'Músicas', icon: '🎵' },
                { key: 'playlists', label: 'Playlists', icon: '📋' },
                { key: 'artists', label: 'Artistas', icon: '🎤' },
                { key: 'albums', label: 'Álbuns', icon: '💿' },
                { key: 'downloaded', label: 'Offline', icon: '📱' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key as LibraryFilter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeFilter === key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Controles de visualização e ordenação */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Ordenação */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FaSort className="text-gray-400" />
                <span className="text-sm text-gray-300">Ordenar por:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="recent">Recente</option>
                  <option value="alphabetical">A-Z</option>
                  <option value="artist">Artista</option>
                  <option value="added">Data de adição</option>
                  <option value="duration">Duração</option>
                </select>
              </div>
            </div>

            {/* Toggle de visualização */}
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">Visualização:</span>
              <div className="flex bg-gray-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                  }`}
                  title="Visualização em Grade"
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-300 ${
                    viewMode === 'list'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-600/50'
                  }`}
                  title="Visualização em Lista"
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botão para criar nova playlist */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center gap-2">
            <FaPlus />
            Criar Nova Playlist
          </button>
        </motion.div>

        {/* Conteúdo principal */}
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700/50 aspect-square rounded-xl mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-700/50 h-20 rounded-lg"></div>
                ))}
              </div>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          // Estado vazio
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchQuery ? 'Nenhum resultado encontrado' : 'Sua biblioteca está vazia'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? 'Tente buscar por outros termos ou ajuste os filtros'
                : 'Comece salvando suas músicas, playlists e artistas favoritos'
              }
            </p>
            {!searchQuery && (
              <Link 
                href="/explore"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300 inline-block"
              >
                Explorar Música
              </Link>
            )}
          </motion.div>
        ) : (
          // Lista de itens
          <>
            {viewMode === 'grid' ? (
              // Visualização em grade
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
              >
                {filteredItems.map((item) => (
                  <LibraryCard key={item.id} item={item} />
                ))}
              </motion.div>
            ) : (
              // Visualização em lista
              <motion.div 
                className="space-y-3"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.05
                    }
                  }
                }}
                initial="hidden"
                animate="visible"
              >
                {filteredItems.map((item, index) => (
                  <LibraryListItem key={item.id} item={item} index={index} />
                ))}
              </motion.div>
            )}

            {/* Informações de resultados */}
            <motion.div 
              className="mt-8 text-center text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p>
                Mostrando {filteredItems.length} de {libraryItems.length} itens
                {activeFilter !== 'all' && ` em ${
                  activeFilter === 'music' ? 'Músicas' :
                  activeFilter === 'playlists' ? 'Playlists' :
                  activeFilter === 'artists' ? 'Artistas' :
                  activeFilter === 'albums' ? 'Álbuns' : 'Offline'
                }`}
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}