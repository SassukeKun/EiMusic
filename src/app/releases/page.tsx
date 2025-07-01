'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { FaThLarge } from 'react-icons/fa'
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaHeartBroken,
  FaShareAlt,
  FaMusic,
  FaVideo,
  FaUsers,
  FaCalendarAlt,
  FaFire,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCrown,
  FaStar,
  FaPlayCircle,
  FaClock,
  FaFilter,
  FaSort,
  FaList,
  FaEllipsisV,
  FaDownload,
  FaPlus,
  FaEye,
  FaThumbsUp,
  FaCommentAlt
} from 'react-icons/fa'

// Interface para releases baseada na documentação
interface Release {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image: string;
  duration: string;
  releaseDate: string;
  genre: string;
  type: 'music' | 'video' | 'album';
  tags: string[];
  plays: number;
  likes: number;
  isExplicit: boolean;
  isPremium: boolean;
  description?: string;
}

export default function ReleasesPage() {
  const { user, isAuthenticated } = useAuth()
  const [releases, setReleases] = useState<Release[]>([])
  const [filteredReleases, setFilteredReleases] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Mock data baseado no contexto moçambicano
  const mockReleases: Release[] = [
    {
      id: '1',
      title: 'Marrabenta do Futuro',
      artist: 'Zena Bakar',
      album: 'Revolução Digital',
      image: '/api/placeholder/300/300',
      duration: '3:45',
      releaseDate: '2024-03-10',
      genre: 'Marrabenta',
      type: 'music',
      tags: ['marrabenta', 'moderna', 'maputo'],
      plays: 127000,
      likes: 8500,
      isExplicit: false,
      isPremium: false,
      description: 'Uma fusão inovadora da marrabenta tradicional com elementos modernos'
    },
    {
      id: '2',
      title: 'Noites de Maputo - Clipe Oficial',
      artist: 'Banda Kakana',
      album: 'Cidade dos Sonhos',
      image: '/api/placeholder/300/300',
      duration: '4:12',
      releaseDate: '2024-03-08',
      genre: 'Jazz Fusion',
      type: 'video',
      tags: ['jazz', 'fusion', 'maputo', 'urbano'],
      plays: 89000,
      likes: 5200,
      isExplicit: false,
      isPremium: true,
      description: 'Videoclipe gravado nas ruas de Maputo durante o pôr do sol'
    },
    {
      id: '3',
      title: 'Dança da Liberdade',
      artist: 'MC Kabelo',
      album: 'Resistência',
      image: '/api/placeholder/300/300',
      duration: '3:28',
      releaseDate: '2024-03-05',
      genre: 'Hip-Hop',
      type: 'music',
      tags: ['hip-hop', 'rap', 'consciência', 'moçambique'],
      plays: 234000,
      likes: 12800,
      isExplicit: true,
      isPremium: false,
      description: 'Uma reflexão sobre a liberdade e resistência cultural'
    },
    {
      id: '4',
      title: 'African Dreams',
      artist: 'DJ Tarico',
      album: 'Continental Vibes',
      image: '/api/placeholder/300/300',
      duration: '4:05',
      releaseDate: '2024-02-28',
      genre: 'Afrobeats',
      type: 'music',
      tags: ['afrobeats', 'electronic', 'dança', 'energia'],
      plays: 156000,
      likes: 9700,
      isExplicit: false,
      isPremium: false,
      description: 'Batidas africanas com elementos eletrônicos modernos'
    },
    {
      id: '5',
      title: 'Coração de Moçambique',
      artist: 'Ana Mutimba',
      image: '/api/placeholder/300/300',
      duration: '3:52',
      releaseDate: '2024-02-25',
      genre: 'World Music',
      type: 'music',
      tags: ['tradicional', 'world', 'cultura', 'raízes'],
      plays: 78000,
      likes: 4600,
      isExplicit: false,
      isPremium: true,
      description: 'Celebração das tradições musicais moçambicanas'
    },
    {
      id: '6',
      title: 'Bailamos Juntos - Live Session',
      artist: 'Os Tubarões',
      image: '/api/placeholder/300/300',
      duration: '5:23',
      releaseDate: '2024-02-20',
      genre: 'Marrabenta',
      type: 'video',
      tags: ['marrabenta', 'live', 'tradicional', 'grupo'],
      plays: 112000,
      likes: 6800,
      isExplicit: false,
      isPremium: false,
      description: 'Performance ao vivo no Centro Cultural Franco-Moçambicano'
    },
    {
      id: '7',
      title: 'Força da Terra',
      artist: 'Marlene Muthemba',
      album: 'Raízes Profundas',
      image: '/api/placeholder/300/300',
      duration: '4:18',
      releaseDate: '2024-02-15',
      genre: 'Folk',
      type: 'music',
      tags: ['folk', 'acústico', 'natureza', 'mulher'],
      plays: 95000,
      likes: 5900,
      isExplicit: false,
      isPremium: true,
      description: 'Uma ode à força feminina e à conexão com a terra'
    },
    {
      id: '8',
      title: 'Beira Mar',
      artist: 'Conjunto da Beira',
      image: '/api/placeholder/300/300',
      duration: '3:34',
      releaseDate: '2024-02-10',
      genre: 'Marrabenta',
      type: 'music',
      tags: ['marrabenta', 'beira', 'costa', 'tradicional'],
      plays: 143000,
      likes: 8200,
      isExplicit: false,
      isPremium: false,
      description: 'Marrabenta clássica inspirada na cidade da Beira'
    }
  ]

  // Gêneros disponíveis baseados no contexto moçambicano
  const genres = [
    'Marrabenta', 'Afrobeats', 'Hip-Hop', 'Jazz Fusion', 
    'World Music', 'Folk', 'R&B', 'Reggae', 'Electronic'
  ]

  // Opções de ordenação
  const sortOptions = [
    { value: 'recent', label: 'Mais Recentes' },
    { value: 'popular', label: 'Mais Populares' },
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'duration', label: 'Duração' },
    { value: 'plays', label: 'Mais Ouvidas' }
  ]

  // Inicializar dados
  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setReleases(mockReleases)
      setFilteredReleases(mockReleases)
      setLoading(false)
    }, 1000)
  }, [])

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...releases]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(release => 
        release.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        release.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro de gênero
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(release => release.genre === selectedGenre)
    }

    // Filtro de tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(release => release.type === selectedType)
    }

    // Ordenação
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
        break
      case 'popular':
        filtered.sort((a, b) => b.plays - a.plays)
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'plays':
        filtered.sort((a, b) => b.plays - a.plays)
        break
      default:
        break
    }

    setFilteredReleases(filtered)
    setCurrentPage(1) // Reset para primeira página quando filtros mudam
  }, [releases, searchTerm, selectedGenre, selectedType, sortBy])

  // Paginação
  const totalPages = Math.ceil(filteredReleases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReleases = filteredReleases.slice(startIndex, endIndex)

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
              <h1 className="text-3xl font-bold text-white mb-2">Lançamentos Recentes</h1>
              <p className="text-gray-400">
                Descubra as mais novas músicas e vídeos dos artistas moçambicanos
                <span className="ml-2 text-purple-400">
                  ({filteredReleases.length} resultado{filteredReleases.length !== 1 ? 's' : ''})
                </span>
              </p>
            </div>
            
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
                placeholder="Buscar músicas, artistas, gêneros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os Gêneros</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os Tipos</option>
                <option value="music">🎵 Músicas</option>
                <option value="video">🎬 Vídeos</option>
                <option value="album">💿 Álbuns</option>
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
          {currentReleases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <FaMusic className="text-gray-600 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum resultado encontrado</h3>
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
              {currentReleases.map((release) => (
                viewMode === 'grid' ? (
                  <ReleaseCard key={release.id} release={release} />
                ) : (
                  <ReleaseListItem key={release.id} release={release} />
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

// Componente para Card View
function ReleaseCard({ release }: { release: Release }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300 group"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={release.image}
          alt={release.title}
          width={300}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 bg-purple-600 hover:bg-purple-500 rounded-full text-white transition-colors"
            >
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full text-white transition-colors"
            >
              {isFavorite ? <FaHeart className="text-red-500" size={20} /> : <FaHeart size={20} />}
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {release.isPremium && (
            <span className="px-2 py-1 bg-yellow-600/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center">
              <FaCrown size={10} className="mr-1" />
              Premium
            </span>
          )}
          {release.isExplicit && (
            <span className="px-2 py-1 bg-red-600/80 backdrop-blur-sm text-white text-xs rounded-full">
              Explícito
            </span>
          )}
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs rounded-full">
            {release.type === 'music' && '🎵'}
            {release.type === 'video' && '🎬'}
            {release.type === 'album' && '💿'}
          </span>
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded-full">
            {release.duration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-lg mb-1 truncate">{release.title}</h3>
        <p className="text-gray-400 text-sm mb-2 truncate">{release.artist}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full">
            {release.genre}
          </span>
          <span>{formatDate(release.releaseDate)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <FaPlay size={12} className="mr-1" />
              {formatNumber(release.plays)}
            </span>
            <span className="flex items-center">
              <FaHeart size={12} className="mr-1" />
              {formatNumber(release.likes)}
            </span>
          </div>
          <button className="p-1 hover:text-white transition-colors">
            <FaEllipsisV size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Componente para List View
function ReleaseListItem({ release }: { release: Release }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 hover:border-purple-500/50 transition-all duration-300 group"
    >
      <div className="flex items-center space-x-4">
        {/* Image */}
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={release.image}
            alt={release.title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white"
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white truncate">{release.title}</h3>
              <p className="text-gray-400 text-sm truncate">{release.artist}</p>
              {release.album && (
                <p className="text-gray-500 text-xs truncate">{release.album}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4 ml-4">
              {/* Genre */}
              <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs whitespace-nowrap">
                {release.genre}
              </span>
              
              {/* Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <FaPlay size={12} className="mr-1" />
                  {formatNumber(release.plays)}
                </span>
                <span className="flex items-center">
                  <FaHeart size={12} className="mr-1" />
                  {formatNumber(release.likes)}
                </span>
              </div>
              
              {/* Duration */}
              <span className="text-gray-400 text-sm whitespace-nowrap">
                {release.duration}
              </span>
              
              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  {isFavorite ? <FaHeart className="text-red-500" size={16} /> : <FaHeart size={16} />}
                </button>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <FaEllipsisV size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Função auxiliar para formatação de números (já definida acima)
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Função auxiliar para formatação de data (já definida acima)
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}