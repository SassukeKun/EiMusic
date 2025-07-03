// src/app/page.tsx
"use client";
import PaymentTestButtons from '@/components/PaymentTestButtons'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { FaPlay, FaHeart, FaExclamationTriangle } from "react-icons/fa";
import { getSupabaseBrowserClient } from "@/utils/supabaseClient";

// Types for recent releases
interface ReleaseBase {
  id: string;
  title: string;
  cover_url: string;
  created_at: string;
}
type RecentRelease = ReleaseBase & { type: "album" | "single" | "video" };

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showOAuthError, setShowOAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Verificar erros de OAuth na URL
  useEffect(() => {
    if (searchParams) {
      const error = searchParams.get("error");
      const errorCode = searchParams.get("error_code");
      const errorDescription = searchParams.get("error_description");

      if (
        error &&
        (errorCode === "bad_oauth_state" || error === "invalid_request")
      ) {
        console.error(
          "Erro OAuth detectado:",
          error,
          errorCode,
          errorDescription
        );
        setErrorMessage(
          errorDescription?.replace(/\+/g, " ") || "Erro na autenticação OAuth"
        );
        setShowOAuthError(true);

        // Limpar tokens de autenticação corrompidos
        if (typeof window !== "undefined") {
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            // Remover parâmetros de erro da URL e redirecionar para login
            router.replace(
              "/login?error=oauth_error&message=" +
                encodeURIComponent(errorMessage)
            );
          }, 3000);
        }
      }
    }
  }, [searchParams, router, errorMessage]);

  // Dados simulados para a página inicial com suas imagens
  const featuredArtist = {
    id: "1",
    name: "Mc Mastoni",
    image:
      "https://i.ytimg.com/vi/rMqsjbG5Yr4/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGDogZShkMA8=&rs=AOn4CLBxlwFnsRq3dQx-QxXAmhv9DS1Tug",
    title: "ARTISTA EM DESTAQUE",
    description: "Nova música 'No chapa' já disponível",
  };

  const [recentReleases, setRecentReleases] = useState<RecentRelease[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    (async () => {
      const { data: albums } = await supabase
        .from("albums")
        .select("id,title,cover_url,created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: singlesData } = await supabase
        .from("singles")
        .select("id,title,cover_url,file_url,created_at")

        .order("created_at", { ascending: false })
        .limit(5);

      const { data: videosData } = await supabase
        .from("videos")
        .select("id,title,video_url,created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      const videoRows: ReleaseBase[] = (videosData ?? []).map((v: any) => ({
        id: v.id,
        title: v.title,
        cover_url: v.video_url,
        created_at: v.created_at,
      }));

      const albumRows: ReleaseBase[] = albums ?? [];
      const singleRows: ReleaseBase[] = (singlesData ?? []).map((s) => ({
        id: s.id,
        title: s.title,
        cover_url: s.cover_url ?? s.file_url,
        created_at: s.created_at,
      }));
      const tagged: RecentRelease[] = [
        ...albumRows.map((a) => ({ ...a, type: "album" as const })),
        ...singleRows.map((s) => ({ ...s, type: "single" as const })),
        ...videoRows.map((v) => ({ ...v, type: "video" as const })),
      ];
      tagged.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentReleases(tagged.slice(0, 5));
    })();
  }, []);

  // Interface para playlists da homepage
  interface HomePlaylist {
    id: string;
    title: string;
    image: string;
    count: string;
    category: string;
  }

  // Mock data atualizado para playlists na homepage
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
  const topArtists = [
    {
      id: "1",
      name: "DJ Manuel",
      image:
        "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "2",
      name: "Sofia Lima",
      image:
        "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "3",
      name: "Ricardo Luz",
      image:
        "https://images.unsplash.com/photo-1539701938214-0d9736e1c16b?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "4",
      name: "Marina Sol",
      image:
        "https://images.unsplash.com/photo-1581881067989-7e3eaf45f4b7?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "5",
      name: "Bruno Dias",
      image:
        "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "6",
      name: "Carla Rocha",
      image:
        "https://images.unsplash.com/photo-1542787781-5f7ddd8c4a99?auto=format&fit=crop&w=400&q=80",
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
      {showOAuthError && (
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
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {featuredArtist.name}
            </h1>
            <p className="text-base text-gray-300 mb-6">
              {featuredArtist.description}
            </p>
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
                      src={release.cover_url}
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
              {topArtists.map((artist) => (
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
                        src={artist.image}
                        alt={artist.name}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="80px"
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
