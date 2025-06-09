// src/app/videos/page.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaShare, 
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaDonate,
  FaEye,
  FaThumbsUp,
  FaFilter,
  FaSearch,
  FaTimes,
  FaVideo,
  FaCalendarAlt,
  FaMusic,
  FaImage
} from 'react-icons/fa'

// Boa prática #1: Tipos TypeScript rigorosos
interface Video {
  id: string
  title: string
  artist: {
    id: string
    name: string
    avatar: string
    verified: boolean
  }
  thumbnail: string
  videoUrl: string
  duration: string
  views: number
  likes: number
  uploadDate: string
  description: string
  genre: string
  isLiked?: boolean
}

// Boa prática #2: Componente SafeImage para tratamento de erros
interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  fallbackText?: string
}

const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  fill = false, 
  className = '',
  fallbackText 
}) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Boa prática #3: Validação de URL antes do carregamento
  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  // Se a URL não é válida ou houve erro, mostrar fallback
  if (!isValidUrl(src) || hasError) {
    return (
      <div 
        className={`
          bg-gradient-to-br from-gray-700 to-gray-800 
          flex flex-col items-center justify-center
          text-gray-300
          ${fill ? 'absolute inset-0' : ''}
          ${className}
        `}
        style={fill ? undefined : { width, height }}
      >
        <FaImage className="text-2xl mb-2 opacity-60" />
        <span className="text-xs text-center px-2">
          {fallbackText || alt}
        </span>
      </div>
    )
  }

  return (
    <div className={`relative ${fill ? '' : 'inline-block'}`}>
      {/* Loading state */}
      {isLoading && (
        <div 
          className={`
            absolute inset-0 bg-gray-700 animate-pulse 
            flex items-center justify-center z-10
            ${className}
          `}
          style={fill ? undefined : { width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Boa prática #4: Usar img regular para URLs externas não configuradas */}
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`
          ${fill ? 'absolute inset-0 w-full h-full object-cover' : 'object-cover'}
          ${className}
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          transition-opacity duration-300
        `}
        style={fill ? undefined : { width, height }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true)
          setIsLoading(false)
        }}
        loading="lazy"
      />
    </div>
  )
}

// Boa prática #5: Componente de player de vídeo isolado
interface VideoPlayerProps {
  video: Video
  isPlaying: boolean
  onPlayPause: () => void
  onClose: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  isPlaying, 
  onPlayPause, 
  onClose 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)

  // Boa prática #6: useEffect com dependências corretas
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error)
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  // Boa prática #7: Cleanup de timers
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showControls && isPlaying) {
      timer = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timer)
  }, [showControls, isPlaying])

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = pos * duration
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="relative w-full max-w-6xl bg-black rounded-xl overflow-hidden"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Boa prática #8: Video element com controles customizados */}
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={video.videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          poster={video.thumbnail}
          preload="metadata"
        />

        {/* Overlay com controles */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50"
            >
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
                <Link href={`/artist/${video.artist.id}`}>
                  <div className="flex items-center space-x-2 hover:bg-white/10 rounded-lg p-2 transition-colors">
                    <SafeImage
                      src={video.artist.avatar}
                      alt={video.artist.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                      fallbackText={video.artist.name[0]}
                    />
                    <span className="text-white font-medium">{video.artist.name}</span>
                    {video.artist.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </Link>

                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Play button central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={onPlayPause}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-colors backdrop-blur-sm"
                >
                  {isPlaying ? (
                    <FaPause className="text-white text-2xl" />
                  ) : (
                    <FaPlay className="text-white text-2xl ml-1" />
                  )}
                </button>
              </div>

              {/* Controles inferiores */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div 
                  className="w-full h-1 bg-white/30 rounded-full mb-4 cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={onPlayPause}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                    </button>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-white text-sm">{video.title}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Componente principal
export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  // Boa prática #9: Mock data com URLs seguras
  useEffect(() => {
    const mockVideos: Video[] = [
      {
        id: '1',
        title: 'Nunca tou no Place',
        artist: {
          id: '1',
          name: 'Hernâni & Laylizzy',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: '3:45',
        views: 125000,
        likes: 8500,
        uploadDate: '2024-01-15',
        description: 'Novo videoclipe oficial de Hip Hop moçambicano',
        genre: 'Hip Hop',
        isLiked: false
      },
      {
        id: '2',
        title: 'Distância',
        artist: {
          id: '2',
          name: 'Nirvana MZ',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b550?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: '4:12',
        views: 89000,
        likes: 6200,
        uploadDate: '2024-01-10',
        description: 'Performance ao vivo de R&B',
        genre: 'R&B',
        isLiked: true
      },
      {
        id: '3',
        title: 'Não voltar atrás',
        artist: {
          id: '3',
          name: '7th Streetz Boyz',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          verified: false
        },
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: '3:28',
        views: 67000,
        likes: 4800,
        uploadDate: '2024-01-08',
        description: 'Videoclipe oficial de Afrobeat',
        genre: 'Afrobeat',
        isLiked: false
      },
      {
        id: '4',
        title: 'Rivais',
        artist: {
          id: '4',
          name: 'Twenty Fingers',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: '3:56',
        views: 234000,
        likes: 18500,
        uploadDate: '2024-01-20',
        description: 'Novo hit romântico',
        genre: 'Lovesong',
        isLiked: false
      },
      {
        id: '5',
        title: 'Vanabela',
        artist: {
          id: '5',
          name: 'Wizzi Massuke',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          verified: false
        },
        thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: '4:33',
        views: 156000,
        likes: 12300,
        uploadDate: '2024-01-18',
        description: 'Marabenta moderna',
        genre: 'Marabenta',
        isLiked: true
      },
      {
        id: '6',
        title: 'No Chapa',
        artist: {
          id: '6',
          name: 'Mc Mastoni',
          avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face',
          verified: true
        },
        thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
        videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
        duration: '3:21',
        views: 89500,
        likes: 7200,
        uploadDate: '2024-01-12',
        description: 'Trap moçambicano',
        genre: 'Trap',
        isLiked: false
      }
    ]
    setVideos(mockVideos)
  }, [])

  // Boa prática #10: Handlers descritivos
  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video)
    setIsPlaying(true)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleClosePlayer = () => {
    setSelectedVideo(null)
    setIsPlaying(false)
  }

  const handleLike = (videoId: string) => {
    setVideos(prevVideos =>
      prevVideos.map(video =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1
            }
          : video
      )
    )
  }

  const handleDonate = (artistId: string) => {
    console.log('Abrir modal de doação para artista:', artistId)
    // Implementar modal de doação
  }

  const handleShare = (video: Video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Confira este vídeo de ${video.artist.name}`,
        url: `${window.location.origin}/videos/${video.id}`
      })
    } else {
      // Fallback para copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/videos/${video.id}`)
    }
  }

  // Boa prática #11: Função pura para filtros
  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || video.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  const genres = ['all', ...Array.from(new Set(videos.map(v => v.genre)))]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FaVideo className="mr-3 text-red-500" />
                Vídeos
              </h1>
              <p className="text-gray-400 mt-1">Descubra videoclipes e performances exclusivas</p>
            </div>

            {/* Pesquisa e filtros */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar vídeos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-64"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-2 flex items-center transition-colors"
              >
                <FaFilter className="mr-2" />
                Filtros
              </button>
            </div>
          </div>

          {/* Filtros expandidos */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedGenre === genre
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {genre === 'all' ? 'Todos' : genre}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid de vídeos */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl overflow-hidden group hover:bg-gray-750 transition-colors"
            >
              {/* Thumbnail */}
              <div 
                className="relative aspect-video cursor-pointer overflow-hidden"
                onClick={() => handleVideoSelect(video)}
              >
                <SafeImage
                  src={video.thumbnail}
                  alt={video.title}
                  fill
                  className="group-hover:scale-105 transition-transform duration-300"
                  fallbackText={video.title}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <FaPlay className="text-white text-xl ml-1" />
                  </div>
                </div>

                {/* Duração */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>

              {/* Informações */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                  {video.title}
                </h3>

                {/* Artista */}
                <Link href={`/artist/${video.artist.id}`}>
                  <div className="flex items-center space-x-2 mb-3 hover:bg-gray-700/50 rounded p-1 -m-1 transition-colors">
                    <SafeImage
                      src={video.artist.avatar}
                      alt={video.artist.name}
                      width={24}
                      height={24}
                      className="rounded-full"
                      fallbackText={video.artist.name[0]}
                    />
                    <span className="text-gray-400 text-sm hover:text-white transition-colors">
                      {video.artist.name}
                    </span>
                    {video.artist.verified && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Estatísticas */}
                <div className="flex items-center justify-between text-gray-400 text-sm mb-3">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <FaEye className="mr-1" />
                      {video.views.toLocaleString()}
                    </span>
                    <span className="flex items-center">
                      <FaThumbsUp className="mr-1" />
                      {video.likes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    {new Date(video.uploadDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLike(video.id)}
                      className={`p-2 rounded-full transition-colors ${
                        video.isLiked
                          ? 'text-red-500 bg-red-500/20'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-500/20'
                      }`}
                      title={video.isLiked ? 'Remover like' : 'Dar like'}
                    >
                      <FaHeart size={16} />
                    </button>

                    <button 
                      onClick={() => handleShare(video)}
                      className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-500/20 transition-colors"
                      title="Compartilhar"
                    >
                      <FaShare size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDonate(video.artist.id)}
                    className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-1 rounded-full text-sm flex items-center transition-colors"
                    title={`Apoiar ${video.artist.name}`}
                  >
                    <FaDonate className="mr-1" size={12} />
                    Apoiar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estado vazio */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <FaVideo className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus filtros de pesquisa</p>
          </div>
        )}
      </div>

      {/* Player de vídeo */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onClose={handleClosePlayer}
          />
        )}
      </AnimatePresence>
    </div>
  )
}