// src/app/videos/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaRegHeart, 
  FaShare, 
  FaComment, 
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaLink,
  FaMusic,
  FaClock,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'

export default function VideoDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [comment, setComment] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [showMonetizationInfo, setShowMonetizationInfo] = useState(false)
  
  // Simulação de dados do vídeo
  const videoData = {
    id: id,
    title: 'Distância',
    artist: 'Nirvana',
    artistId: '123',
    coverUrl: 'https://i1.sndcdn.com/artworks-775MIadN8jaJDuCt-JXiSdA-t240x240.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=example1',
    views: 12345,
    likes: 789,
    comments: 56,
    duration: 184,
    releaseDate: '2025-01-15',
    monetized: true,
    trackId: '123',
    description: `Videoclipe oficial da música "Distância" do artista Nirvana, lançada em 2025.
    
Este vídeo foi produzido com o apoio dos fãs através da plataforma EiMusic. Filmado nas praias de Moçambique, o clipe retrata a distância emocional entre duas pessoas que se amam.

Direção: Allen Santos
Produção: EiMusic Studios
Edição: Maria Silva`,
    artistImageUrl: 'https://i.ytimg.com/vi/yK0i9OG3T0k/hqdefault.jpg',
    thumbnail: 'https://i.ytimg.com/vi/yK0i9OG3T0k/hqdefault.jpg',
    monetizationInfo: {
      enabled: true,
      totalEarnings: 320.45,
      viewReward: 0.02,
      supportersCount: 15,
      supportersReward: 120.50,
      adsReward: 199.95,
      lastPayout: '2025-04-15'
    }
  }
  
  // Comentários simulados
  const videoComments = [
    { id: 1, userId: '111', username: 'João Silva', content: 'Esse clipe ficou demais! Parabéns pela produção.', date: '2025-05-01T10:34:00', userImage: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, userId: '222', username: 'Ana Fernandes', content: 'Música incrível, adoro o refrão!', date: '2025-04-28T15:22:00', userImage: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, userId: '333', username: 'Carlos Mendes', content: 'As filmagens nas praias de Moçambique ficaram sensacionais, a fotografia está linda.', date: '2025-04-25T09:17:00', userImage: 'https://randomuser.me/api/portraits/men/67.jpg' },
  ]
  
  // Vídeos relacionados
  const relatedVideos = [
    {
      id: '2',
      title: 'Qual é a tua',
      artist: 'Nirvana',
      thumbnail: 'https://i.ytimg.com/vi/C6COAFLAoIo/maxresdefault.jpg',
      views: 8765,
      releaseDate: '2024-12-10',
    },
    {
      id: '3',
      title: 'Petalás',
      artist: 'Nirvana feat (Lil Skuyzi & Sélcia)',
      thumbnail: 'https://i.ytimg.com/vi/yK0i9OG3T0k/hqdefault.jpg',
      views: 23456,
      releaseDate: '2025-02-05',
    },
    {
      id: '4',
      title: 'Não voltar atrás',
      artist: 'Nirvana feat (7TH Streetz Boyz)',
      thumbnail: 'https://i1.sndcdn.com/artworks-Ixlqm1BQlHbPwJii-jcEjzA-t240x240.jpg',
      views: 7890,
      releaseDate: '2025-03-01',
    },
  ]
  
  // Formatador para números
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }
  
  // Formatador de data
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date(dateString).toLocaleDateString('pt-BR', options)
  }
  
  // Formatador de duração
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'MZN'
    })
  }
  
  // Toggle de like
  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    setIsLiked(!isLiked)
  }
  
  // Submeter comentário
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !isAuthenticated) return
    
    // Aqui você chamaria a API para salvar o comentário
    console.log('Comentário enviado:', comment)
    setComment('')
  }
  
  // Navegar para o perfil do artista
  const goToArtistProfile = () => {
    router.push(`/artist/${videoData.artistId}`)
  }
  
  // Navegar para a música
  const goToTrack = () => {
    router.push(`/track/${videoData.trackId}`)
  }
  
  // Compartilhar vídeo
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: videoData.title,
        text: `Assista ${videoData.title} de ${videoData.artist} no EiMusic`,
        url: window.location.href,
      })
    } else {
      // Fallback, copiar link para a área de transferência
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copiado para a área de transferência!'))
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-24">
      {/* Área do player de vídeo */}
      <div className="w-full bg-black aspect-video max-h-[70vh]">
        <div className="h-full w-full flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="bg-purple-600 rounded-full p-6 inline-block mb-4">
              <FaPlay className="text-4xl" />
            </div>
            <p className="text-gray-300">Clique para reproduzir o vídeo</p>
            <p className="text-xs text-gray-500 mt-2">O vídeo é reproduzido aqui.</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2">
            {/* Cabeçalho do vídeo */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{videoData.title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-gray-400 text-sm">
                <div className="flex items-center">
                  <FaEye className="mr-1" /> {formatNumber(videoData.views)} visualizações
                </div>
                <div className="flex items-center">
                  <FaHeart className="mr-1" /> {formatNumber(videoData.likes)} likes
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-1" /> {formatDate(videoData.releaseDate)}
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-1" /> {formatDuration(videoData.duration)}
                </div>
              </div>
            </div>
            
            {/* Ações */}
            <div className="flex flex-wrap gap-3 mb-6">
              <motion.button
                onClick={handleLikeToggle}
                className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-full px-4 py-2 hover:bg-gray-700/60 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLiked ? (
                  <>
                    <FaHeart className="text-purple-500" /> Curtido
                  </>
                ) : (
                  <>
                    <FaRegHeart /> Curtir
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={handleShare}
                className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-full px-4 py-2 hover:bg-gray-700/60 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaShare /> Compartilhar
              </motion.button>
              
              <motion.button
                onClick={goToTrack}
                className="flex items-center gap-2 bg-gray-800/60 border border-gray-700 rounded-full px-4 py-2 hover:bg-gray-700/60 transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaMusic /> Ouvir música
              </motion.button>
            </div>
            
            {/* Informações do artista */}
            <div className="flex items-center gap-3 mb-6 bg-gray-800/40 rounded-lg p-4">
              <div 
                className="w-12 h-12 rounded-full overflow-hidden cursor-pointer"
                onClick={goToArtistProfile}
              >
                <Image 
                  src={videoData.artistImageUrl} 
                  alt={videoData.artist} 
                  width={48} 
                  height={48} 
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div>
                <h3 
                  className="font-medium hover:text-purple-400 cursor-pointer"
                  onClick={goToArtistProfile}
                >
                  {videoData.artist}
                </h3>
                <p className="text-gray-400 text-sm">Artista</p>
              </div>
              <button 
                className="ml-auto bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-1 text-sm transition"
                onClick={goToArtistProfile}
              >
                Ver perfil
              </button>
            </div>
            
            {/* Descrição */}
            <div className="mb-8 bg-gray-800/40 rounded-lg p-4">
              <h3 className="font-medium mb-2">Descrição</h3>
              <div className={`text-gray-300 whitespace-pre-line ${!showMore && 'line-clamp-3'}`}>
                {videoData.description}
              </div>
              {videoData.description.split('\n').length > 3 && (
                <button 
                  onClick={() => setShowMore(!showMore)} 
                  className="text-purple-400 hover:text-purple-300 mt-2 flex items-center"
                >
                  {showMore ? (
                    <>Mostrar menos <FaChevronUp className="ml-1" /></>
                  ) : (
                    <>Mostrar mais <FaChevronDown className="ml-1" /></>
                  )}
                </button>
              )}
            </div>
            
            {/* Informações de monetização */}
            {videoData.monetized && (
              <div className="mb-8 bg-gray-800/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium flex items-center">
                    <FaMoneyBillWave className="text-green-500 mr-2" /> Monetização
                  </h3>
                  <button 
                    onClick={() => setShowMonetizationInfo(!showMonetizationInfo)} 
                    className="text-purple-400 hover:text-purple-300 flex items-center text-sm"
                  >
                    {showMonetizationInfo ? (
                      <>Ocultar <FaChevronUp className="ml-1" /></>
                    ) : (
                      <>Detalhes <FaChevronDown className="ml-1" /></>
                    )}
                  </button>
                </div>
                <div className="text-gray-300">
                  <p>Este vídeo está gerando receita para o artista.</p>
                  
                  {showMonetizationInfo && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 text-sm"
                    >
                      <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                        <div className="flex justify-between mb-2">
                          <span>Total ganho:</span>
                          <span className="font-semibold text-green-400">{formatCurrency(videoData.monetizationInfo.totalEarnings)}</span>
                        </div>
                        <div className="h-2 bg-gray-600 rounded-full mb-4">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-xs">
                            <div className="flex justify-between">
                              <span>Apoiadores:</span>
                              <span>{formatCurrency(videoData.monetizationInfo.supportersReward)}</span>
                            </div>
                            <div className="text-gray-500">De {videoData.monetizationInfo.supportersCount} fãs</div>
                          </div>
                          <div className="text-xs">
                            <div className="flex justify-between">
                              <span>Visualizações:</span>
                              <span>{formatCurrency(videoData.monetizationInfo.adsReward)}</span>
                            </div>
                            <div className="text-gray-500">{formatCurrency(videoData.monetizationInfo.viewReward)} por view</div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="flex items-center mb-2">
                        <FaInfoCircle className="mr-2 text-blue-400" /> 
                        Último pagamento em {formatDate(videoData.monetizationInfo.lastPayout)}
                      </p>
                      
                      <p className="text-sm text-gray-400">
                        A monetização inclui receita de visualizações, anúncios e apoio direto dos fãs. 
                        Os artistas recebem pagamentos mensais de acordo com o desempenho do conteúdo.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
            
            {/* Seção de Comentários */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaComment className="mr-2 text-purple-400" /> Comentários ({videoData.comments})
              </h3>
              
              {/* Formulário de comentário para usuários logados */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                      {user?.user_metadata?.avatar_url ? (
                        <Image 
                          src={user.user_metadata.avatar_url} 
                          alt="Avatar" 
                          width={40} 
                          height={40} 
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUser className="text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Deixe seu comentário sobre este vídeo..."
                        className="w-full bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        rows={2}
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!comment.trim()}
                          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-full px-4 py-2 text-sm transition"
                        >
                          Comentar
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-800/60 rounded-lg p-4 mb-6 text-center">
                  <p className="text-gray-300 mb-2">Entre para deixar seu comentário</p>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2 text-sm transition"
                  >
                    Entrar
                  </button>
                </div>
              )}
              
              {/* Lista de comentários */}
              <div className="space-y-4">
                {videoComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 bg-gray-800/40 p-3 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                      <Image 
                        src={comment.userImage} 
                        alt={comment.username} 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{comment.username}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Vídeos relacionados */}
            <div className="bg-gray-800/40 rounded-lg p-4">
              <h3 className="font-medium mb-4">Vídeos relacionados</h3>
              
              <div className="space-y-4">
                {relatedVideos.map((video) => (
                  <div 
                    key={video.id} 
                    className="flex gap-3 hover:bg-gray-700/30 p-2 rounded-lg transition cursor-pointer"
                    onClick={() => router.push(`/videos/${video.id}`)}
                  >
                    <div className="w-24 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0 relative">
                      <Image 
                        src={video.thumbnail} 
                        alt={video.title} 
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                      <p className="text-gray-400 text-xs mb-1">{video.artist}</p>
                      <div className="flex items-center text-gray-500 text-xs">
                        <span className="flex items-center mr-2">
                          <FaEye className="mr-1" /> {formatNumber(video.views)}
                        </span>
                        <span>{formatDate(video.releaseDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                className="w-full mt-4 text-purple-400 hover:text-purple-300 text-sm"
                onClick={() => router.push('/videos')}
              >
                Ver mais vídeos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}