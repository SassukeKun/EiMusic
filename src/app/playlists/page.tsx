'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaHeartBroken,
  FaShareAlt,
  FaMusic,
  FaUsers,
  FaCalendarAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaSort,
  FaThLarge,
  FaList,
  FaEllipsisV,
  FaPlus,
  FaEye,
  FaUserCircle,
  FaClock,
  FaRandom,
  FaLock,
  FaGlobe,
  FaStar,
  FaFireAlt
} from 'react-icons/fa'

// Interface para playlists baseada no padrão da Home
interface Playlist {
  id: string;
  title: string;
  description: string;
  creator: string;
  image: string;
  trackCount: number;
  duration: string;
  createdAt: string;
  category: string;
  visibility: 'public' | 'private';
  followers: number;
  isOfficial: boolean;
  tags: string[];
  totalPlays: number;
}

export default function PlaylistsPage() {
  const { user, isAuthenticated } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Mock data para playlists moçambicanas seguindo o padrão da Home
  const mockPlaylists: Playlist[] = [
    {
      id: '1',
      title: 'Hits Moçambicanos',
      description: 'As melhores músicas de Moçambique do ano',
      creator: 'EiMusic Editorial',
      image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80',
      trackCount: 32,
      duration: '2h 15min',
      createdAt: '2024-03-01',
      category: 'Editorial',
      visibility: 'public',
      followers: 12500,
      isOfficial: true,
      tags: ['moçambique', 'hits', '2024', 'popular'],
      totalPlays: 2500000
    },
    {
      id: '2',
      title: 'Pura Energia',
      description: 'Músicas para bombas treinos e festas',
      creator: 'Fitness MZ',
      image: 'https://images.unsplash.com/photo-1550184916-c630464fd404?auto=format&fit=crop&w=600&q=80',
      trackCount: 24,
      duration: '1h 32min',
      createdAt: '2024-02-28',
      category: 'Fitness',
      visibility: 'public',
      followers: 8300,
      isOfficial: true,
      tags: ['energia', 'workout', 'festa', 'motivação'],
      totalPlays: 1800000
    },
    {
      id: '3',
      title: 'Clássicos Africanos',
      description: 'O melhor da música africana tradicional e moderna',
      creator: 'Africa Heritage',
      image: 'https://images.unsplash.com/photo-1532953593254-4af21ac275b3?auto=format&fit=crop&w=600&q=80',
      trackCount: 40,
      duration: '2h 45min',
      createdAt: '2024-02-25',
      category: 'Tradicional',
      visibility: 'public',
      followers: 15600,
      isOfficial: true,
      tags: ['clássicos', 'africano', 'heritage', 'tradicional'],
      totalPlays: 3200000
    },
    {
      id: '4',
      title: 'Tardes Tranquilas',
      description: 'Música suave para relaxar e descontrair',
      creator: 'Chill Vibes MZ',
      image: 'https://images.unsplash.com/photo-1531384370053-61af8bee95e3?auto=format&fit=crop&w=600&q=80',
      trackCount: 18,
      duration: '1h 15min',
      createdAt: '2024-02-20',
      category: 'Chill',
      visibility: 'public',
      followers: 9800,
      isOfficial: false,
      tags: ['chill', 'relax', 'tarde', 'suave'],
      totalPlays: 1200000
    },
    {
      id: '5',
      title: 'Marrabenta Moderna',
      description: 'Fusão da marrabenta tradicional com sons contemporâneos',
      creator: 'Zena Bakar',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 16,
      duration: '1h 8min',
      createdAt: '2024-02-15',
      category: 'Marrabenta',
      visibility: 'public',
      followers: 7200,
      isOfficial: false,
      tags: ['marrabenta', 'moderna', 'fusão', 'contemporâneo'],
      totalPlays: 950000
    },
    {
      id: '6',
      title: 'Hip-Hop de Maputo',
      description: 'O melhor do rap e hip-hop da capital moçambicana',
      creator: 'MC Kabelo',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 22,
      duration: '1h 28min',
      createdAt: '2024-02-10',
      category: 'Hip-Hop',
      visibility: 'public',
      followers: 11400,
      isOfficial: false,
      tags: ['hip-hop', 'rap', 'maputo', 'urbano'],
      totalPlays: 1750000
    },
    {
      id: '7',
      title: 'Afrobeats Moçambique',
      description: 'Sons africanos com batidas eletrônicas modernas',
      creator: 'DJ Tarico',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 28,
      duration: '1h 52min',
      createdAt: '2024-02-05',
      category: 'Afrobeats',
      visibility: 'public',
      followers: 13600,
      isOfficial: false,
      tags: ['afrobeats', 'eletrônica', 'dança', 'festa'],
      totalPlays: 2100000
    },
    {
      id: '8',
      title: 'Jazz & Soul Moçambicano',
      description: 'Smooth jazz e soul com o sabor único de Moçambique',
      creator: 'Banda Kakana',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 15,
      duration: '1h 5min',
      createdAt: '2024-01-30',
      category: 'Jazz',
      visibility: 'public',
      followers: 4800,
      isOfficial: false,
      tags: ['jazz', 'soul', 'smooth', 'noturno'],
      totalPlays: 680000
    },
    {
      id: '9',
      title: 'Amor Moçambicano',
      description: 'As mais belas canções românticas dos artistas locais',
      creator: 'Romance MZ',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 25,
      duration: '1h 42min',
      createdAt: '2024-01-25',
      category: 'Romance',
      visibility: 'public',
      followers: 8900,
      isOfficial: true,
      tags: ['amor', 'romântico', 'balada', 'sentimentos'],
      totalPlays: 1350000
    },
    {
      id: '10',
      title: 'Descobertas Musicais',
      description: 'Novos talentos moçambicanos para você descobrir',
      creator: 'Music Discovery',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 20,
      duration: '1h 18min',
      createdAt: '2024-01-20',
      category: 'Descobertas',
      visibility: 'public',
      followers: 3500,
      isOfficial: true,
      tags: ['novos', 'descoberta', 'talentos', 'emergentes'],
      totalPlays: 420000
    },
    {
      id: '11',
      title: 'Noites de Beira',
      description: 'Atmosfera noturna da segunda maior cidade de Moçambique',
      creator: 'Beira Nights',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 19,
      duration: '1h 25min',
      createdAt: '2024-01-15',
      category: 'Regional',
      visibility: 'public',
      followers: 5600,
      isOfficial: false,
      tags: ['beira', 'noturno', 'costa', 'atmosférico'],
      totalPlays: 780000
    },
    {
      id: '12',
      title: 'World Music Moçambique',
      description: 'Fusões da música moçambicana com sons do mundo',
      creator: 'Global Sounds',
      image: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      trackCount: 24,
      duration: '1h 38min',
      createdAt: '2024-01-10',
      category: 'World',
      visibility: 'public',
      followers: 6700,
      isOfficial: true,
      tags: ['world', 'fusão', 'internacional', 'experimental'],
      totalPlays: 890000
    }
  ]

  // Categorias baseadas no contexto moçambicano
  const categories = [
    'Editorial', 'Fitness', 'Tradicional', 'Chill', 'Marrabenta', 
    'Hip-Hop', 'Afrobeats', 'Jazz', 'Romance', 'Descobertas', 'Regional', 'World'
  ]

  // Opções de ordenação
  const sortOptions = [
    { value: 'recent', label: 'Mais Recentes' },
    { value: 'popular', label: 'Mais Populares' },
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'followers', label: 'Mais Seguidas' },
    { value: 'tracks', label: 'Mais Músicas' },
    { value: 'plays', label: 'Mais Ouvidas' }
  ]

  // Inicializar dados
  useEffect(() => {
    setTimeout(() => {
      setPlaylists(mockPlaylists)
      setFilteredPlaylists(mockPlaylists)
      setLoading(false)
    }, 1000)
  }, [])

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...playlists]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(playlist => 
        playlist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playlist.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playlist.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        playlist.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro de categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(playlist => playlist.category === selectedCategory)
    }

    // Ordenação
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.followers - a.followers)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'followers':
        filtered.sort((a, b) => b.followers - a.followers)
        break
      case 'tracks':
        filtered.sort((a, b) => b.trackCount - a.trackCount)
        break
      case 'plays':
        filtered.sort((a, b) => b.totalPlays - a.totalPlays)
        break
    }

    setFilteredPlaylists(filtered)
    setCurrentPage(1)
  }, [playlists, searchTerm, selectedCategory, sortBy])

  // Paginação
  const totalPages = Math.ceil(filteredPlaylists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPlaylists = filteredPlaylists.slice(startIndex, endIndex)

  // Formatação de números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Formatação de data
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <Link 
              href="/" 
              className="flex items-center text-gray-400 hover:text-white transition-colors mr-4"
            >
              <FaChevronLeft size={16} className="mr-2" />
              <span>Voltar</span>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Playlists em Destaque</h1>
              <p className="text-gray-400">
                Descubra coleções musicais criadas por artistas e curadores moçambicanos
                <span className="ml-2 text-purple-400">
                  ({filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''})
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Botão Criar Playlist */}
              <Link
                href="/playlists/create"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg transition-all font-medium"
              >
                <FaPlus size={16} />
                <span>Criar Playlist</span>
              </Link>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <FaThLarge size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:text-white'
                  }`}
                >
                  <FaList size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar playlists, criadores, categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {currentPlaylists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <FaMusic className="text-gray-600 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhuma playlist encontrada</h3>
              <p className="text-gray-500">Tente ajustar seus filtros ou termos de busca</p>
            </motion.div>
          ) : (
            <motion.div
              key={viewMode}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'
              }
            >
              {currentPlaylists.map((playlist) => (
                viewMode === 'grid' ? (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ) : (
                  <PlaylistListItem key={playlist.id} playlist={playlist} />
                )
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center space-x-2 mt-12"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              <FaChevronLeft size={16} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              <FaChevronRight size={16} />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Componente para Card View (seguindo o padrão da Home) - ADAPTADO COM LINKS
function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault() // Evita navegação no click do play
    e.stopPropagation()
    setIsPlaying(!isPlaying)
    console.log('Reproduzir playlist:', playlist.id)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault() // Evita navegação no click do favorite
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    console.log('Favoritar playlist:', playlist.id)
  }

  const handleRandomClick = (e: React.MouseEvent) => {
    e.preventDefault() // Evita navegação no click do random
    e.stopPropagation()
    console.log('Reproduzir aleatório playlist:', playlist.id)
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300 group"
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/playlists/${playlist.id}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={playlist.image}
            alt={playlist.title}
            width={300}
            height={300}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-3">
              <motion.button
                onClick={handlePlayClick}
                className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full text-white transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
              </motion.button>
              <motion.button
                onClick={handleFavoriteClick}
                className="p-3 bg-gray-700/80 backdrop-blur-sm hover:bg-gray-600/80 rounded-full text-white transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isFavorite ? <FaHeart className="text-red-500" size={20} /> : <FaHeart size={20} />}
              </motion.button>
              <motion.button 
                onClick={handleRandomClick}
                className="p-3 bg-gray-700/80 backdrop-blur-sm hover:bg-gray-600/80 rounded-full text-white transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaRandom size={20} />
              </motion.button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {playlist.isOfficial && (
              <span className="px-2 py-1 bg-blue-600/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center">
                <FaStar size={10} className="mr-1" />
                Oficial
              </span>
            )}
            {playlist.followers > 10000 && (
              <span className="px-2 py-1 bg-orange-600/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center">
                <FaFireAlt size={10} className="mr-1" />
                Popular
              </span>
            )}
          </div>

          {/* Visibility */}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs rounded-full">
              {playlist.visibility === 'public' ? <FaGlobe size={10} /> : <FaLock size={10} />}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-lg mb-1 truncate group-hover:text-purple-300 transition-colors">
            {playlist.title}
          </h3>
          <p className="text-gray-400 text-sm mb-2 truncate">Por {playlist.creator}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full">
              {playlist.category}
            </span>
            <span>{formatDate(playlist.createdAt)}</span>
          </div>

          <p className="text-gray-400 text-xs mb-3 line-clamp-2">{playlist.description}</p>

          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <FaMusic size={12} className="mr-1" />
                {playlist.trackCount}
              </span>
              <span className="flex items-center">
                <FaClock size={12} className="mr-1" />
                {playlist.duration}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <FaUsers size={12} className="mr-1" />
                {formatNumber(playlist.followers)}
              </span>
              <span className="flex items-center">
                <FaPlay size={12} className="mr-1" />
                {formatNumber(playlist.totalPlays)}
              </span>
            </div>
            <button 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Menu de opções:', playlist.id)
              }}
              className="p-1 hover:text-white transition-colors"
            >
              <FaEllipsisV size={12} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Componente para List View - ADAPTADO COM LINKS
function PlaylistListItem({ playlist }: { playlist: Playlist }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(!isPlaying)
    console.log('Reproduzir playlist:', playlist.id)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    console.log('Favoritar playlist:', playlist.id)
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Link href={`/playlists/${playlist.id}`} className="block p-4">
        <div className="flex items-center space-x-4">
          {/* Image */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={playlist.image}
              alt={playlist.title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handlePlayClick}
                className="text-white hover:text-purple-300 transition-colors"
              >
                {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                    {playlist.title}
                  </h3>
                  {playlist.isOfficial && (
                    <FaStar className="text-blue-400" size={12} />
                  )}
                </div>
                <p className="text-gray-400 text-sm truncate mb-1">Por {playlist.creator}</p>
                <p className="text-gray-500 text-xs truncate">{playlist.description}</p>
              </div>
              
              <div className="flex items-center space-x-4 ml-4">
                {/* Category */}
                <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs whitespace-nowrap">
                  {playlist.category}
                </span>
                
                {/* Stats */}
                <div className="hidden md:flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <FaMusic size={12} className="mr-1" />
                    {playlist.trackCount}
                  </span>
                  <span className="flex items-center">
                    <FaUsers size={12} className="mr-1" />
                    {formatNumber(playlist.followers)}
                  </span>
                  <span className="flex items-center">
                    <FaPlay size={12} className="mr-1" />
                    {formatNumber(playlist.totalPlays)}
                  </span>
                </div>
                
                {/* Duration */}
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {playlist.duration}
                </span>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleFavoriteClick}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {isFavorite ? <FaHeart className="text-red-500" size={16} /> : <FaHeart size={16} />}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Menu de opções:', playlist.id)
                    }}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaEllipsisV size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Função auxiliar para formatação de números
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Função auxiliar para formatação de data
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}