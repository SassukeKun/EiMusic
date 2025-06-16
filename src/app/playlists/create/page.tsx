// src/app/playlists/create/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import {
  FaArrowLeft,
  FaMusic,
  FaSearch,
  FaPlus,
  FaTimes,
  FaPlay,
  FaPause,
  FaHeart,
  FaRegHeart,
  FaSave,
  FaGlobe,
  FaLock,
  FaUsers,
  FaCheck
} from 'react-icons/fa'

// Interface para músicas da plataforma
interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  coverImage: string
  genre: string
  releaseDate: string
}

// Interface simples para playlist
interface NewPlaylist {
  title: string
  description: string
  visibility: 'public' | 'private'
  selectedTracks: Track[]
}

export default function CreatePlaylistPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const [playlist, setPlaylist] = useState<NewPlaylist>({
    title: '',
    description: '',
    visibility: 'public',
    selectedTracks: []
  })
  
  const [availableTracks, setAvailableTracks] = useState<Track[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Mock data - músicas já na plataforma (moçambicanas)
  const mockTracks: Track[] = [
    {
      id: "1",
      title: "Nunca tou no Place",
      artist: "Hernâni & Laylizzy",
      album: "Single",
      duration: "3:45",
      coverImage: "https://xigubo.com/wp-content/uploads/2022/11/231FEECC-35CF-4DEB-ABC8-621482F88F92-e1669184204697.jpeg",
      genre: "Rap",
      releaseDate: "2023-11-15"
    },
    {
      id: "2",
      title: "No Chapa",
      artist: "Mc Mastoni",
      album: "Vida Real",
      duration: "4:12",
      coverImage: "https://i.ytimg.com/vi/rMqsjbG5Yr4/hq720.jpg",
      genre: "Hip-Hop",
      releaseDate: "2024-01-20"
    },
    {
      id: "3",
      title: "Maputo City",
      artist: "Stewart Sukuma",
      album: "Capital Sounds",
      duration: "3:28",
      coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
      genre: "Afrobeats",
      releaseDate: "2023-12-10"
    },
    {
      id: "4",
      title: "Beira Vibes",
      artist: "Yaba Buluku Boyz",
      album: "Coastal Rhythms",
      duration: "3:56",
      coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
      genre: "Afrobeats",
      releaseDate: "2024-02-05"
    },
    {
      id: "5",
      title: "Nampula Sound",
      artist: "Mr. Bow",
      album: "Northern Beats",
      duration: "4:23",
      coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
      genre: "Marrabenta",
      releaseDate: "2023-10-30"
    },
    {
      id: "6",
      title: "Xima Tropical",
      artist: "Zena Bakar",
      album: "Tropical Collection",
      duration: "3:15",
      coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
      genre: "Marrabenta",
      releaseDate: "2024-01-08"
    },
    {
      id: "7",
      title: "Juventude",
      artist: "Twenty Fingers",
      album: "Nova Geração",
      duration: "4:01",
      coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
      genre: "R&B",
      releaseDate: "2023-09-22"
    },
    {
      id: "8",
      title: "Mozambique Dreams",
      artist: "DJ Tarico",
      album: "Electronic Fusion",
      duration: "5:12",
      coverImage: "https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg",
      genre: "Electronic",
      releaseDate: "2024-03-01"
    },
    {
      id: "9",
      title: "Distância",
      artist: "Nirvana",
      album: "Sentimentos",
      duration: "3:33",
      coverImage: "https://i1.sndcdn.com/artworks-775MIadN8jaJDuCt-JXiSdA-t240x240.jpg",
      genre: "Trapsoul",
      releaseDate: "2023-08-15"
    },
    {
      id: "10",
      title: "Não voltar atrás",
      artist: "7th Streetz Boyz",
      album: "Urban Collection",
      duration: "4:18",
      coverImage: "https://i1.sndcdn.com/artworks-Ixlqm1BQlHbPwJii-jcEjzA-t240x240.jpg",
      genre: "R&B",
      releaseDate: "2023-07-22"
    }
  ]

  // Carregar músicas da plataforma
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setAvailableTracks(mockTracks)
      setLoading(false)
    }, 800)
  }, [])

  // Filtrar músicas por busca
  const filteredTracks = availableTracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.album.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addTrack = (track: Track) => {
    if (!playlist.selectedTracks.find(t => t.id === track.id)) {
      setPlaylist(prev => ({
        ...prev,
        selectedTracks: [...prev.selectedTracks, track]
      }))
    }
  }

  const removeTrack = (trackId: string) => {
    setPlaylist(prev => ({
      ...prev,
      selectedTracks: prev.selectedTracks.filter(t => t.id !== trackId)
    }))
  }

  const calculateTotalDuration = () => {
    const totalSeconds = playlist.selectedTracks.reduce((total, track) => {
      const [minutes, seconds] = track.duration.split(':').map(Number)
      return total + minutes * 60 + seconds
    }, 0)
    
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
  }

  const handleSave = async () => {
    if (!playlist.title.trim() || playlist.selectedTracks.length === 0) return
    
    setSaving(true)
    
    // Simular salvamento
    setTimeout(() => {
      setSaving(false)
      console.log('Playlist criada:', playlist)
      router.push('/playlists')
    }, 2000)
  }

  const canSave = playlist.title.trim().length > 0 && playlist.selectedTracks.length > 0

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header */}
      <motion.div 
        className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-sm border-b border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors border border-gray-600"
              >
                <FaArrowLeft size={16} />
                <span className="text-sm font-medium">Voltar</span>
              </button>
              <h1 className="text-xl font-bold">Criar Playlist</h1>
            </div>
            
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-300 flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FaSave size={16} />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Painel Principal - Buscar Músicas */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold mb-6">Adicionar Músicas</h2>
              
              {/* Busca */}
              <div className="relative mb-6">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar músicas, artistas ou álbuns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                />
              </div>

              {/* Lista de Músicas */}
              <div className="space-y-1">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Carregando músicas da plataforma...</p>
                  </div>
                ) : filteredTracks.length === 0 ? (
                  <div className="text-center py-12">
                    <FaMusic className="text-gray-600 text-6xl mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhuma música encontrada</p>
                    <p className="text-gray-500 text-sm">Tente buscar por outro termo</p>
                  </div>
                ) : (
                  filteredTracks.map((track, index) => (
                    <motion.div
                      key={track.id}
                      className="flex items-center p-4 hover:bg-gray-700/30 rounded-lg transition-colors group cursor-pointer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => addTrack(track)}
                    >
                      {/* Número */}
                      <div className="w-8 text-center text-gray-400 text-sm">
                        {index + 1}
                      </div>

                      {/* Capa */}
                      <div className="relative w-12 h-12 bg-gray-600 rounded overflow-hidden flex-shrink-0 mx-4">
                        <Image
                          src={track.coverImage}
                          alt={track.title}
                          fill
                          className="object-cover"
                          unoptimized
                          sizes="48px"
                        />
                      </div>
                      
                      {/* Info da Música */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                          {track.title}
                        </h4>
                        <p className="text-sm text-gray-400 truncate">
                          {track.artist} • {track.album}
                        </p>
                      </div>
                      
                      {/* Duração */}
                      <div className="text-sm text-gray-400 mr-4">
                        {track.duration}
                      </div>

                      {/* Botão Adicionar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addTrack(track)
                        }}
                        disabled={playlist.selectedTracks.some(t => t.id === track.id)}
                        className="p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {playlist.selectedTracks.some(t => t.id === track.id) ? (
                          <FaCheck className="text-green-400" size={16} />
                        ) : (
                          <FaPlus className="text-gray-400 hover:text-white" size={16} />
                        )}
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Painel Lateral - Detalhes da Playlist */}
          <div className="lg:col-span-1">
            <motion.div 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 sticky top-32"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-6">Detalhes da Playlist</h3>
              
              {/* Formulário Básico */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome da Playlist *
                  </label>
                  <input
                    type="text"
                    value={playlist.title}
                    onChange={(e) => setPlaylist(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Minha Playlist Incrível"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={playlist.description}
                    onChange={(e) => setPlaylist(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva sua playlist..."
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Visibilidade
                  </label>
                  <select
                    value={playlist.visibility}
                    onChange={(e) => setPlaylist(prev => ({ ...prev, visibility: e.target.value as 'public' | 'private' }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="public">Pública</option>
                    <option value="private">Privada</option>
                  </select>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="border-t border-gray-700 pt-4 mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Músicas:</span>
                  <span>{playlist.selectedTracks.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Duração:</span>
                  <span>{calculateTotalDuration()}</span>
                </div>
              </div>

              {/* Lista de Músicas Selecionadas */}
              <div>
                <h4 className="font-medium text-gray-300 mb-3">
                  Músicas Selecionadas ({playlist.selectedTracks.length})
                </h4>
                
                {playlist.selectedTracks.length === 0 ? (
                  <div className="text-center py-8">
                    <FaMusic className="text-gray-600 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Nenhuma música selecionada</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {playlist.selectedTracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center p-2 bg-gray-700/30 rounded-lg group"
                      >
                        <span className="text-xs text-gray-500 w-6">{index + 1}</span>
                        <div className="flex-1 min-w-0 mx-2">
                          <p className="text-sm font-medium text-white truncate">{track.title}</p>
                          <p className="text-xs text-gray-400 truncate">{track.artist}</p>
                        </div>
                        <button
                          onClick={() => removeTrack(track.id)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}