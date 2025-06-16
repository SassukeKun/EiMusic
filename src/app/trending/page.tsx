'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaPlay, FaHeart, FaShare, FaTh, FaList, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Image from 'next/image'
import Link from 'next/link'

// Interface para definir o tipo de conteúdo trending
interface TrendingItem {
  id: string
  type: 'music' | 'artist' | 'playlist'
  title: string
  artist?: string
  image: string
  plays?: number
  likes?: number
  duration?: string
  trackCount?: number
  followers?: number
  genre?: string
  city?: string
  trending_score: number
}

// Tipos para filtros de período
type PeriodFilter = 'today' | 'week' | 'month' | 'year'

// Tipos para filtros de conteúdo
type ContentFilter = 'all' | 'music' | 'artist' | 'playlist'

// Tipos para visualização
type ViewMode = 'grid' | 'list'

export default function TrendingPage() {
  // Estados para controle de filtros
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('week')
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  
  // Estados para busca e paginação
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  // Configuração de paginação
  const itemsPerPage = 12
  
  // Estado para dados trending
  const [trendingData, setTrendingData] = useState<TrendingItem[]>([])
  const [filteredData, setFilteredData] = useState<TrendingItem[]>([])

  // Mock data contextualizado para Moçambique
  const mockTrendingData: TrendingItem[] = [
    // Músicas trending
    {
      id: 'm1',
      type: 'music',
      title: 'Maputo Nights',
      artist: 'Lizha James',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      plays: 1250000,
      likes: 89500,
      duration: '3:45',
      genre: 'Afrobeat',
      trending_score: 95
    },
    {
      id: 'm2',
      type: 'music',
      title: 'Beira ao Amanhecer',
      artist: 'Stewart Sukuma',
      image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=600&q=80',
      plays: 980000,
      likes: 67200,
      duration: '4:12',
      genre: 'Marrabenta',
      trending_score: 88
    },
    {
      id: 'm3',
      type: 'music',
      title: 'Xirico',
      artist: 'Twenty Fingers',
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=600&q=80',
      plays: 750000,
      likes: 45300,
      duration: '3:28',
      genre: 'Hip Hop',
      trending_score: 82
    },
    {
      id: 'm4',
      type: 'music',
      title: 'Nampula Love',
      artist: 'Anita Macuácua',
      image: 'https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?auto=format&fit=crop&w=600&q=80',
      plays: 650000,
      likes: 38900,
      duration: '3:56',
      genre: 'R&B',
      trending_score: 79
    },
    // Artistas trending
    {
      id: 'a1',
      type: 'artist',
      title: 'Ghorwane',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
      followers: 125000,
      genre: 'Marrabenta',
      city: 'Maputo',
      trending_score: 93
    },
    {
      id: 'a2',
      type: 'artist',
      title: 'Azagaia',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
      followers: 180000,
      genre: 'Hip Hop',
      city: 'Maputo',
      trending_score: 91
    },
    {
      id: 'a3',
      type: 'artist',
      title: 'Marllen',
      image: 'https://images.unsplash.com/photo-1494790108755-2616c9d2f4ee?auto=format&fit=crop&w=600&q=80',
      followers: 95000,
      genre: 'Pop',
      city: 'Beira',
      trending_score: 85
    },
    // Playlists trending
    {
      id: 'p1',
      type: 'playlist',
      title: 'Top Moçambique 2025',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
      trackCount: 50,
      likes: 25000,
      trending_score: 87
    },
    {
      id: 'p2',
      type: 'playlist',
      title: 'Marrabenta Clássicos',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=600&q=80',
      trackCount: 32,
      likes: 18500,
      trending_score: 83
    },
    {
      id: 'p3',
      type: 'playlist',
      title: 'Hip Hop Mozambicano',
      image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&w=600&q=80',
      trackCount: 28,
      likes: 22000,
      trending_score: 81
    }
  ]

  // Função para filtrar dados baseado nos filtros ativos
  const filterData = () => {
    let filtered = mockTrendingData

    // Filtro por tipo de conteúdo
    if (contentFilter !== 'all') {
      filtered = filtered.filter(item => item.type === contentFilter)
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.artist && item.artist.toLowerCase().includes(query)) ||
        (item.genre && item.genre.toLowerCase().includes(query)) ||
        (item.city && item.city.toLowerCase().includes(query))
      )
    }

    // Simular filtro por período (na prática viria da API)
    // Por agora, apenas reordenamos por trending_score
    filtered = filtered.sort((a, b) => b.trending_score - a.trending_score)

    return filtered
  }

  // Função para calcular dados da paginação
  const getPaginationData = () => {
    const totalItems = filteredData.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = filteredData.slice(startIndex, endIndex)

    return {
      totalItems,
      totalPages,
      currentItems,
      startIndex,
      endIndex: Math.min(endIndex, totalItems)
    }
  }

  // Função para formatar números (ex: 1250000 → 1.25M)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Effect para atualizar dados filtrados
  useEffect(() => {
    setIsLoading(true)
    // Simular delay de carregamento
    const timer = setTimeout(() => {
      const filtered = filterData()
      setFilteredData(filtered)
      setCurrentPage(1) // Reset página ao filtrar
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [periodFilter, contentFilter, searchQuery])

  // Effect inicial para carregar dados
  useEffect(() => {
    setTrendingData(mockTrendingData)
    setFilteredData(mockTrendingData)
  }, [])

  // Componente para card no modo grid
  const GridCard = ({ item }: { item: TrendingItem }) => (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group cursor-pointer"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link href={`/${item.type === 'music' ? 'musicas' : item.type === 'artist' ? 'artistas' : 'playlists'}/${item.id}`}>
        <div className="relative">
          {/* Imagem do card */}
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Overlay com botão play */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <motion.button
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlay className="text-lg" />
              </motion.button>
            </div>
          </div>

          {/* Conteúdo do card */}
          <div className="p-4">
            <h3 className="font-semibold text-white truncate mb-1">{item.title}</h3>
            
            {/* Informações específicas por tipo */}
            {item.type === 'music' && (
              <>
                <p className="text-gray-400 text-sm truncate mb-2">{item.artist}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatNumber(item.plays || 0)} plays</span>
                  <span>{item.duration}</span>
                </div>
              </>
            )}

            {item.type === 'artist' && (
              <>
                <p className="text-gray-400 text-sm mb-2">{item.genre} • {item.city}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatNumber(item.followers || 0)} seguidores</span>
                  <span className="text-purple-400">#{item.trending_score}</span>
                </div>
              </>
            )}

            {item.type === 'playlist' && (
              <>
                <p className="text-gray-400 text-sm mb-2">{item.trackCount} músicas</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatNumber(item.likes || 0)} curtidas</span>
                  <span className="text-purple-400">#{item.trending_score}</span>
                </div>
              </>
            )}

            {/* Badge do tipo */}
            <div className="mt-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                item.type === 'music' ? 'bg-green-500/20 text-green-400' :
                item.type === 'artist' ? 'bg-blue-500/20 text-blue-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {item.type === 'music' ? '🎵 Música' :
                 item.type === 'artist' ? '🎤 Artista' : '📋 Playlist'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )

  // Componente para card no modo lista
  const ListCard = ({ item, index }: { item: TrendingItem; index: number }) => (
    <motion.div
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all duration-300 p-4 group cursor-pointer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/${item.type === 'music' ? 'musicas' : item.type === 'artist' ? 'artistas' : 'playlists'}/${item.id}`}>
        <div className="flex items-center gap-4">
          {/* Número da posição */}
          <div className="flex-shrink-0 w-8 text-center">
            <span className="text-2xl font-bold text-purple-400">#{index + 1}</span>
          </div>

          {/* Imagem */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
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
            {item.type === 'music' && (
              <p className="text-gray-400 text-sm truncate">{item.artist}</p>
            )}
            {item.type === 'artist' && (
              <p className="text-gray-400 text-sm">{item.genre} • {item.city}</p>
            )}
            {item.type === 'playlist' && (
              <p className="text-gray-400 text-sm">{item.trackCount} músicas</p>
            )}
          </div>

          {/* Estatísticas */}
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            {item.type === 'music' && (
              <>
                <span>{formatNumber(item.plays || 0)} plays</span>
                <span>{item.duration}</span>
              </>
            )}
            {item.type === 'artist' && (
              <span>{formatNumber(item.followers || 0)} seguidores</span>
            )}
            {item.type === 'playlist' && (
              <span>{formatNumber(item.likes || 0)} curtidas</span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <FaHeart />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <FaShare />
            </button>
            <button className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors">
              <FaPlay className="text-sm" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header da página */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="text-center mb-8">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Trending em Moçambique
          </motion.h1>
          <motion.p 
            className="text-gray-300 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Descubra o que está em alta na música moçambicana
          </motion.p>
        </div>

        {/* Container para filtros e controles */}
        <motion.div 
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Filtros de período */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Período</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Hoje' },
                { key: 'week', label: 'Semana' },
                { key: 'month', label: 'Mês' },
                { key: 'year', label: 'Ano' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setPeriodFilter(period.key as PeriodFilter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    periodFilter === period.key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros de tipo de conteúdo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Tipo de Conteúdo</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'Todos', icon: '🎵' },
                { key: 'music', label: 'Músicas', icon: '🎶' },
                { key: 'artist', label: 'Artistas', icon: '🎤' },
                { key: 'playlist', label: 'Playlists', icon: '📋' }
              ].map((content) => (
                <button
                  key={content.key}
                  onClick={() => setContentFilter(content.key as ContentFilter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    contentFilter === content.key
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
                  }`}
                >
                  <span>{content.icon}</span>
                  {content.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de busca e controles de visualização */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Campo de busca */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar trending..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Toggle de visualização Grid/List */}
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

        {/* Indicador de resultados */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <p className="text-gray-300">
              {isLoading ? (
                'Carregando...'
              ) : (
                `${filteredData.length} ${filteredData.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}`
              )}
            </p>
            
            {/* Badge do filtro ativo */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Filtro ativo:</span>
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm">
                {periodFilter === 'today' && 'Hoje'}
                {periodFilter === 'week' && 'Esta Semana'}
                {periodFilter === 'month' && 'Este Mês'}
                {periodFilter === 'year' && 'Este Ano'}
                {contentFilter !== 'all' && ` • ${
                  contentFilter === 'music' ? 'Músicas' :
                  contentFilter === 'artist' ? 'Artistas' : 'Playlists'
                }`}
              </span>
            </div>
          </div>
        </motion.div>
        
        {/* Container principal de conteúdo */}
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
        ) : filteredData.length === 0 ? (
          // Estado vazio
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-400 mb-6">
              Tente ajustar seus filtros ou buscar por outros termos
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setContentFilter('all')
                setPeriodFilter('week')
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
            >
              Limpar Filtros
            </button>
          </motion.div>
        ) : (
          // Conteúdo principal
          <>
            {viewMode === 'grid' ? (
              // Visualização em grade
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
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
                {getPaginationData().currentItems.map((item) => (
                  <GridCard key={item.id} item={item} />
                ))}
              </motion.div>
            ) : (
              // Visualização em lista
              <motion.div 
                className="space-y-3 mb-8"
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
                {getPaginationData().currentItems.map((item, index) => (
                  <ListCard 
                    key={item.id} 
                    item={item} 
                    index={(currentPage - 1) * itemsPerPage + index}
                  />
                ))}
              </motion.div>
            )}

            {/* Paginação */}
            {getPaginationData().totalPages > 1 && (
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Informações da paginação */}
                <div className="text-sm text-gray-400">
                  Mostrando {getPaginationData().startIndex + 1} - {getPaginationData().endIndex} de {getPaginationData().totalItems} resultados
                </div>

                {/* Controles de paginação */}
                <div className="flex items-center gap-2">
                  {/* Botão anterior */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      currentPage === 1
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <FaChevronLeft />
                  </button>

                  {/* Números das páginas */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: getPaginationData().totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        const totalPages = getPaginationData().totalPages
                        if (totalPages <= 7) return true
                        if (page === 1 || page === totalPages) return true
                        if (page >= currentPage - 1 && page <= currentPage + 1) return true
                        return false
                      })
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="text-gray-500 px-1">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  {/* Botão próximo */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(getPaginationData().totalPages, prev + 1))}
                    disabled={currentPage === getPaginationData().totalPages}
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      currentPage === getPaginationData().totalPages
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  )
}