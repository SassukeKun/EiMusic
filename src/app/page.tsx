// src/app/page.tsx
"use client";
import PaymentTestButtons from '@/components/PaymentTestButtons'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaPlay, FaHeart, FaExclamationTriangle } from 'react-icons/fa';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import artistService from '@/services/artistService';
import { Artist, RawRelease, Release } from '@/types/releases';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setErrorMessage(
        oauthError === 'access_denied'
          ? 'You denied access to your Spotify account. Please try again.'
          : 'An error occurred during authentication. Please try again.'
      );
      router.replace('/');
    }
  }, [searchParams, router, errorMessage]);

  // State for recent release and popular artists
  const [recentRelease, setRecentRelease] = useState<Release | null>(null);
  const [recentReleases, setRecentReleases] = useState<Release[]>([]);
  const [popularArtists, setPopularArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    (async () => {
      try {
        // Get the most recent release across all content types
        const { data: recentAlbums } = await supabase
          .from('albums')
          .select('id, title, cover_url, created_at, artist_id, artist:artists(id, name, profile_image_url)')
          .order('created_at', { ascending: false })
          .limit(1);

        const { data: recentSingles } = await supabase
          .from('singles')
          .select('id, title, cover_url, file_url, created_at, artist_id, artist:artists(id, name, profile_image_url)')
          .order('created_at', { ascending: false })
          .limit(1);

        const { data: recentVideos } = await supabase
          .from('videos')
          .select('id, title, cover_url:video_url, created_at, artist_id, artist:artists(id, name, profile_image_url)')
          .order('created_at', { ascending: false })
          .limit(1);

        // Find the most recent release
        type MappedRelease = {
          type: 'album' | 'single' | 'video';
          artist: Artist;
          id: string;
          title: string;
          cover_url?: string;
          file_url?: string;
          video_url?: string;
          created_at: string;
          artist_id: string;
        };

        const releases = [
          ...(recentAlbums ?? []).map((a: RawRelease | { error: true }) => {
            if ('error' in a) return null;
            return {
              ...a,
              type: 'album' as const,
              artist: Array.isArray(a.artist) ? (a.artist[0] || { id: '', name: '', profile_image_url: '' }) : (a.artist || { id: '', name: '', profile_image_url: '' })
            } as MappedRelease;
          }),
          ...(recentSingles ?? []).map((s: RawRelease | { error: true }) => {
            if ('error' in s) return null;
            return {
              ...s,
              type: 'single' as const,
              artist: Array.isArray(s.artist) ? (s.artist[0] || { id: '', name: '', profile_image_url: '' }) : (s.artist || { id: '', name: '', profile_image_url: '' })
            } as MappedRelease;
          }),
          ...(recentVideos ?? []).map((v: RawRelease | { error: true }) => {
            if ('error' in v) return null;
            return {
              ...v,
              type: 'video' as const,
              artist: Array.isArray(v.artist) ? (v.artist[0] || { id: '', name: '', profile_image_url: '' }) : (v.artist || { id: '', name: '', profile_image_url: '' })
            } as MappedRelease;
          })
        ].filter((v): v is MappedRelease => v !== null);

        const mostRecentRelease = releases.sort((a: MappedRelease, b: MappedRelease) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0] as MappedRelease | undefined;

        if (mostRecentRelease && mostRecentRelease.artist) {
          setRecentRelease({
            id: mostRecentRelease.id,
            title: mostRecentRelease.title,
            cover_url: mostRecentRelease.cover_url || mostRecentRelease.file_url || '',
            created_at: mostRecentRelease.created_at,
            type: mostRecentRelease.type,
            artist: mostRecentRelease.artist
          });
        }

        // Get recent releases for the grid
        const { data: albumData } = await supabase
          .from('albums')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: singleData } = await supabase
          .from('singles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: videoData } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        // Ensure we have valid data before mapping
        const validAlbumData = albumData?.filter((item): item is { id: string; title: string; cover_url: string; created_at: string; artist_id: string; artist: Artist[] } => item !== null && typeof item === 'object') ?? [];
        const validSingleData = singleData?.filter((item): item is { id: string; title: string; cover_url: string; file_url: string; created_at: string; artist_id: string; artist: Artist[] } => item !== null && typeof item === 'object') ?? [];
        const validVideoData = videoData?.filter((item): item is { id: string; title: string; cover_url: string; created_at: string; artist_id: string; artist: Artist[] } => item !== null && typeof item === 'object') ?? [];

        const albumReleases = validAlbumData.map((a): RawRelease => ({
          id: a.id,
          title: a.title,
          cover_url: a.cover_url || '',
          created_at: a.created_at,
          artist_id: a.artist_id,
          artist: Array.isArray(a.artist) ? a.artist : [a.artist],
          type: 'album' as const
        }));

        const singleReleases = validSingleData.map((s): RawRelease => ({
          id: s.id,
          title: s.title,
          cover_url: s.cover_url || s.file_url || '',
          created_at: s.created_at,
          artist_id: s.artist_id,
          artist: Array.isArray(s.artist) ? s.artist : [s.artist],
          type: 'single' as const
        }));

        const videoReleases = validVideoData.map((item): RawRelease => ({
          id: item.id,
          title: item.title,
          cover_url: item.cover_url || '',
          created_at: item.created_at,
          artist_id: item.artist_id,
          artist: Array.isArray(item.artist) ? item.artist : [item.artist],
          type: 'video' as const
        }));

        const allReleases = [...albumReleases, ...singleReleases, ...videoReleases];
        allReleases.sort((a: RawRelease, b: RawRelease) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        const mappedReleases = allReleases.map((release: RawRelease) => {
          const normalizedArtist = Array.isArray(release.artist) ? (release.artist[0] || { id: '', name: '', profile_image_url: '' }) : release.artist;
          const normalizedRelease = {
            id: release.id,
            title: release.title,
            cover_url: release.cover_url || '',
            created_at: release.created_at,
            artist: normalizedArtist,
            type: release.type!
          };
          return normalizedRelease;
        });
        
        setRecentReleases(mappedReleases.slice(0, 5));

        // Get popular artists (trending)
        const popularData = await artistService.getTrendingArtists(5);
        const popularMapped = (popularData ?? []).map(a => ({
          id: a.id,
          name: a.name,
          profile_image_url: a.profile_image_url || ''
        }));
        setPopularArtists(popularMapped);
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    })();
  }, []);

  // Interface for playlists
  interface HomePlaylist {
    id: string;
    title: string;
    image: string;
    count: string;
    category: string;
  }

  // Mock data for playlists
  const topPlaylists: HomePlaylist[] = [
    {
      id: "1",
      title: "Hits Moçambicanos",
      image:
        "https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=80",
      count: "32 músicas",
      category: "Editorial",
    },
    {
      id: "2",
      title: "Pura Energia",
      image:
        "https://images.unsplash.com/photo-1550184916-c630464fd404?auto=format&fit=crop&w=600&q=80",
      count: "24 músicas",
      category: "Fitness",
    },
    {
      id: "3",
      title: "Clássicos Africanos",
      image:
        "https://images.unsplash.com/photo-1532953593254-4af21ac275b3?auto=format&fit=crop&w=600&q=80",
      count: "40 músicas",
      category: "Tradicional",
    },
    {
      id: "4",
      title: "Tardes Tranquilas",
      image:
        "https://images.unsplash.com/photo-1531384370053-61af8bee95e3?auto=format&fit=crop&w=600&q=80",
      count: "18 músicas",
      category: "Chill",
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
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Notificação de erro OAuth */}
      {errorMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
          <div className="bg-red-900/80 backdrop-blur-sm p-6 rounded-lg shadow-xl max-w-md w-full border border-red-700">
            <div className="flex items-center justify-center text-4xl text-red-500 mb-4">
              <FaExclamationTriangle />
            </div>
            <h3 className="text-xl font-semibold text-center text-white mb-2">
              Erro de Autenticação
            </h3>
            <p className="text-gray-200 text-center mb-4">{errorMessage}</p>
            <p className="text-gray-300 text-center text-sm">
              Redirecionando para a página de login...
            </p>
          </div>
        <PaymentTestButtons />
        </div>
      )}

      <motion.div
        className="text-gray-100 w-full pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Lançamento Recente */}
        {recentRelease && (
          <motion.div
            className="relative w-full h-80 md:h-[400px] overflow-hidden mb-8"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10"></div>
            <Image
              src={recentRelease.cover_url=== "" ? "/placeholder.png" : recentRelease.cover_url}
              alt={recentRelease.title}
              fill
              className="object-cover"
              unoptimized
              sizes="100vw"
              priority
            />
            <div className="absolute bottom-0 left-0 p-8 z-20 w-full md:w-2/3">
              <span className="text-xs uppercase tracking-wider text-gray-300 mb-3 block font-medium">
                LANÇAMENTO RECENTE
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {recentRelease.title}
              </h1>
              <p className="text-base text-gray-300 mb-6">
                {recentRelease.artist.name}
              </p>
              <div className="flex space-x-4">
                <button className="px-5 py-2.5 bg-indigo-700 hover:bg-indigo-600 rounded-full flex items-center text-base font-medium transition-colors">
                  <FaPlay className="mr-2" /> {recentRelease.type === 'video' ? 'Ver' : 'Ouvir'} Agora
                </button>
                <button className="p-2.5 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-colors">
                  <FaHeart />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Conteúdo principal com padding */}
        <div className="px-8 pb-10">
          {/* Lançamentos Recentes - tamanho reduzido */}
          <motion.section className="mb-10" variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Lançamentos Recentes</h2>
              <Link
                href="/releases"
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Ver Todos
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {recentReleases.map((release) => (
                <motion.div
                  key={release.id}
                  className="group cursor-pointer"
                  onClick={() => {
                    if (release.type === "album")
                      router.push(`/albums/${release.id}`);
                    else if (release.type === "single")
                      router.push(`/songs/${release.id}`);
                    else if (release.type === "video")
                      router.push(`/videos/${release.id}`);
                  }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-square mb-1 group-hover:shadow-md w-full max-w-[400px]">
                    <Image
                      src={release.cover_url=== "" ? "/placeholder.png" : release.cover_url}
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
                  <h3 className="font-medium text-xs truncate">
                    {release.title}
                  </h3>
                  <p className="text-gray-400 text-xs truncate">
                    {release.type === "album" ? "Álbum" : "Single"}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
          {/* Playlists em Destaque - VERSÃO ADAPTADA COM LINKS */}
          <motion.section className="mb-10" variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Playlists em Destaque</h2>
              <Link
                href="/playlists"
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Ver Todas
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topPlaylists.map((playlist) => (
                <motion.div
                  key={playlist.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden p-4 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 group"
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={`/playlists/${playlist.id}`} className="block">
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
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Reproduzir playlist:", playlist.id);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full shadow-xl transform scale-0 group-hover:scale-100 transition-transform"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaPlay size={12} className="text-white ml-0.5" />
                          </motion.button>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between flex-grow">
                        <div>
                          <h3 className="font-bold text-sm group-hover:text-purple-300 transition-colors line-clamp-1">
                            {playlist.title}
                          </h3>
                          <p className="text-gray-400 text-xs line-clamp-1">
                            {playlist.count}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {playlist.category || "Playlist"}
                          </span>
                          <motion.button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Reproduzir playlist:", playlist.id);
                            }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaPlay size={10} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        
          
          {/* Artistas Populares */}
          <motion.section variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Artistas Populares</h2>
              
              <Link
                href="/artist"
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
              >
                Ver Todos
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {popularArtists.slice(0, 5).map((artist: Artist) => (
                <motion.div
                  key={artist.id}
                  className="text-center group"
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* ADICIONAR LINK CLICÁVEL PARA O CARD INTEIRO: */}
                  <Link href={`/artist/${artist.id}`} className="block">
                    <div className="w-20 h-20 mx-auto relative rounded-full overflow-hidden mb-2 border-2 border-transparent group-hover:border-indigo-500 transition-colors">
                      <Image
                        src={artist.profile_image_url === "" ? "/avatar.svg" : artist.profile_image_url}
                        alt={artist.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="80px"
                        onError={(e) => {
                          const t = e.currentTarget as HTMLImageElement;
                          t.onerror = null;
                          t.src = "/avatar.svg";
                        }}
                      />
                    </div>
                    <h3 className="font-medium text-sm truncate group-hover:text-purple-300 transition-colors">
                      {artist.name}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}

