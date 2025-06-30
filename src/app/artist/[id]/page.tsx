'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaPlay, 
  FaHeart, 
  FaShare, 
  FaInstagram, 
  FaTwitter, 
  FaGlobe,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMusic,
  FaVideo,
  FaUsers,
  FaCrown,
  FaGift,
  FaHeadphones,
  FaEllipsisH,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import artistService from '@/services/artistService'

// Componentes para monetização
import DonationButton from '@/components/monetization/DonationButton'
import SupportModal from '@/components/monetization/SupportModal'
import PremiumBadge from '@/components/monetization/PremiumBadge'

interface ArtistDetailPageProps {
  // Props serão definidas quando necessário
}

export default function ArtistDetailPage() {
  const { id } = useParams() as { id: string }
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'music' | 'videos' | 'about'>('overview')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [showFullBio, setShowFullBio] = useState(false)
  
  // Fetch artist data
  const { 
    data: artist,
    isLoading: artistLoading,
    error: artistError 
  } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => artistService.getArtistById(id),
  })
  
  // Fetch artist tracks
  const { 
    data: tracks,
    isLoading: tracksLoading
  } = useQuery({
    queryKey: ['artist-tracks', id],
    queryFn: () => artistService.getArtistTracks(id),
    enabled: !!id,
  })
  
  // Dados mockados para demonstração (substituir por dados reais)
  const artistStats = {
    monthlyListeners: 45230,
    totalStreams: 1240000,
    followers: 8547,
    supportersThisMonth: 127,
    totalEarned: 15600 // em MT
  }
  
  const recentSupports = [
    { user: 'Maria Silva', amount: 50, message: 'Música incrível!', time: '2 min' },
    { user: 'João Santos', amount: 30, message: 'Continue assim!', time: '1 h' },
    { user: 'Ana Costa', amount: 100, message: '🔥🔥🔥', time: '3 h' },
  ]

  const upcomingEvents = [
    {
      id: '1',
      title: 'Live Acústica',
      date: '2024-12-20',
      time: '20:00',
      price: 50,
      type: 'live_concert'
    },
    {
      id: '2', 
      title: 'Masterclass de Produção',
      date: '2024-12-25',
      time: '15:00',
      price: 150,
      type: 'masterclass'
    }
  ]

  // Handle loading states
  if (artistLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-80 bg-gray-800 relative">
            <div className="absolute bottom-6 left-6 flex items-end space-x-6">
              <div className="w-32 h-32 bg-gray-700 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-8 w-48 bg-gray-700 rounded"></div>
                <div className="h-4 w-32 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-6 w-24 bg-gray-800 rounded"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-800 rounded"></div>
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

  if (artistError || !artist) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Artista não encontrado</h1>
          <p className="text-gray-400 mb-6">
            Não foi possível carregar os dados deste artista.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-indigo-600 rounded-full hover:bg-indigo-700 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative h-80 bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Background com imagem do artista ou gradiente */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: artist.profile_image_url 
              ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url(${artist.profile_image_url})` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          }}
        />
        
        {/* Conteúdo do hero */}
        <div className="relative container mx-auto px-6 h-full flex items-end pb-8">
          <div className="flex items-end space-x-6 w-full">
            {/* Avatar do artista */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                {artist.profile_image_url ? (
                  <Image
                    src={artist.profile_image_url}
                    alt={artist.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
                    {artist.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              {/* Badge de artista verificado */}
              <div className="absolute -bottom-2 -right-2">
                <PremiumBadge verified={true} />
              </div>
            </div>
            
            {/* Informações principais */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold">{artist.name}</h1>
                <FaCrown className="text-yellow-500" />
              </div>
              
              <div className="flex items-center space-x-6 text-gray-300 mb-4">
                <span className="flex items-center">
                  <FaHeadphones className="mr-1" />
                  {artistStats.monthlyListeners.toLocaleString()} ouvintes mensais
                </span>
                <span className="flex items-center">
                  <FaUsers className="mr-1" />
                  {artistStats.followers.toLocaleString()} seguidores
                </span>
              </div>
              
              {/* Ações principais */}
              <div className="flex items-center space-x-4">
                <motion.button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full flex items-center font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaPlay className="mr-2" />
                  Reproduzir
                </motion.button>
                
                <motion.button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-3 rounded-full border-2 transition-colors font-semibold ${
                    isFollowing
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </motion.button>
                
                {/* Botão de apoio financeiro */}
                <DonationButton
                  artistId={artist.id}
                  artistName={artist.name}
                  onSuccess={() => {
                    // Refresh artist data ou mostrar feedback
                  }}
                />
                
                <button className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition">
                  <FaShare />
                </button>
                
                <button className="p-3 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition">
                  <FaEllipsisH />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-40">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: <FaMusic /> },
              { id: 'music', label: 'Músicas', icon: <FaMusic /> },
              { id: 'videos', label: 'Vídeos', icon: <FaVideo /> },
              { id: 'about', label: 'Sobre', icon: <FaUsers /> }
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
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Estatísticas principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-indigo-400">
                        {artistStats.totalStreams.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">Total de Streams</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {artistStats.supportersThisMonth}
                      </div>
                      <div className="text-sm text-gray-400">Apoios este Mês</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {artistStats.totalEarned.toLocaleString()} MT
                      </div>
                      <div className="text-sm text-gray-400">Total Arrecadado</div>
                    </div>
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {tracks?.length || 0}
                      </div>
                      <div className="text-sm text-gray-400">Músicas</div>
                    </div>
                  </div>

                  {/* Músicas populares */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Músicas Populares</h3>
                    <div className="space-y-2">
                      {tracks?.slice(0, 5).map((track, index) => (
                        <div 
                          key={track.id}
                          className="flex items-center p-3 hover:bg-gray-800/50 rounded-lg transition group"
                        >
                          <div className="w-8 text-center text-gray-400 group-hover:text-white">
                            {index + 1}
                          </div>
                          <div className="flex-1 ml-4">
                            <h4 className="font-medium">{track.title}</h4>
                            <p className="text-sm text-gray-400">
                              {track.plays_count?.toLocaleString() || 0} reproduções
                            </p>
                          </div>
                          <div className="text-gray-400">
                            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                          </div>
                          <button className="ml-4 opacity-0 group-hover:opacity-100 transition">
                            <FaPlay className="text-indigo-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Próximos eventos */}
                  {upcomingEvents.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Próximos Eventos</h3>
                      <div className="space-y-4">
                        {upcomingEvents.map((event) => (
                          <div 
                            key={event.id}
                            className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700/50 transition"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-lg">{event.title}</h4>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                  <span className="flex items-center">
                                    <FaCalendarAlt className="mr-1" />
                                    {new Date(event.date).toLocaleDateString('pt-PT')}
                                  </span>
                                  <span>{event.time}</span>
                                  <span className="text-indigo-400 font-semibold">
                                    {event.price} MT
                                  </span>
                                </div>
                              </div>
                              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
                                Comprar Ingresso
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'music' && (
                <motion.div
                  key="music"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-2xl font-bold mb-6">Todas as Músicas</h3>
                  {tracksLoading ? (
                    <div className="space-y-4">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-800 rounded animate-pulse"></div>
                      ))}
                    </div>
                  ) : tracks && tracks.length > 0 ? (
                    <div className="space-y-2">
                      {tracks.map((track, index) => (
                        <div 
                          key={track.id}
                          className="flex items-center p-4 hover:bg-gray-800/50 rounded-lg transition group"
                        >
                          <div className="w-12 h-12 bg-gray-700 rounded-lg mr-4 flex items-center justify-center">
                            <FaMusic className="text-indigo-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{track.title}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(track.release_date || track.created_at).getFullYear()} • {track.plays_count?.toLocaleString() || 0} reproduções
                            </p>
                          </div>
                          <div className="text-gray-400 mr-4">
                            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 transition">
                            <FaPlay className="text-indigo-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      Nenhuma música encontrada para este artista.
                    </p>
                  )}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Biografia</h3>
                    <div className="bg-gray-800 rounded-xl p-6">
                      <p className="text-gray-300 leading-relaxed">
                        {showFullBio ? 
                          (artist.bio || 'Este artista ainda não adicionou uma biografia.') :
                          (artist.bio ? 
                            `${artist.bio.substring(0, 300)}${artist.bio.length > 300 ? '...' : ''}` :
                            'Este artista ainda não adicionou uma biografia.'
                          )
                        }
                      </p>
                      {artist.bio && artist.bio.length > 300 && (
                        <button 
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="mt-3 text-indigo-400 hover:text-indigo-300 transition flex items-center"
                        >
                          {showFullBio ? 'Ver menos' : 'Ver mais'}
                          {showFullBio ? <FaChevronUp className="ml-1" /> : <FaChevronDown className="ml-1" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Redes sociais */}
                  {artist.social_links && (
                    <div>
                      <h3 className="text-xl font-bold mb-4">Redes Sociais</h3>
                      <div className="flex space-x-4">
                        {artist.social_links.instagram && (
                          <a 
                            href={artist.social_links.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg transition"
                          >
                            <FaInstagram className="text-pink-500" />
                            <span>Instagram</span>
                          </a>
                        )}
                        {artist.social_links.twitter && (
                          <a 
                            href={artist.social_links.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg transition"
                          >
                            <FaTwitter className="text-blue-400" />
                            <span>Twitter</span>
                          </a>
                        )}
                        {artist.social_links.website && (
                          <a 
                            href={artist.social_links.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-3 rounded-lg transition"
                          >
                            <FaGlobe className="text-green-400" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apoios recentes */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center">
                <FaGift className="mr-2 text-yellow-500" />
                Apoios Recentes
              </h3>
              <div className="space-y-3">
                {recentSupports.map((support, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {support.user.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{support.user}</div>
                      <div className="text-gray-400">{support.message}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">{support.amount} MT</div>
                      <div className="text-xs text-gray-400">{support.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowSupportModal(true)}
                className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 rounded-lg transition font-semibold"
              >
                Apoiar Artista
              </button>
            </div>

            {/* Informações adicionais */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Informações</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-gray-400" />
                  <span>Maputo, Moçambique</span>
                </div>
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-400" />
                  <span>Membro desde {new Date(artist.created_at).getFullYear()}</span>
                </div>
                <div className="flex items-center">
                  <FaMusic className="mr-2 text-gray-400" />
                  <span>{tracks?.length || 0} músicas publicadas</span>
                </div>
              </div>
            </div>

            {/* Widget de fidelidade */}
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-600/30 rounded-xl p-6">
              <h3 className="font-bold mb-2 text-yellow-400">Fã Level</h3>
              <div className="flex items-center space-x-2 mb-3">
                <FaCrown className="text-yellow-500" />
                <span className="font-semibold">Superfã</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-gray-300">
                Mais 50 pontos para o próximo nível
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de apoio */}
      <SupportModal
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        artist={artist}
        onSuccess={(amount) => {
          setShowSupportModal(false)
          // Refresh data ou mostrar feedback
        }}
      />
    </div>
  )
}