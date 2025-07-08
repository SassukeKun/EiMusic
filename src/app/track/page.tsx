// src/app/track/page.tsx
'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/utils/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
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
  FaFilter,
  FaSort,
  FaThLarge,
  FaList,
  FaEllipsisV,
  FaPlus,
  FaEye,
  FaUserCircle,
  FaClock,
  FaRandom,
  FaLock,
  FaGlobe,
  FaStar,
  FaFireAlt,
  FaMapMarkerAlt,
  FaMicrophone,
  FaCheckCircle,
  FaDownload,
  FaHeadphones,
  FaVolumeUp,
  FaTimes
} from 'react-icons/fa'

// Interface para músicas
interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  duration: string;
  coverImage: string;
  audioUrl: string;
  genre: string;
  city: string;
  releaseDate: string;
  playCount: number;
  likes: number;
  isExplicit: boolean;
  isPopular: boolean;
  featured: boolean;
  bpm?: number;
  key?: string;
  language: 'Português' | 'Changana' | 'Sena' | 'Outros';
}

export default function TracksPage() {
  const { user, isAuthenticated } = useAuth()
  const [tracks, setTracks] = useState<Track[]>([])
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedCity, setSelectedCity] = useState('all')
  const [selectedArtist, setSelectedArtist] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Estados de player
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set())

  // Mock data para músicas moçambicanas
  // Dados das músicas vindos do Supabase
  const supabase = getSupabaseBrowserClient();

  const mockTracks: Track[] = [
    {
      id: '1',
      title: 'Nunca tou no Place',
      artist: 'Hernâni & Laylizzy',
      artistId: '1',
      album: 'Colaborações',
      duration: '3:45',
      coverImage: 'https://xigubo.com/wp-content/uploads/2022/11/231FEECC-35CF-4DEB-ABC8-621482F88F92-e1669184204697.jpeg',
      audioUrl: '/audio/nunca-tou-no-place.mp3',
      genre: 'Rap',
      city: 'Maputo',
      releaseDate: '2023-11-15',
      playCount: 2500000,
      likes: 45000,
      isExplicit: false,
      isPopular: true,
      featured: true,
      bpm: 95,
      key: 'C Major',
      language: 'Português'
    },
    {
      id: '2',
      title: 'No Chapa',
      artist: 'MC Mastoni',
      artistId: '3',
      album: 'Vida Real',
      duration: '4:12',
      coverImage: 'https://i.ytimg.com/vi/rMqsjbG5Yr4/hq720.jpg',
      audioUrl: '/audio/no-chapa.mp3',
      genre: 'Hip-Hop',
      city: 'Maputo',
      releaseDate: '2024-01-20',
      playCount: 1800000,
      likes: 32000,
      isExplicit: true,
      isPopular: true,
      featured: false,
      bpm: 88,
      key: 'F Minor',
      language: 'Português'
    },
    {
      id: '3',
      title: 'Maputo City',
      artist: 'Stewart Sukuma',
      artistId: '4',
      album: 'Capital Sounds',
      duration: '3:28',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/maputo-city.mp3',
      genre: 'Afrobeats',
      city: 'Beira',
      releaseDate: '2023-12-10',
      playCount: 1200000,
      likes: 28000,
      isExplicit: false,
      isPopular: true,
      featured: false,
      bpm: 102,
      key: 'G Major',
      language: 'Português'
    },
    {
      id: '4',
      title: 'Beira Vibes',
      artist: 'Yaba Buluku Boyz',
      artistId: '8',
      album: 'Coastal Rhythms',
      duration: '3:56',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/beira-vibes.mp3',
      genre: 'Afrobeats',
      city: 'Beira',
      releaseDate: '2024-02-05',
      playCount: 950000,
      likes: 22000,
      isExplicit: false,
      isPopular: false,
      featured: true,
      bpm: 110,
      key: 'D Major',
      language: 'Português'
    },
    {
      id: '5',
      title: 'Nampula Sound',
      artist: 'Mr. Bow',
      artistId: '5',
      album: 'Northern Beats',
      duration: '4:23',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/nampula-sound.mp3',
      genre: 'Marrabenta',
      city: 'Nampula',
      releaseDate: '2023-10-30',
      playCount: 2800000,
      likes: 52000,
      isExplicit: false,
      isPopular: true,
      featured: true,
      bpm: 125,
      key: 'A Minor',
      language: 'Changana'
    },
    {
      id: '6',
      title: 'Xima Tropical',
      artist: 'Zena Bakar',
      artistId: '6',
      album: 'Tropical Collection',
      duration: '3:15',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/xima-tropical.mp3',
      genre: 'Marrabenta',
      city: 'Maputo',
      releaseDate: '2024-01-08',
      playCount: 750000,
      likes: 18000,
      isExplicit: false,
      isPopular: false,
      featured: false,
      bpm: 115,
      key: 'E Major',
      language: 'Português'
    },
    {
      id: '7',
      title: 'Juventude',
      artist: 'Twenty Fingers',
      artistId: '7',
      album: 'Nova Geração',
      duration: '4:01',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/juventude.mp3',
      genre: 'R&B',
      city: 'Maputo',
      releaseDate: '2023-09-22',
      playCount: 1600000,
      likes: 35000,
      isExplicit: false,
      isPopular: true,
      featured: false,
      bpm: 85,
      key: 'C Minor',
      language: 'Português'
    },
    {
      id: '8',
      title: 'Mozambique Dreams',
      artist: 'DJ Tarico',
      artistId: '8',
      album: 'Electronic Fusion',
      duration: '5:12',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/mozambique-dreams.mp3',
      genre: 'Electronic',
      city: 'Maputo',
      releaseDate: '2024-03-01',
      playCount: 2100000,
      likes: 42000,
      isExplicit: false,
      isPopular: true,
      featured: true,
      bpm: 128,
      key: 'F# Minor',
      language: 'Outros'
    },
    {
      id: '9',
      title: 'Distância',
      artist: 'Nirvana',
      artistId: '9',
      album: 'Sentimentos',
      duration: '3:33',
      coverImage: 'https://i1.sndcdn.com/artworks-775MIadN8jaJDuCt-JXiSdA-t240x240.jpg',
      audioUrl: '/audio/distancia.mp3',
      genre: 'Trapsoul',
      city: 'Maputo',
      releaseDate: '2023-08-15',
      playCount: 1350000,
      likes: 29000,
      isExplicit: false,
      isPopular: false,
      featured: false,
      bpm: 75,
      key: 'B Minor',
      language: 'Português'
    },
    {
      id: '10',
      title: 'Não voltar atrás',
      artist: '7th Streetz Boyz',
      artistId: '10',
      album: 'Urban Collection',
      duration: '4:18',
      coverImage: 'https://i1.sndcdn.com/artworks-Ixlqm1BQlHbPwJii-jcEjzA-t240x240.jpg',
      audioUrl: '/audio/nao-voltar-atras.mp3',
      genre: 'R&B',
      city: 'Maputo',
      releaseDate: '2023-07-22',
      playCount: 890000,
      likes: 19000,
      isExplicit: false,
      isPopular: false,
      featured: false,
      bpm: 92,
      key: 'D Minor',
      language: 'Português'
    },
    {
      id: '11',
      title: 'Tete Sunrise',
      artist: 'Banda Kakana',
      artistId: '11',
      album: 'Interior Vibes',
      duration: '3:52',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/tete-sunrise.mp3',
      genre: 'Jazz',
      city: 'Tete',
      releaseDate: '2023-06-18',
      playCount: 650000,
      likes: 15000,
      isExplicit: false,
      isPopular: false,
      featured: false,
      bpm: 70,
      key: 'A Major',
      language: 'Sena'
    },
    {
      id: '12',
      title: 'Quelimane Nights',
      artist: 'Costa do Sol',
      artistId: '12',
      album: 'Zambézia Sounds',
      duration: '4:35',
      coverImage: 'https://res.cloudinary.com/ddyuofu2d/image/upload/sample.jpg',
      audioUrl: '/audio/quelimane-nights.mp3',
      genre: 'Traditional',
      city: 'Quelimane',
      releaseDate: '2023-05-20',
      playCount: 480000,
      likes: 12000,
      isExplicit: false,
      isPopular: false,
      featured: false,
      bpm: 105,
      key: 'E Minor',
      language: 'Sena'
    }
  ];

  // Filtros baseados no contexto moçambicano
  const genres = ['Rap', 'Hip-Hop', 'Afrobeats', 'Marrabenta', 'R&B', 'Electronic', 'Jazz', 'Traditional', 'Trapsoul']
  const cities = ['Maputo', 'Beira', 'Nampula', 'Tete', 'Quelimane', 'Lichinga', 'Pemba', 'Xai-Xai']
  const years = ['2024', '2023', '2022', '2021', '2020']
  
  // Extrair artistas únicos dos dados
  const artists = React.useMemo(() => Array.from(new Set(tracks.map(track => track.artist))).sort(), [tracks])

  // Opções de ordenação
  const sortOptions = [
    { value: 'popular', label: 'Mais Populares' },
    { value: 'recent', label: 'Mais Recentes' },
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'plays', label: 'Mais Reproduzidas' },
    { value: 'likes', label: 'Mais Curtidas' },
    { value: 'duration', label: 'Duração' }
  ]

  // Inicializar dados a partir do Supabase
  useEffect(() => {
    async function fetchTracks() {
      try {
        const { data: trackData, error: trackErr } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: singlesData, error: singlesErr } = await supabase
          .from('singles')
          .select('*')
          .order('created_at', { ascending: false });

        if (trackErr) console.log(trackErr.message);
        if (singlesErr) console.log(singlesErr.message);

        // Fetch artist names for mapping
        const { data: artistData, error: artistErr } = await supabase
          .from('artists')
          .select('id, name');

        if (artistErr) console.log(artistErr.message);

        const artistMap = new Map<string, string>([
          ...(artistData ?? []).map((a: any) => [a.id, a.name])
        ] as [string, string][]);

        const normalizedTracks = [...(trackData ?? []), ...(singlesData ?? [])].map((t: any) => ({
          id: t.id,
          title: t.title,
          artist: artistMap.get(t.artist_id) ?? 'Desconhecido',
          artistId: t.artist_id,
          album: '',
          duration: typeof t.duration === 'number' ? `${Math.floor(t.duration/60)}:${String(t.duration%60).padStart(2,'0')}` : '0:00',
          coverImage: t.cover_url ?? '',
          audioUrl: t.file_url,
          genre: t.genre ?? 'Desconhecido',
          city: t.city ?? 'Desconhecido',
          releaseDate: t.release_date ?? t.created_at,
          playCount: t.streams ?? 0,
          likes: t.likes_count ?? 0,
          isExplicit: t.is_explicit ?? false,
          isPopular: t.is_popular ?? false,
          featured: t.featured ?? false,
          language: 'Português'
        })) as Track[];

        setTracks(normalizedTracks);
        setFilteredTracks(normalizedTracks);
      } catch (err:any) {
        console.log('Erro ao buscar músicas:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [])

  // Aplicar filtros e busca
  useEffect(() => {
    let filtered = [...tracks]

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(track => 
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.album.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.genre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro de gênero
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(track => track.genre === selectedGenre)
    }

    // Filtro de cidade
    if (selectedCity !== 'all') {
      filtered = filtered.filter(track => track.city === selectedCity)
    }

    // Filtro de artista
    if (selectedArtist !== 'all') {
      filtered = filtered.filter(track => track.artist === selectedArtist)
    }

    // Filtro de ano
    if (selectedYear !== 'all') {
      filtered = filtered.filter(track => 
        new Date(track.releaseDate).getFullYear().toString() === selectedYear
      )
    }

    // Ordenação
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.playCount - a.playCount)
        break
      case 'recent':
        filtered.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
        break
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'plays':
        filtered.sort((a, b) => b.playCount - a.playCount)
        break
      case 'likes':
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case 'duration':
        filtered.sort((a, b) => {
          const getDurationInSeconds = (duration: string) => {
            const [minutes, seconds] = duration.split(':').map(Number)
            return minutes * 60 + seconds
          }
          return getDurationInSeconds(a.duration) - getDurationInSeconds(b.duration)
        })
        break
    }

    setFilteredTracks(filtered)
    setCurrentPage(1)
  }, [tracks, searchTerm, selectedGenre, selectedCity, selectedArtist, selectedYear, sortBy])

  // Paginação
  const totalPages = Math.ceil(filteredTracks.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTracks = filteredTracks.slice(startIndex, endIndex)

  // Funções de controle
  const handlePlay = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null)
    } else {
      setCurrentlyPlaying(trackId)
    }
    console.log('Playing track:', trackId)
  }

  const handleLike = (trackId: string) => {
    const newLikedTracks = new Set(likedTracks)
    if (newLikedTracks.has(trackId)) {
      newLikedTracks.delete(trackId)
    } else {
      newLikedTracks.add(trackId)
    }
    setLikedTracks(newLikedTracks)
    console.log('Liked track:', trackId)
  }

  // Formatação de números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Animações
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
              <h1 className="text-3xl font-bold text-white mb-2">Biblioteca Musical</h1>
              <p className="text-gray-400">
                Descubra as melhores músicas da cena moçambicana
                <span className="ml-2 text-purple-400">
                  ({filteredTracks.length} música{filteredTracks.length !== 1 ? 's' : ''})
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
          <div className="space-y-4">
            
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar músicas, artistas, álbuns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os Artistas</option>
                {artists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todos os Anos</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Filter Row 2 - Sort */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-300">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedGenre('all')
                    setSelectedCity('all')
                    setSelectedArtist('all')
                    setSelectedYear('all')
                    setSearchTerm('')
                    setSortBy('popular')
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-sm transition-colors"
                >
                  Limpar Filtros
                </button>
                
                <button
                  onClick={() => setSortBy('popular')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    sortBy === 'popular'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  🔥 Populares
                </button>
                
                <button
                  onClick={() => setSortBy('recent')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    sortBy === 'recent'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  🆕 Recentes
                </button>
                
                <button
                  onClick={() => setSelectedGenre('Marrabenta')}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedGenre === 'Marrabenta'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  🇲🇿 Marrabenta
                </button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedGenre !== 'all' || selectedCity !== 'all' || selectedArtist !== 'all' || selectedYear !== 'all' || searchTerm) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-600">
                <span className="text-sm text-gray-400">Filtros ativos:</span>
                
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs">
                    Busca: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-purple-200">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
                
                {selectedGenre !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs">
                    {selectedGenre}
                    <button onClick={() => setSelectedGenre('all')} className="ml-1 hover:text-blue-200">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
                
                {selectedCity !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs">
                    {selectedCity}
                    <button onClick={() => setSelectedCity('all')} className="ml-1 hover:text-green-200">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
                
                {selectedArtist !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-orange-600/20 text-orange-300 rounded-full text-xs">
                    {selectedArtist}
                    <button onClick={() => setSelectedArtist('all')} className="ml-1 hover:text-orange-200">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
                
                {selectedYear !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-pink-600/20 text-pink-300 rounded-full text-xs">
                    {selectedYear}
                    <button onClick={() => setSelectedYear('all')} className="ml-1 hover:text-pink-200">
                      <FaTimes size={10} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {currentTracks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <FaMusic className="text-gray-600 text-6xl mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhuma música encontrada</h3>
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
                : 'space-y-2'
              }
            >
              {currentTracks.map((track, index) => (
                viewMode === 'grid' ? (
                  <TrackCard key={track.id} track={track} index={index} />
                ) : (
                  <TrackListItem key={track.id} track={track} index={index} />
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

// Componente para Grid View
function TrackCard({ track, index }: { track: Track; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(!isPlaying)
    console.log('Playing track:', track.id)
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    console.log('Liked track:', track.id)
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ delay: index * 0.05 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-all duration-300 group"
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/track/${track.id}`} className="block">
        {/* Cover Image */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={track.coverImage === "" ? "/placeholder.png" : track.coverImage}
            alt={track.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-3">
              <motion.button
                onClick={handlePlayClick}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-3 rounded-full text-white transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
              </motion.button>
              
              <motion.button
                onClick={handleLikeClick}
                className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 p-3 rounded-full text-white transition-all duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isLiked ? <FaHeart className="text-red-500" size={18} /> : <FaRegHeart size={18} />}
              </motion.button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {track.featured && (
              <span className="px-2 py-1 bg-yellow-600/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center">
                <FaStar size={8} className="mr-1" />
                Destaque
              </span>
            )}
            {track.isPopular && (
              <span className="px-2 py-1 bg-orange-600/80 backdrop-blur-sm text-white text-xs rounded-full flex items-center">
                <FaFireAlt size={8} className="mr-1" />
                Popular
              </span>
            )}
          </div>

          {/* Explicit Badge */}
          {track.isExplicit && (
            <div className="absolute top-2 right-2">
              <span className="px-1.5 py-0.5 bg-red-600/80 backdrop-blur-sm text-white text-xs rounded font-bold">
                E
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-purple-300 transition-colors">
            {track.title}
          </h3>
          <p className="text-gray-400 text-sm mb-2 truncate">{track.artist}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span className="px-2 py-1 bg-purple-600/20 text-purple-300 rounded-full">
              {track.genre}
            </span>
            <span>{track.duration}</span>
          </div>

          <p className="text-gray-400 text-xs mb-3 truncate">{track.album}</p>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <FaPlay size={10} className="mr-1" />
                {formatNumber(track.playCount)}
              </span>
              <span className="flex items-center">
                <FaHeart size={10} className="mr-1" />
                {formatNumber(track.likes)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              <FaMapMarkerAlt size={10} />
              <span className="text-xs">{track.city}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Componente para List View
function TrackListItem({ track, index }: { track: Track; index: number }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsPlaying(!isPlaying)
    console.log('Playing track:', track.id)
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
    console.log('Liked track:', track.id)
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      }}
      transition={{ delay: index * 0.03 }}
      className="bg-gray-800/30 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-purple-500/50 transition-all duration-200 group hover:bg-gray-800/50"
      whileHover={{ scale: 1.005 }}
    >
      <Link href={`/track/${track.id}`} className="block p-4">
        <div className="flex items-center space-x-4">
          
          {/* Track Number / Play Button */}
          <div className="w-8 text-center">
            {isPlaying ? (
              <button onClick={handlePlayClick} className="text-purple-500 hover:text-purple-400">
                <FaPause size={14} />
              </button>
            ) : (
              <button
                onClick={handlePlayClick}
                className="text-gray-400 group-hover:text-white hover:text-purple-500 transition-colors"
              >
                <span className="text-sm font-medium group-hover:hidden">
                  {index + 1}
                </span>
                <FaPlay size={12} className="hidden group-hover:block" />
              </button>
            )}
          </div>

          {/* Cover Image */}
          <div className="relative w-12 h-12 bg-gray-600 rounded overflow-hidden flex-shrink-0">
            <Image
              src={track.coverImage === "" ? "/placeholder.png" : track.coverImage}
              alt={track.title}
              fill
              className="object-cover"
              unoptimized
              sizes="48px"
            />
          </div>
          
          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {track.title}
                  </h4>
                  {track.isExplicit && (
                    <span className="px-1 py-0.5 bg-red-600 text-white text-xs rounded font-bold">E</span>
                  )}
                  {track.featured && <FaStar className="text-yellow-400" size={12} />}
                </div>
                
                <p className="text-gray-400 text-sm truncate mb-1">{track.artist} • {track.album}</p>
                
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded">
                    {track.genre}
                  </span>
                  <span className="flex items-center">
                    <FaMapMarkerAlt size={8} className="mr-1" />
                    {track.city}
                  </span>
                  <span className="hidden md:block">{track.language}</span>
                </div>
              </div>
              
              {/* Stats & Actions */}
              <div className="flex items-center space-x-4 ml-4">
                {/* Stats - Desktop apenas */}
                <div className="hidden lg:flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center">
                    <FaPlay size={8} className="mr-1" />
                    {formatNumber(track.playCount)}
                  </span>
                  <span className="flex items-center">
                    <FaHeart size={8} className="mr-1" />
                    {formatNumber(track.likes)}
                  </span>
                </div>
                
                {/* Duration */}
                <span className="text-sm text-gray-400 min-w-0">
                  {track.duration}
                </span>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={handleLikeClick}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {isLiked ? <FaHeart className="text-red-500" size={14} /> : <FaRegHeart size={14} />}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('More options:', track.id)
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaEllipsisV size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}