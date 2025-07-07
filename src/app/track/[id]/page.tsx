'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRandom } from "react-icons/fa";

import { 
  FaPlay, 
  FaPause,
  FaHeart, 
  FaShare, 
  FaComment,
  FaThumbsUp,
  FaDownload,
  FaPlus,
  FaMusic,
  FaHeadphones,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaArrowLeft,
  FaGift,
  FaCrown,
  FaVolumeMute,
  FaVolumeUp,
  FaStepForward,
  FaStepBackward,
  FaRedo,
  FaListUl
} from 'react-icons/fa'

// Mock data para demonstração
const mockTracks = {
  '1': {
    id: '1',
    title: 'Maputo Nights',
    artist: {
      id: '1',
      name: 'MC Kappa',
      avatar: null,
      verified: true
    },
    album: 'Urban Mozambique',
    duration: 245, // em segundos
    genre: 'Hip-Hop',
    release_date: '2024-11-01',
    plays_count: 25420,
    likes_count: 3240,
    download_count: 1852,
    cover_image: null,
    audio_url: '/demo/maputo-nights.mp3',
    lyrics: `[Verso 1]
Nas ruas de Maputo quando a noite cai
Sons da cidade ecoam, ninguém sai
Luzes da Costa do Sol iluminam o mar
Histórias da nossa terra vou contar

[Refrão]
Maputo nights, cidade que não dorme
Sons urbanos, cultura que se forma
Da Baixa ao Alto-Maé, nossa voz ressoa
Mozambique hip-hop, música que emociona

[Verso 2]
Juventude que luta por um sonho melhor
Através da música expressa a nossa dor
Mas também a alegria de ser moçambicano
Orgulho da terra, som africano`,
    description: 'Uma homenagem às noites vibrantes de Maputo, misturando elementos do hip-hop moderno com a essência cultural moçambicana.',
    tags: ['hip-hop', 'maputo', 'urban', 'moçambique', 'cultura'],
    is_premium: false,
    audio_quality: '320kbps'
  },
  '2': {
    id: '2',
    title: 'Mulher Moçambicana',
    artist: {
      id: '2',
      name: 'Bella Moçambique',
      avatar: null,
      verified: true
    },
    album: 'Raízes Contemporâneas',
    duration: 234,
    genre: 'R&B/Soul',
    release_date: '2024-10-20',
    plays_count: 28900,
    likes_count: 4120,
    download_count: 2341,
    cover_image: null,
    audio_url: '/demo/mulher-mocambicana.mp3',
    lyrics: `[Verso 1]
Força e beleza em cada passo
Mulher guerreira, nunca me canso
De admirar tua resistência
Moçambicana de essência

[Refrão]
Mulher moçambicana
Orgulho da nossa nação
Carrega a tradição
No peito, no coração`,
    description: 'Uma celebração da força e beleza da mulher moçambicana, combinando ritmos tradicionais com sonoridades modernas.',
    tags: ['rnb', 'soul', 'empoderamento', 'mulher', 'tradição'],
    is_premium: false,
    audio_quality: '320kbps'
  }
}

const mockComments = [
  {
    id: '1',
    user: 'Maria Santos',
    avatar: null,
    content: 'Que música incrível! Representa muito bem a nossa cultura 🔥',
    timestamp: '2024-12-05T10:30:00Z',
    likes: 12
  },
  {
    id: '2',
    user: 'João Mateus',
    avatar: null,
    content: 'MC Kappa sempre entregando qualidade. Orgulho moçambicano!',
    timestamp: '2024-12-05T09:15:00Z',
    likes: 8
  },
  {
    id: '3',
    user: 'Ana Costa',
    avatar: null,
    content: 'Essa beat é viciante! Já ouvi umas 20 vezes hoje 😍',
    timestamp: '2024-12-04T20:45:00Z',
    likes: 15
  },
  {
    id: '4',
    user: 'Carlos Silva',
    avatar: null,
    content: 'Finalmente uma música que fala da nossa realidade. Muito bom!',
    timestamp: '2024-12-04T18:20:00Z',
    likes: 6
  }
]

const mockRelatedTracks = [
  {
    id: '3',
    title: 'Cidade de Pedra e Cal',
    artist: 'MC Kappa',
    duration: 267,
    plays_count: 32300,
    cover_image: null
  },
  {
    id: '4',
    title: 'Cultura Nossa',
    artist: 'MC Kappa',
    duration: 189,
    plays_count: 19800,
    cover_image: null
  },
  {
    id: '5',
    title: 'Vamos Dançar',
    artist: 'MC Kappa feat. Bella Moçambique',
    duration: 212,
    plays_count: 42100,
    cover_image: null
  }
]

export default function TrackDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  
  // Estados do player
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)
  const [isRepeating, setIsRepeating] = useState(false)
  
  // Estados da interface
  const [activeTab, setActiveTab] = useState<'lyrics' | 'comments' | 'related'>('lyrics')
  const [isLiked, setIsLiked] = useState(false)
  const [showLyrics, setShowLyrics] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Buscar dados da música
  const track = mockTracks[id as keyof typeof mockTracks] || mockTracks['1']

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  // Funções do player
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // Aqui você integraria com o player real
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value))
    // Aqui você integraria com o player real
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // Se estava mudo, restaura o volume anterior
    if (isMuted && volume === 0) {
      setVolume(0.8)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    // Aqui você integraria com a API
  }

  const handleDownload = () => {
    alert('Download iniciado! (Funcionalidade simulada)')
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copiado para a área de transferência!')
  }

  const handleAddToPlaylist = () => {
    alert('Adicionar à playlist (Funcionalidade em desenvolvimento)')
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      alert(`Comentário adicionado: "${newComment}"`)
      setNewComment('')
    }
  }

  const handleDonate = () => {
    alert(`Apoiar ${track.artist.name} - Funcionalidade em desenvolvimento`)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-800"></div>
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 w-64 bg-gray-800 rounded"></div>
                <div className="h-32 bg-gray-800 rounded"></div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-800 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-800 rounded"></div>
                <div className="h-32 bg-gray-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header com botão voltar */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition"
          >
            <FaArrowLeft className="mr-2" />
            Voltar
          </button>
        </div>
      </div>

      {/* Hero Section - Capa da música */}
      <div className="relative bg-gradient-to-b from-gray-800 to-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ 
            backgroundImage: track.cover_image 
              ? `url(${track.cover_image})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}
        />
        
        <div className="relative container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
            {/* Capa do álbum */}
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl">
                {track.cover_image ? (
                  <Image
                    src={track.cover_image}
                    alt={track.title}
                    width={320}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center">
                    <FaMusic className="text-6xl text-white/80" />
                  </div>
                )}
              </div>

              {/* Play button overlay */}
              <motion.button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
                  {isPlaying ? (
                    <FaPause className="text-2xl text-white" />
                  ) : (
                    <FaPlay className="text-2xl text-white ml-1" />
                  )}
                </div>
              </motion.button>
            </div>

            {/* Informações da música */}
            <div className="flex-1">
              <div className="mb-3">
                <span className="text-sm text-gray-400 uppercase tracking-wide">{track.genre}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{track.title}</h1>
              
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">{track.artist.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-indigo-400">{track.artist.name}</h3>
                  <p className="text-gray-400">{track.album}</p>
                </div>
                {track.artist.verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Estatísticas */}
              <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
                <span className="flex items-center">
                  <FaHeadphones className="mr-1" />
                  {track.plays_count.toLocaleString()} reproduções
                </span>
                <span className="flex items-center">
                  <FaHeart className="mr-1" />
                  {track.likes_count.toLocaleString()} curtidas
                </span>
                <span className="flex items-center">
                  <FaDownload className="mr-1" />
                  {track.download_count.toLocaleString()} downloads
                </span>
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  {new Date(track.release_date).toLocaleDateString('pt-PT')}
                </span>
              </div>

              {/* Ações principais */}
              <div className="flex flex-wrap items-center gap-4">
                <motion.button
                  onClick={togglePlay}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full flex items-center font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                  {isPlaying ? 'Pausar' : 'Reproduzir'}
                </motion.button>

                <button
                  onClick={handleLike}
                  className={`p-3 rounded-full transition ${
                    isLiked ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <FaHeart />
                </button>

                <button
                  onClick={handleDownload}
                  className="p-3 rounded-full bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <FaDownload />
                </button>

                <button
                  onClick={handleAddToPlaylist}
                  className="p-3 rounded-full bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <FaPlus />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-gray-800 text-gray-400 hover:text-white transition"
                >
                  <FaShare />
                </button>

                <button
                  onClick={handleDonate}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-full flex items-center font-semibold"
                >
                  <FaGift className="mr-2" />
                  Apoiar Artista
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="sticky top-16 bg-gray-800/95 backdrop-blur-sm z-40 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Controles de reprodução */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsShuffled(!isShuffled)}
                className={`p-2 rounded-full transition ${
                  isShuffled ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaRandom />
              </button>
              
              <button className="p-2 rounded-full text-gray-400 hover:text-white transition">
                <FaStepBackward />
              </button>
              
              <button
                onClick={togglePlay}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center transition"
              >
                {isPlaying ? <FaPause /> : <FaPlay className="ml-0.5" />}
              </button>
              
              <button className="p-2 rounded-full text-gray-400 hover:text-white transition">
                <FaStepForward />
              </button>
              
              <button
                onClick={() => setIsRepeating(!isRepeating)}
                className={`p-2 rounded-full transition ${
                  isRepeating ? 'text-indigo-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                <FaRedo />
              </button>
            </div>

            {/* Progresso da música */}
            <div className="flex-1 flex items-center space-x-4">
              <span className="text-sm text-gray-400 w-12">
                {formatTime(currentTime)}
              </span>
              
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={track.duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <span className="text-sm text-gray-400 w-12">
                {formatTime(track.duration)}
              </span>
            </div>

            {/* Controles de volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full text-gray-400 hover:text-white transition"
              >
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              
              <div className="w-24">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              
              <button className="p-2 rounded-full text-gray-400 hover:text-white transition">
                <FaListUl />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2">
            {/* Descrição */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Sobre esta música</h3>
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {track.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-700 mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'lyrics', label: 'Letra', icon: <FaMusic /> },
                  { id: 'comments', label: 'Comentários', icon: <FaComment /> },
                  { id: 'related', label: 'Relacionadas', icon: <FaListUl /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-500'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Conteúdo das tabs */}
            <AnimatePresence mode="wait">
              {activeTab === 'lyrics' && (
                <motion.div
                  key="lyrics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Letra</h3>
                    <button
                      onClick={() => setShowLyrics(!showLyrics)}
                      className="text-indigo-400 hover:text-indigo-300 transition"
                    >
                      {showLyrics ? 'Ocultar' : 'Mostrar'}
                    </button>
                  </div>
                  
                  {showLyrics && (
                    <div className="whitespace-pre-line text-gray-300 leading-loose">
                      {track.lyrics}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'comments' && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Formulário de comentário */}
                  <form onSubmit={handleCommentSubmit} className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Deixe um comentário</h3>
                    <div className="flex space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold">U</span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="O que você achou desta música?"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-400">
                            {newComment.length}/280 caracteres
                          </span>
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
                          >
                            Comentar
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Lista de comentários */}
                  <div className="space-y-4">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="bg-gray-800 rounded-xl p-6">
                        <div className="flex space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{comment.user.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{comment.user}</h4>
                              <span className="text-sm text-gray-400">
                                {new Date(comment.timestamp).toLocaleDateString('pt-PT')}
                              </span>
                            </div>
                            <p className="text-gray-300 mb-3">{comment.content}</p>
                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 text-gray-400 hover:text-indigo-400 transition">
                                <FaThumbsUp className="text-sm" />
                                <span className="text-sm">{comment.likes}</span>
                              </button>
                              <button className="text-gray-400 hover:text-white transition text-sm">
                                Responder
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'related' && (
                <motion.div
                  key="related"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold mb-4">Músicas Relacionadas</h3>
                  {mockRelatedTracks.map((relatedTrack) => (
                    <div 
                      key={relatedTrack.id}
                      className="flex items-center p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition group cursor-pointer"
                      onClick={() => router.push(`/track/${relatedTrack.id}`)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg mr-4 flex items-center justify-center">
                        <FaMusic className="text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{relatedTrack.title}</h4>
                        <p className="text-sm text-gray-400">
                          {relatedTrack.artist} • {relatedTrack.plays_count.toLocaleString()} reproduções
                        </p>
                      </div>
                      <div className="text-gray-400 mr-4">
                        {formatTime(relatedTrack.duration)}
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition p-2 hover:bg-indigo-600 rounded-full">
                        <FaPlay className="text-white text-sm" />
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações técnicas */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Informações Técnicas</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Duração:</span>
                  <span>{formatTime(track.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gênero:</span>
                  <span>{track.genre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Álbum:</span>
                  <span>{track.album}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Qualidade:</span>
                  <span className="text-green-400">{track.audio_quality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lançamento:</span>
                  <span>{new Date(track.release_date).toLocaleDateString('pt-PT')}</span>
                </div>
                {track.is_premium && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipo:</span>
                    <span className="flex items-center text-yellow-400">
                      <FaCrown className="mr-1 text-sm" />
                      Premium
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaHeadphones className="text-indigo-400" />
                    <span className="text-sm">Reproduções</span>
                  </div>
                  <span className="font-semibold">{track.plays_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaHeart className="text-red-400" />
                    <span className="text-sm">Curtidas</span>
                  </div>
                  <span className="font-semibold">{track.likes_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaDownload className="text-green-400" />
                    <span className="text-sm">Downloads</span>
                  </div>
                  <span className="font-semibold">{track.download_count.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaComment className="text-blue-400" />
                    <span className="text-sm">Comentários</span>
                  </div>
                  <span className="font-semibold">{mockComments.length}</span>
                </div>
              </div>
            </div>

            {/* Apoiar artista */}
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-xl p-6">
              <h3 className="font-bold mb-2 text-yellow-400">Apoie o Artista</h3>
              <p className="text-sm text-gray-300 mb-4">
                Mostre seu apoio ao {track.artist.name} e ajude na criação de mais conteúdo incrível.
              </p>
              <button
                onClick={handleDonate}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-3 rounded-lg transition font-semibold flex items-center justify-center"
              >
                <FaGift className="mr-2" />
                Apoiar com Doação
              </button>
            </div>

            {/* Compartilhar */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Compartilhar</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg transition"
                >
                  <FaShare />
                  <span className="text-sm">Copiar Link</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 py-3 rounded-lg transition">
                  <span className="text-sm">WhatsApp</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg transition">
                  <span className="text-sm">Facebook</span>
                </button>
                <button className="flex items-center justify-center space-x-2 bg-blue-400 hover:bg-blue-500 py-3 rounded-lg transition">
                  <span className="text-sm">Twitter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilo customizado para sliders */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-webkit-slider-thumb:hover {
          background: #4f46e5;
          transform: scale(1.1);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}