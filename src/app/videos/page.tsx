// src/app/videos/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaPlay, FaEye, FaHeart, FaComment, FaMoneyBillWave, FaFilter, FaSearch, FaClock } from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'

export default function VideosPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [activeFilter, setActiveFilter] = useState<'all' | 'trending' | 'new' | 'following'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  // Dados simulados de vídeos
  const videos = [
    {
      id: '1',
      title: 'Distância',
      artist: 'Nirvana',
      coverUrl: 'https://i1.sndcdn.com/artworks-775MIadN8jaJDuCt-JXiSdA-t240x240.jpg',
      videoUrl: 'https://youtu.be/AQG20qvo-uU',
      views: 12345,
      likes: 789,
      comments: 56,
      duration: 184,
      releaseDate: '2025-01-15',
      monetized: false,
      trackId: '123',
      description: 'Videoclipe oficial da música "Distância"',
      thumbnail: 'https://i1.sndcdn.com/artworks-775MIadN8jaJDuCt-JXiSdA-t240x240.jpg',
    },
    {
      id: '2',
      title: 'Qual é a tua',
      artist: 'Nirvana',
      coverUrl: 'https://i.ytimg.com/vi/C6COAFLAoIo/maxresdefault.jpg',
      videoUrl: 'https://youtu.be/C6COAFLAoIo',
      views: 8765,
      likes: 543,
      comments: 32,
      duration: 210,
      releaseDate: '2024-12-10',
      monetized: false,
      trackId: '124',
      description: 'Videoclipe oficial da música "Qual é a tua"',
      thumbnail: 'https://i.ytimg.com/vi/C6COAFLAoIo/maxresdefault.jpg',
    },
    {
      id: '3',
      title: 'Petalás',
      artist: 'Nirvana feat (Lil Skuyzi & Sélcia)',
      coverUrl: 'https://i.ytimg.com/vi/yK0i9OG3T0k/hqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=example3',
      views: 23456,
      likes: 1256,
      comments: 87,
      duration: 195,
      releaseDate: '2025-02-05',
      monetized: false,
      trackId: '125',
      description: 'Videoclipe oficial da música "Petalás"',
      thumbnail: 'https://i.ytimg.com/vi/yK0i9OG3T0k/hqdefault.jpg',
    },
    {
      id: '4',
      title: 'Não voltar atrás',
      artist: 'Nirvana feat (7TH Streetz Boyz)',
      coverUrl: 'https://i1.sndcdn.com/artworks-Ixlqm1BQlHbPwJii-jcEjzA-t240x240.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=example4',
      views: 7890,
      likes: 432,
      comments: 41,
      duration: 230,
      releaseDate: '2025-03-01',
      monetized: false,
      trackId: '126',
      description: 'Videoclipe oficial da música "Não voltar atrás"',
      thumbnail: 'https://i1.sndcdn.com/artworks-Ixlqm1BQlHbPwJii-jcEjzA-t240x240.jpg',
    },
    {
      id: '5',
      title: 'Hustle',
      artist: 'JR Marley ft Laudeezzer e Lil Skuyzi',
      coverUrl: 'https://portalmoznews.com/wp-content/uploads/2019/10/Jr.-Marley-Hustle-feat.-Laudeezzer-Lil-Skuyzi.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=example5',
      views: 34567,
      likes: 2345,
      comments: 178,
      duration: 203,
      releaseDate: '2024-11-20',
      monetized: false,
      trackId: '127',
      description: 'Videoclipe oficial da música "Hustle"',
      thumbnail: 'https://portalmoznews.com/wp-content/uploads/2019/10/Jr.-Marley-Hustle-feat.-Laudeezzer-Lil-Skuyzi.jpg',
    },

{
      id: '6',
      title: 'Rivais',
      artist: 'Twenty Fingers',
      coverUrl: 'https://i.ytimg.com/vi/Y51iOlghUa0/hqdefault.jpg?v=66d7acab',
      videoUrl: 'https://youtu.be/Y51iOlghUa0',
      views: 34567,
      likes: 2345,
      comments: 178,
      duration: 203,
      releaseDate: '2024-11-20',
      monetized: false,
      trackId: '127',
      description: 'Videoclipe oficial da música "Hustle"',
      thumbnail: 'https://i.ytimg.com/vi/Y51iOlghUa0/hqdefault.jpg?v=66d7acab',
    },


  ]
  
  // Funções de formatação
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) {
      return `${diffDays} dias atrás`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`
    } else {
      return date.toLocaleDateString('pt-BR')
    }
  }
  
  // Filtragem de vídeos
  const filteredVideos = videos.filter(video => {
    // Aplicar filtro de pesquisa
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        video.title.toLowerCase().includes(query) ||
        video.artist.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query)
      )
    }
    
    // Aplicar filtros de categoria
    if (activeFilter === 'trending') {
      return video.views > 10000
    } else if (activeFilter === 'new') {
      const videoDate = new Date(video.releaseDate)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return videoDate > thirtyDaysAgo
    } else if (activeFilter === 'following') {
      // Simulando vídeos de artistas que o usuário segue
      return ['Nirvana', 'Nirvana'].includes(video.artist)
    }
    
    return true // 'all' filter
  })
  
  // Navegar para o detalhe do vídeo
  const navigateToVideo = (videoId: string) => {
    router.push(`/videos/${videoId}`)
  }
  
  // Navegar para o detalhe da música
  const navigateToTrack = (trackId: string) => {
    router.push(`/track/${trackId}`)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-24">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Vídeos</h1>
          <p className="text-gray-300">Assista aos videoclipes das suas músicas favoritas</p>
        </div>
      </div>
      
      {/* Barra de pesquisa e filtros */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
          {/* Barra de pesquisa */}
          <div className="relative flex-grow">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vídeos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          {/* Filtros */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-full px-4 py-2 hover:bg-gray-700/60 transition"
            >
              <FaFilter className="text-purple-400" />
              <span>Filtros</span>
            </button>
            
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-48"
              >
                <ul>
                  <li>
                    <button
                      onClick={() => {
                        setActiveFilter('all')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition ${activeFilter === 'all' ? 'text-purple-400' : 'text-white'}`}
                    >
                      Todos os vídeos
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveFilter('trending')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition ${activeFilter === 'trending' ? 'text-purple-400' : 'text-white'}`}
                    >
                      Em alta
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setActiveFilter('new')
                        setShowFilterMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition ${activeFilter === 'new' ? 'text-purple-400' : 'text-white'}`}
                    >
                      Lançamentos
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          setActiveFilter('following')
                          setShowFilterMenu(false)
                        } else {
                          router.push('/login')
                        }
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition ${activeFilter === 'following' ? 'text-purple-400' : 'text-white'}`}
                    >
                      Artistas que sigo
                    </button>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Categoria ativa */}
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold">
            {activeFilter === 'all' && 'Todos os Vídeos'}
            {activeFilter === 'trending' && 'Vídeos em Alta'}
            {activeFilter === 'new' && 'Lançamentos Recentes'}
            {activeFilter === 'following' && 'Vídeos de Artistas que Sigo'}
          </h2>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="ml-3 text-sm text-gray-400 hover:text-white"
            >
              Limpar filtro
            </button>
          )}
        </div>
        
        {/* Grade de vídeos */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                className="bg-gray-800/60 rounded-lg overflow-hidden hover:bg-gray-700/60 transition cursor-pointer"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => navigateToVideo(video.id)}
              >
                {/* Thumbnail do vídeo */}
                <div className="relative group">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    width={400}
                    height={225}
                    className="w-full aspect-video object-cover"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <div className="bg-purple-600/80 rounded-full p-3">
                      <FaPlay className="text-white" />
                    </div>
                  </div>
                  
                  {/* Duração do vídeo */}
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                  
                  {/* Badge de monetização */}
                  {video.monetized && (
                    <div className="absolute top-2 left-2 bg-green-600/80 px-2 py-0.5 rounded text-xs flex items-center">
                      <FaMoneyBillWave className="mr-1" /> Monetizado
                    </div>
                  )}
                </div>
                
                {/* Informações do vídeo */}
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 line-clamp-1">{video.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{video.artist}</p>
                  
                  {/* Estatísticas */}
                  <div className="flex justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center">
                        <FaEye className="mr-1" /> {formatViews(video.views)}
                      </span>
                      <span className="flex items-center">
                        <FaHeart className="mr-1" /> {video.likes}
                      </span>
                    </div>
                    <span>{formatDate(video.releaseDate)}</span>
                  </div>
                  
                  {/* Link para a música */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToTrack(video.trackId);
                    }}
                    className="mt-3 text-purple-400 text-sm hover:text-purple-300 transition flex items-center"
                  >
                    <span>Ouvir música</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/60 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-2">Nenhum vídeo encontrado.</p>
            <p className="text-sm">Tente ajustar seus filtros ou termos de busca.</p>
          </div>
        )}
      </div>
    </div>
  )
}