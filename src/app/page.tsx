// src/app/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaPlay, FaHeart, FaExclamationTriangle } from 'react-icons/fa'

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showOAuthError, setShowOAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Verificar erros de OAuth na URL
  useEffect(() => {
    if (searchParams) {
      const error = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      if (error && (errorCode === 'bad_oauth_state' || error === 'invalid_request')) {
        console.error('Erro OAuth detectado:', error, errorCode, errorDescription);
        setErrorMessage(errorDescription?.replace(/\+/g, ' ') || 'Erro na autenticação OAuth');
        setShowOAuthError(true);
        
        // Limpar tokens de autenticação corrompidos
        if (typeof window !== 'undefined') {
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            // Remover parâmetros de erro da URL e redirecionar para login
            router.replace('/login?error=oauth_error&message=' + encodeURIComponent(errorMessage));
          }, 3000);
        }
      }
    }
  }, [searchParams, router, errorMessage]);
  
  // Dados simulados para a página inicial com suas imagens
  const featuredArtist = {
    id: "1",
    name: "Mc Mastoni",
    image: "https://i.ytimg.com/vi/rMqsjbG5Yr4/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGDogZShkMA8=&rs=AOn4CLBxlwFnsRq3dQx-QxXAmhv9DS1Tug",
    title: "ARTISTA EM DESTAQUE",
    description: "Nova música 'No chapa' já disponível"
  };

  const recentReleases = [
    {
      id: "1",
      title: "Nunca tou no Place",
      artist: "Hernâni & Laylizzy",
      image: "https://xigubo.com/wp-content/uploads/2022/11/231FEECC-35CF-4DEB-ABC8-621482F88F92-e1669184204697.jpeg",
      tags: ["Rap"]
    },
    {
      id: "2",
      title: "Distância",
      artist: "Nirvana",
      image: "https://i1.sndcdn.com/artworks-775MIadN8jaJDuCt-JXiSdA-t240x240.jpg",
      tags: ["Trapsoul"]
    },
    {
      id: "3",
      title: "Não voltar atrás",
      artist: "7th Streetz Boyz",
      image: "https://i1.sndcdn.com/artworks-Ixlqm1BQlHbPwJii-jcEjzA-t240x240.jpg",
      tags: ["R&B"]
    },
    {
      id: "4",
      title: "Rivais",
      artist: "Twenty Fingers",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREBLiwM6nJd2WU594U5jUYr8VG4BVm2CMoLg&s",
      tags: ["Lovesong"]
    },
    {
      id: "5",
      title: "Vanabela",
      artist: "Wizzi Massuke",
      image: "https://i.ytimg.com/vi/TQpjgrkl19U/maxresdefault.jpg",
      tags: ["Marabenta"]
    },
  ];

  const topPlaylists = [
    {
      id: "1",
      title: "O melhor de Sofala",
      image: "https://www.rm.co.mz/wp-content/uploads/2024/03/beira10-chiveve-post-1.jpg",
      count: "32 músicas"
    },
    {
      id: "2",
      title: "Rap Made in Moz",
      image: "https://pbs.twimg.com/media/EjTqR5xXYAAwBcx.jpg",
      count: "24 músicas"
    },
    {
      
      id: "3",
      title: "O melhor da Kizomba",
      image: "https://clubofmozambique.com/wp-content/uploads/2018/10/Kizomba-summer.jpg",
      count: "40 músicas"
    },
    {
      id: "4",
      title: "Novos Talentos",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmnalGg3MI76X0GZFLbidqFjgbWbl898P7Fw&s",
      count: "18 músicas"
    },
  ];

  const topArtists = [
    {
      id: "1",
      name: "Dygo Boy",
      image: "https://cdn-images.dzcdn.net/images/artist/3aaab98520e6fe7449f3e0b564cb1cee/1900x1900-000000-80-0-0.jpg"
    },
    {
      id: "2",
      name: "Lil Skuizy",
      image: "../Allen.jpeg"
    },
    {
      id: "3",
      name: "Liloca",
      image: "https://i0.wp.com/mozentretenimento.co.mz/wp-content/uploads/2023/03/Cancelamento-tira-Liloca-da-lista-de-artistas-com-1-milhao-de-seguidores-no-Instagram-e1679389005343.jpg?ssl=1"
    },
    {
      id: "4",
      name: "Lizha James",
      image: "https://akamai.sscdn.co/uploadfile/letras/fotos/a/e/e/e/aeeec14f22bada173a4e6b348630f7fa.jpg"
    },
    {
      id: "5",
      name: "Humberto Luís",
      image: "https://cdn-images.dzcdn.net/images/artist/20e9b99ff5f70336a8573d91df03c1ec/1900x1900-000000-80-0-0.jpg"
    },
    {
      id: "6",
      name: "Shabba Wonder",
      image: "https://i1.sndcdn.com/artworks-jGbBVD7etHG5pycL-r7qUoA-t500x500.jpg"
    },
  ];

  // Animação de entrada para os elementos da página
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Notificação de erro OAuth */}
      {showOAuthError && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-red-900/80 backdrop-blur-sm p-6 rounded-lg shadow-xl max-w-md w-full border border-red-700">
            <div className="flex items-center justify-center text-4xl text-red-500 mb-4">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-xl font-semibold text-center text-white mb-2">Erro de Autenticação</h3>
            <p className="text-gray-200 text-center mb-4">{errorMessage}</p>
            <p className="text-gray-300 text-center text-sm">Redirecionando para a página de login...</p>
          </div>
        </div>
      )}
      
      <motion.div
        className="text-gray-100 w-full pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Artista em Destaque */}
        <motion.div
          className="relative w-full h-80 md:h-[400px] overflow-hidden mb-8"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10"></div>
          <Image
            src={featuredArtist.image}
            alt={featuredArtist.name}
            fill
            className="object-cover"
            unoptimized
            sizes="100vw"
            priority
          />
          <div className="absolute bottom-0 left-0 p-8 z-20 w-full md:w-2/3">
            <span className="text-xs uppercase tracking-wider text-gray-300 mb-3 block font-medium">
              {featuredArtist.title}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{featuredArtist.name}</h1>
            <p className="text-base text-gray-300 mb-6">{featuredArtist.description}</p>
            <div className="flex space-x-4">
              <button className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-full flex items-center text-base font-medium transition-colors">
                <FaPlay className="mr-2" /> Ouvir Agora
              </button>
              <button className="p-2.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-colors">
                <FaHeart />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Conteúdo principal com padding */}
        <div className="px-8 pb-10">
          {/* Lançamentos Recentes - tamanho reduzido */}
          <motion.section className="mb-10" variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Lançamentos Recentes</h2>
              <Link href="/releases" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                Ver Todos
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {recentReleases.map((release) => (
                <motion.div
                  key={release.id}
                  className="group"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-square mb-1 group-hover:shadow-md w-full max-w-[400px]">
                    <Image
                      src={release.image}
                      alt={release.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="bg-indigo-600 hover:bg-indigo-500 p-1.5 rounded-full shadow-xl transform scale-0 group-hover:scale-100 transition-transform">
                        <FaPlay size={10} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-medium text-xs truncate">{release.title}</h3>
                  <p className="text-gray-400 text-xs truncate">{release.artist}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Playlists em Destaque */}
          <motion.section className="mb-10" variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Playlists em Destaque</h2>
              <Link href="/playlists" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                Ver Todas
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topPlaylists.map((playlist) => (
                <motion.div
                  key={playlist.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden p-4 border border-gray-800 hover:border-gray-700 transition-colors"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={playlist.image}
                        alt={playlist.title}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="80px"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <h3 className="font-bold text-sm">{playlist.title}</h3>
                        <p className="text-gray-400 text-xs">{playlist.count}</p>
                      </div>
                      <button className="bg-indigo-600 hover:bg-indigo-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg self-end transition-colors">
                        <FaPlay size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Artistas Populares */}
          <motion.section variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Artistas Populares</h2>
              <Link href="/artists" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                Ver Todos
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {topArtists.map((artist) => (
                <motion.div
                  key={artist.id}
                  className="text-center group"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-20 h-20 mx-auto relative rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-indigo-500 transition-colors">
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="80px"
                    />
                  </div>
                  <h3 className="font-medium text-sm truncate">{artist.name}</h3>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}