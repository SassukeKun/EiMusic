// src/app/artist/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import artistService from '@/services/artistService'
import {
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaMusic,
  FaUsers,
  FaCalendarAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaThLarge,
  FaList,
  FaEllipsisV,
  FaCheckCircle,
  FaMicrophone,
  FaMapMarkerAlt
} from 'react-icons/fa'

// Interface para artistas baseada na tabela artists.csv
interface Artist {
  id: string;
  name: string;
  bio?: string;
  profile_image_url: string;
  city?: string;
  genre?: string[];
  verified: boolean;
  created_at: string;
  subscribers: number;
  social_links?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
  monthlyListeners?: number;
  songsCount?: number;
}

// Helper functions for safe access to artist properties
const getSafeGenre = (artist: Artist): string[] => artist.genre || [];
const getSafeMonthlyListeners = (artist: Artist): number => artist.monthlyListeners || 0;
const getSafeSongsCount = (artist: Artist): number => artist.songsCount || 0;

export default function ArtistsPage() {
  const { user, isAuthenticated } = useAuth()
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Cidades de Moçambique
  const cities = ['Maputo', 'Beira', 'Nampula', 'Tete', 'Quelimane', 'Lichinga', 'Pemba', 'Xai-Xai']

  // Gêneros musicais (não está na tabela, mas mantido para UI)
  const genres = ['Rap', 'Hip-Hop', 'R&B', 'Afrobeats', 'Marrabenta', 'Traditional', 'Pop', 'Electronic', 'Soul', 'Dance']

  // Opções de ordenação
  const sortOptions = [
    { value: 'popular', label: 'Mais Populares' },
    { value: 'subscribers', label: 'Mais Seguidores' },
    { value: 'recent', label: 'Recém-chegados' },
    { value: 'alphabetical', label: 'A-Z' }
  ]

  // Buscar artistas do banco de dados
  useEffect(() => {
    setLoading(true)
    artistService.getTrendingArtists(100)
      .then((data) => {
        // Mapeamento para garantir compatibilidade com UI
        const mapped = data.map((artist: any) => ({
          ...artist,
          profileImage: artist.profile_image_url || artist.user_metadata?.avatar_url || '/placeholder-profile.png',
          coverImage: artist.profile_image_url || '/placeholder-cover.png',
          subscribers: artist.subscribers ?? 0,
          monthlyListeners: artist.subscribers ?? 0,
          songsCount: 0, // Não disponível na tabela, pode ser buscado depois
          city: artist.city || '',
          genre: [], // Não disponível na tabela
          isVerified: artist.verified,
          created_at: artist.created_at,
          lastRelease: '',
          totalPlays: 0,
          socialMedia: artist.social_links || {},
        }))
        setArtists(mapped)
        setFilteredArtists(mapped)
      })
      .finally(() => setLoading(false))
  }, [])

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...artists]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(artist => 
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.bio?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (artist.city?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro de cidade
    if (selectedCity !== 'all') {
      filtered = filtered.filter(artist => artist.city === selectedCity)
    }

    // Filtro de gênero (não disponível, mas mantido para UI)
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(artist => artist.genre && artist.genre.includes(selectedGenre))
    }

    // Ordenação
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.monthlyListeners ?? 0) - (a.monthlyListeners ?? 0))
        break
      case 'subscribers':
        filtered.sort((a, b) => (b.subscribers ?? 0) - (a.subscribers ?? 0))
        break
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredArtists(filtered)
    setCurrentPage(1)
  }, [artists, searchTerm, selectedCity, selectedGenre, sortBy])

  // Paginação
  const totalPages = Math.ceil(filteredArtists.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentArtists = filteredArtists.slice(startIndex, endIndex)

  // Formatação de números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
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
              <h1 className="text-3xl font-bold text-white mb-2">Artistas Populares</h1>
              <p className="text-gray-400">
                Descubra os melhores artistas moçambicanos da nossa plataforma
                <span className="ml-2 text-purple-400">
                  ({filteredArtists.length} artista{filteredArtists.length !== 1 ? 's' : ''})
                </span>
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
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
                placeholder="Buscar artistas, gêneros, cidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas as Cidades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

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
          {currentArtists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <FaMicrophone className="text-gray-600 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum artista encontrado</h3>
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
              {currentArtists.map((artist) => (
                viewMode === 'grid' ? (
                  <ArtistCard key={artist.id} artist={artist} />
                ) : (
                  <ArtistListItem key={artist.id} artist={artist} />
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
function ArtistCard({ artist }: { artist: Artist }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(!isPlaying)
    console.log('Reproduzir artista:', artist.id)
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFollowing(!isFollowing)
    console.log('Seguir artista:', artist.id)
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
      <Link href={`/artist/${artist.id}`} className="block">
        {/* Cover Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={artist.profile_image_url === "" ? "/avatar.svg" : artist.profile_image_url}
            alt={`${artist.name} cover`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.button
              onClick={handlePlayClick}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-full text-white transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isPlaying ? <FaPause size={24} /> : <FaPlay size={24} />}
            </motion.button>
          </div>

          {/* Verified Badge */}
          {artist.verified && (
            <div className="absolute top-3 right-3">
              <div className="bg-blue-600/80 backdrop-blur-sm p-2 rounded-full">
                <FaCheckCircle className="text-white" size={14} />
              </div>
            </div>
          )}
        </div>

        {/* Profile Image */}
        <div className="relative px-6 -mt-12">
          <div className="relative w-20 h-20 mx-auto">
            <Image
              src={artist.profile_image_url === "" ? '/placeholder.png' : artist.profile_image_url}
              alt={artist.name}
              fill
              className="object-cover rounded-full border-4 border-gray-800"
              unoptimized
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h3 className="font-bold text-lg text-white group-hover:text-purple-300 transition-colors">
              {artist.name}
            </h3>
            {artist.verified && (
              <FaCheckCircle className="text-blue-400" size={16} />
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-3">
            <FaMapMarkerAlt size={12} />
            <span>{artist.city || 'Localização não informada'}</span>
          </div>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {artist.bio}
          </p>

          {/* Genres
          <div className="flex flex-wrap justify-center gap-1 mb-4">
            {artist.genre.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs"
              >
                {genre}
              </span>
            ))}
            {artist.genre.length > 2 && (
              <span className="text-gray-500 text-xs self-center">
                +{artist.genre.length - 2}
              </span>
            )}
          </div> */}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
            <div className="text-center">
              <div className="font-semibold text-white">{formatNumber(artist.subscribers)}</div>
              <div>Seguidores</div>
            </div>
          </div>

          {/* Monthly Listeners */}
          <div className="text-center mb-4">
            <div className="text-lg font-bold text-purple-300">{formatNumber(artist.monthlyListeners || 0)}</div>
            <div className="text-xs text-gray-500">ouvintes mensais</div>
          </div>

          {/* Follow Button */}
          <button
            onClick={handleFollowClick}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
              isFollowing
                ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            }`}
          >
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </button>
        </div>
      </Link>
    </motion.div>
  )
}

// Componente para List View
function ArtistListItem({ artist }: { artist: Artist }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(!isPlaying)
    console.log('Reproduzir artista:', artist.id)
  }

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFollowing(!isFollowing)
    console.log('Seguir artista:', artist.id)
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
      <Link href={`/artist/${artist.id}`} className="block p-4">
        <div className="flex items-center space-x-4">
          {/* Profile Image */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={artist.profile_image_url === "" ? "/placeholder-profile.png" : artist.profile_image_url}
              alt={artist.name}
              fill
              className="object-cover"
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
                    {artist.name}
                  </h3>
                  {artist.verified && (
                    <FaCheckCircle className="text-blue-400" size={14} />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                  <FaMapMarkerAlt size={12} />
                  <span>{artist.city || 'Localização não informada'}</span>
                  <span>•</span>
                  <span>{getSafeGenre(artist).slice(0, 2).join(', ')}</span>
                </div>
                
                <p className="text-gray-500 text-sm truncate mb-2">{artist.bio}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center">
                    <FaUsers size={10} className="mr-1" />
                    {formatNumber(artist.subscribers)} seguidores
                  </span>
                  <span className="flex items-center">
                    <FaMusic size={10} className="mr-1" />
                    {artist.songsCount} músicas
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-4">
                {/* Monthly Listeners - Desktop apenas */}
                {/* Follow Button */}
                <button
                  onClick={handleFollowClick}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm whitespace-nowrap ${
                    isFollowing
                      ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  }`}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </button>
                
                {/* More Options */}
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('Menu de opções:', artist.id)
                  }}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <FaEllipsisV size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}