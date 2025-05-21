// src/app/track/[id]/page.tsx
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
  FaEllipsisH, 
  FaDownload, 
  FaComment, 
  FaMoneyBillWave,
  FaUser,
  FaCalendarAlt,
  FaHeadphones,
  FaClock,
  FaMusic
} from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'

export default function TrackDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user, isArtist, isAuthenticated } = useAuth()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [comment, setComment] = useState('')
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [donateAmount, setDonateAmount] = useState<number>(5)
  const [waveformHeights, setWaveformHeights] = useState<number[]>([])
  
  // Inicializar as alturas da forma de onda uma vez no lado do cliente
  useEffect(() => {
    const heights = Array.from({ length: 100 }, () => Math.max(20, Math.floor(Math.random() * 100)))
    setWaveformHeights(heights)
  }, [])
  
  // Simulação de dados da música (em produção, seria buscado da API)
  const track = {
    id: id,
    title: 'Distância',
    artistId: '123',
    artistName: 'Nirana',
    coverUrl: 'https://i1.sndcdn.com/artworks-775MIadN8jaJDuCt-JXiSdA-t240x240.jpg',
    audioUrl: '/audio/sample.mp3',
    duration: 184, // em segundos
    plays: 4321,
    likes: 218,
    comments: 32,
    releaseDate: '2025-01-15',
    genre: 'Hip Hop',
    description: 'Nova música "Distância", falando sobre separação e superação. Produzida por DJ Zay.',
    tags: ['hip hop', 'rap', 'mozambique'],
    isExplicit: false,
    artistImageUrl: 'https://i.ytimg.com/vi/yK0i9OG3T0k/hqdefault.jpg'
  }
  
  // Comentários simulados
  const trackComments = [
    { id: 1, userId: '111', username: 'João Silva', content: 'Muito bom! Estou curtindo demais essa música.', date: '2025-05-01T10:34:00', userImage: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, userId: '222', username: 'Ana Fernandes', content: 'Melhor faixa do mês! Você superou minhas expectativas.', date: '2025-04-28T15:22:00', userImage: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, userId: '333', username: 'Carlos Mendes', content: 'Ritmo contagiante, parabéns pelo trabalho!', date: '2025-04-25T09:17:00', userImage: 'https://randomuser.me/api/portraits/men/67.jpg' },
  ]
  
  // Músicas relacionadas simuladas
  const relatedTracks = [
    { id: '1', title: 'Qual é a tua', artist: 'Nirvana', coverUrl: 'data:image/jpeg;base64,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', plays: 1250 },
    { id: '2', title: 'Petalás', artist: 'Nirvana feat (Lil Skuyzi & Sélcia)', coverUrl: 'https://i.ytimg.com/vi/yK0i9OG3T0k/hqdefault.jpg', plays: 3768 },
    { id: '3', title: 'Não voltar atrás', artist: 'Nirvana feat (7TH Streetz Boyz)', coverUrl: 'https://i1.sndcdn.com/artworks-Ixlqm1BQlHbPwJii-jcEjzA-t240x240.jpg', plays: 2142 },
  ]
  
  // Formatar duração da música
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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
  
  // Toggle de like
  const handleLikeToggle = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Aqui você chamaria a API para dar/remover like
    setIsLiked(!isLiked)
  }
  
  // Submissão de comentário
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !isAuthenticated) return
    
    // Aqui você chamaria a API para salvar o comentário
    console.log('Comentário enviado:', comment)
    setComment('')
  }
  
  // Compartilhar música
  const handleShare = () => {
    // Abre um diálogo para compartilhamento (poderia ser personalizado para redes sociais específicas)
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Ouça ${track.title} de ${track.artistName} no EiMusic`,
        url: window.location.href,
      })
    } else {
      // Fallback, copiar link para a área de transferência
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copiado para a área de transferência!'))
    }
  }
  
  // Processar doação
  const handleDonate = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Abrir modal de doação
    setShowDonateModal(true)
  }
  
  // Processar pagamento de doação
  const processDonation = () => {
    // Aqui você integraria com um gateway de pagamento
    console.log(`Doação de ${donateAmount} MZN processada`)
    setShowDonateModal(false)
    
    // Exibir mensagem de sucesso
    alert(`Obrigado pela sua doação de ${donateAmount} MZN para ${track.artistName}!`)
  }
  
  // Navegar para o perfil do artista
  const goToArtistProfile = () => {
    router.push(`/artist/${track.artistId}`)
  }
  
  // Toggle de reprodução
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    
    // Aqui você controlaria o player de áudio real
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-24">
      {/* Capa da música e área de player */}
      <div className="relative">
        <div className="h-64 sm:h-80 w-full bg-gradient-to-b from-purple-900/30 to-black">
          {track.coverUrl && (
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: `url(${track.coverUrl})`, 
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(40px)'
            }} />
          )}
          
          <div className="max-w-7xl mx-auto px-4 h-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-6 relative z-10 pt-8 md:pt-0">
            {/* Capa da Música */}
            <motion.div 
              className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                src={track.coverUrl} 
                alt={track.title} 
                width={224} 
                height={224} 
                className="w-full h-full object-cover"
                unoptimized
              />
            </motion.div>
            
            {/* Informações e controles */}
            <div className="text-center md:text-left">
              <span className="text-sm bg-purple-700/50 px-3 py-1 rounded-full">
                {track.genre}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-1">{track.title}</h1>
              <p className="text-gray-300 mb-4">
                <button 
                  onClick={goToArtistProfile}
                  className="hover:text-purple-400 transition"
                >
                  {track.artistName}
                </button>
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <motion.button
                  onClick={togglePlay}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? <FaPause /> : <FaPlay className="ml-1" />}
                </motion.button>
                
                <motion.button
                  onClick={handleLikeToggle}
                  className="text-2xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isLiked ? (
                    <FaHeart className="text-purple-500" />
                  ) : (
                    <FaRegHeart className="text-white hover:text-purple-400" />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handleShare}
                  className="text-2xl text-white hover:text-purple-400"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaShare />
                </motion.button>
                
                <motion.button
                  onClick={handleDonate}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-2 flex items-center gap-2 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaMoneyBillWave /> Doar
                </motion.button>
                
                <div className="dropdown relative">
                  <motion.button
                    className="text-2xl text-white hover:text-purple-400"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaEllipsisH />
                  </motion.button>
                  {/* Dropdown menu would appear here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações da faixa */}
          <div className="lg:col-span-2">
            {/* Waveform (simulado) */}
            <div className="bg-gray-800/60 rounded-lg p-4 mb-8">
              <div className="h-24 flex items-center justify-between">
                {/* Waveform com valores fixos ou calculados no cliente */}
                <div className="w-full flex items-end justify-between space-x-0.5">
                  {waveformHeights.length > 0 ? (
                    // Renderizar apenas no lado do cliente após o useEffect ter sido executado
                    waveformHeights.map((height, i) => (
                      <div 
                        key={i} 
                        style={{ height: `${height}%` }}
                        className={`w-1 bg-gradient-to-t ${
                          i < 30 
                            ? 'from-purple-600 to-purple-400' 
                            : 'from-gray-600 to-gray-400'
                        }`}
                      ></div>
                    ))
                  ) : (
                    // Renderizar um placeholder até que o useEffect seja executado
                    <div className="w-full h-full bg-gray-700 animate-pulse rounded"></div>
                  )}
                </div>
              </div>
              <div className="flex justify-between text-gray-400 text-sm mt-2">
                <span>0:30</span>
                <span>{formatDuration(track.duration)}</span>
              </div>
            </div>
            
            {/* Estatísticas */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-gray-300">
              <div className="flex items-center">
                <FaHeadphones className="text-purple-400 mr-2" />
                <span>{track.plays.toLocaleString()} plays</span>
              </div>
              <div className="flex items-center">
                <FaHeart className="text-purple-400 mr-2" />
                <span>{track.likes.toLocaleString()} likes</span>
              </div>
              <div className="flex items-center">
                <FaComment className="text-purple-400 mr-2" />
                <span>{track.comments.toLocaleString()} comentários</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="text-purple-400 mr-2" />
                <span>Lançado em {formatDate(track.releaseDate)}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="text-purple-400 mr-2" />
                <span>{formatDuration(track.duration)}</span>
              </div>
            </div>
            
            {/* Descrição */}
            {track.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Descrição</h2>
                <p className="text-gray-300">{track.description}</p>
                {track.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {track.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Seção de Comentários */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaComment className="mr-2 text-purple-400" /> Comentários
              </h2>
              
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
                        placeholder="Escreva um comentário..."
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
                {trackComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
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
          <div>
            {/* Perfil do Artista */}
            <div className="bg-gray-800/60 rounded-lg p-5 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-14 h-14 rounded-full overflow-hidden cursor-pointer"
                  onClick={goToArtistProfile}
                >
                  <Image 
                    src={track.artistImageUrl} 
                    alt={track.artistName} 
                    width={56} 
                    height={56} 
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 
                    className="font-semibold text-lg hover:text-purple-400 cursor-pointer"
                    onClick={goToArtistProfile}
                  >
                    {track.artistName}
                  </h3>
                  <p className="text-gray-400 text-sm">Artista</p>
                </div>
              </div>
              <button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-2 text-sm font-medium transition"
                onClick={goToArtistProfile}
              >
                Ver Perfil
              </button>
            </div>
            
            {/* Músicas Relacionadas */}
            <div className="bg-gray-800/60 rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <FaMusic className="mr-2 text-purple-400" /> Mais deste artista
              </h3>
              
              <div className="space-y-3">
                {relatedTracks.map((track) => (
                  <div 
                    key={track.id} 
                    className="flex items-center gap-3 p-2 hover:bg-gray-700/50 rounded-lg transition cursor-pointer"
                    onClick={() => router.push(`/track/${track.id}`)}
                  >
                    <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
                      <Image 
                        src={track.coverUrl} 
                        alt={track.title} 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {track.plays.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Doação */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <motion.div 
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaMoneyBillWave className="mr-2 text-green-500" /> Apoiar {track.artistName}
            </h2>
            
            <p className="text-gray-300 mb-4">
              Sua contribuição ajuda o artista a continuar criando conteúdo incrível.
            </p>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Escolha um valor (MZN):</label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {[5, 10, 25, 50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDonateAmount(amount)}
                    className={`py-2 rounded-lg transition ${
                      donateAmount === amount 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {amount}
                  </button>
                ))}
              </div>
              
              <div className="relative mb-4">
                <span className="absolute left-3 top-3 text-gray-400">MZN</span>
                <input
                  type="number"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(Number(e.target.value))}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-12 pr-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDonateModal(false)}
                className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={processDonation}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                Confirmar Doação
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
                