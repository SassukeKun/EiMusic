// src/app/playlists/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  FaArrowLeft, 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaRegHeart,
  FaShare,
  FaEllipsisH,
  FaClock,
  FaDownload
} from 'react-icons/fa'

// Variantes de animação para Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
}

const trackVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 }
  }
}

// Interface para uma música da playlist
interface PlaylistTrack {
  id: string
  title: string
  artist: string
  duration: string // formato "3:45"
  coverImage: string
  isLiked: boolean
  addedAt: string
}

// Interface para detalhes da playlist
interface PlaylistDetails {
  id: string
  title: string
  description: string
  coverImage: string
  createdBy: string
  totalTracks: number
  totalDuration: string
  isFollowing: boolean
  tracks: PlaylistTrack[]
}

export default function PlaylistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const playlistId = params.id as string
  
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Mock data contextualizado para Moçambique
  const mockPlaylist: PlaylistDetails = {
    id: playlistId,
    title: "Afrobeats Moçambique 2025",
    description: "Os melhores sucessos do afrobeats moçambicano. Uma seleção especial com os artistas mais populares de Maputo, Beira e Nampula.",
    coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/v1703123456/eimusic/playlists/afrobeats-moz.jpg",
    createdBy: "António Macamo",
    totalTracks: 12,
    totalDuration: "47 min",
    isFollowing: false,
    tracks: [
      {
        id: "1",
        title: "Nunca tou no Place",
        artist: "Hernâni & Laylizzy", 
        duration: "3:45",
        coverImage: "https://xigubo.com/wp-content/uploads/2022/11/231FEECC-35CF-4DEB-ABC8-621482F88F92-e1669184204697.jpeg",
        isLiked: true,
        addedAt: "Há 2 dias"
      },
      {
        id: "2", 
        title: "No Chapa",
        artist: "Mc Mastoni",
        duration: "4:12",
        coverImage: "https://i.ytimg.com/vi/rMqsjbG5Yr4/hq720.jpg",
        isLiked: false,
        addedAt: "Há 1 semana"
      },
      {
        id: "3",
        title: "Maputo City",
        artist: "Stewart Sukuma",
        duration: "3:28", 
        coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
        isLiked: true,
        addedAt: "Há 3 dias"
      },
      {
        id: "4",
        title: "Beira Vibes",
        artist: "Yaba Buluku Boyz",
        duration: "3:56",
        coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg", 
        isLiked: false,
        addedAt: "Há 5 dias"
      },
      {
        id: "5",
        title: "Nampula Sound",
        artist: "Mr. Bow",
        duration: "4:23",
        coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
        isLiked: true, 
        addedAt: "Há 1 semana"
      }
    ]
  }

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlaylist(mockPlaylist)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [playlistId])

  const togglePlay = (trackId?: string) => {
    if (trackId) {
      setCurrentTrack(trackId)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const toggleLike = (trackId: string) => {
    if (playlist) {
      const updatedTracks = playlist.tracks.map(track => 
        track.id === trackId ? { ...track, isLiked: !track.isLiked } : track
      )
      setPlaylist({ ...playlist, tracks: updatedTracks })
    }
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header com botão voltar */}
      <motion.div 
        className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700"
        variants={itemVariants}
      >
        <div className="flex items-center p-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg 
                     hover:bg-gray-700/50 transition-colors border border-gray-600"
          >
            <FaArrowLeft size={16} />
            <span className="text-sm font-medium">Voltar</span>
          </button>
        </div>
      </motion.div>

      {loading ? (
        // Loading state
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando playlist...</p>
          </div>
        </div>
      ) : playlist ? (
        <motion.div 
          className="pb-8"
          variants={itemVariants}
        >
          {/* Header da Playlist */}
          <motion.div 
            className="relative p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
              {/* Capa da Playlist */}
              <motion.div 
                className="relative w-48 h-48 md:w-56 md:h-56 bg-gray-700 rounded-xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  src={playlist.coverImage}
                  alt={playlist.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => togglePlay(playlist.tracks[0]?.id)}
                    className="bg-purple-600 hover:bg-purple-700 p-4 rounded-full shadow-xl transform scale-0 hover:scale-100 transition-transform"
                  >
                    <FaPlay size={24} />
                  </button>
                </div>
              </motion.div>

              {/* Informações da Playlist */}
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Playlist</p>
                  <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {playlist.title}
                  </h1>
                  <p className="text-gray-300 text-sm md:text-base max-w-2xl leading-relaxed">
                    {playlist.description}
                  </p>
                </div>

                {/* Metadados */}
                <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-400">
                  <span className="font-medium text-white">{playlist.createdBy}</span>
                  <span>•</span>
                  <span>{playlist.totalTracks} músicas</span>
                  <span>•</span>
                  <span>{playlist.totalDuration}</span>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    onClick={() => togglePlay(playlist.tracks[0]?.id)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                             px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 
                             shadow-lg flex items-center space-x-2"
                  >
                    {isPlaying && currentTrack ? <FaPause size={16} /> : <FaPlay size={16} />}
                    <span>{isPlaying && currentTrack ? 'Pausar' : 'Reproduzir'}</span>
                  </button>

                  <button 
                    onClick={() => setPlaylist(prev => prev ? {...prev, isFollowing: !prev.isFollowing} : null)}
                    className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full border border-gray-600 hover:border-purple-500/50 transition-all duration-300"
                  >
                    {playlist.isFollowing ? <FaHeart className="text-purple-500" size={20} /> : <FaRegHeart size={20} />}
                  </button>

                  <button className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full border border-gray-600 hover:border-purple-500/50 transition-all duration-300">
                    <FaShare size={18} />
                  </button>

                  <button className="p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full border border-gray-600 hover:border-purple-500/50 transition-all duration-300">
                    <FaEllipsisH size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de Músicas */}
          <motion.div 
            className="px-6 md:px-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Header da Lista */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700/50 mb-2">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-6 md:col-span-5">Título</div>
              <div className="hidden md:block col-span-3">Adicionado</div>
              <div className="col-span-4 md:col-span-2 text-center">
                <FaClock size={14} className="mx-auto" />
              </div>
              <div className="col-span-1"></div>
            </div>

            {/* Lista de Tracks */}
            <motion.div 
              className="space-y-1"
              variants={containerVariants}
            >
              {playlist.tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  className="group grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-gray-800/30 transition-all duration-200"
                  variants={trackVariants}
                  whileHover={{ scale: 1.005, backgroundColor: "rgba(55, 65, 81, 0.3)" }}
                  whileTap={{ scale: 0.995 }}
                >
                  {/* Número/Play Button */}
                  <div className="col-span-1 flex items-center justify-center">
                    {currentTrack === track.id && isPlaying ? (
                      <button 
                        onClick={() => setIsPlaying(false)}
                        className="text-purple-500 hover:text-purple-400 transition-colors"
                      >
                        <FaPause size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() => togglePlay(track.id)}
                        className="text-gray-400 group-hover:text-white hover:text-purple-500 transition-colors"
                      >
                        {currentTrack === track.id ? (
                          <FaPlay size={14} />
                        ) : (
                          <span className="text-sm font-medium group-hover:hidden">
                            {index + 1}
                          </span>
                        )}
                        <FaPlay size={14} className="hidden group-hover:block" />
                      </button>
                    )}
                  </div>

                  {/* Título e Artista */}
                  <div className="col-span-6 md:col-span-5 flex items-center space-x-3">
                    <div className="relative w-12 h-12 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={track.coverImage}
                        alt={track.title}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-medium truncate ${
                        currentTrack === track.id ? 'text-purple-400' : 'text-white group-hover:text-purple-300'
                      } transition-colors`}>
                        {track.title}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  {/* Data Adicionada - Desktop apenas */}
                  <div className="hidden md:flex col-span-3 items-center">
                    <span className="text-sm text-gray-400">{track.addedAt}</span>
                  </div>

                  {/* Duração */}
                  <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                      {track.duration}
                    </span>
                  </div>

                  {/* Ações */}
                  <div className="col-span-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleLike(track.id)}
                        className={`p-1 hover:scale-110 transition-transform ${
                          track.isLiked ? 'text-purple-500' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {track.isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                      </button>
                      
                      <button className="p-1 text-gray-400 hover:text-white hover:scale-110 transition-all">
                        <FaDownload size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        // Error state
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Playlist não encontrada</h2>
            <p className="text-gray-400 mb-6">Esta playlist pode ter sido removida ou não existe.</p>
            <button
              onClick={() => router.push('/playlists')}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full 
                       hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Ver Todas as Playlists
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}