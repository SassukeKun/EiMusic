"use client";

import React, { useState, useEffect, useRef } from "react";
import { trendingService, type TrendingItem } from "@/services/trendingService";
import { getSupabaseBrowserClient } from "@/utils/supabaseClient";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaPlay,
  FaHeart,
  FaShare,
  FaFilter,
  FaTags,
  FaMapMarkerAlt,
  FaMusic,
  FaFire,
  FaStar,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

// Interface para itens de descoberta
interface ExploreItem {
  id: string;
  type: "music" | "artist" | "playlist";
  title: string;
  artist?: string;
  image: string;
  preview_url?: string;
  genre: string;
  province: string;
  tags: string[];
  popularity_score: number;
  plays?: number;
  followers?: number;
  trackCount?: number;
  duration?: string;
  isNew?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
}

// Interface para categorias de exploração
interface ExploreCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  items: ExploreItem[];
}

// Tipos para filtros
type GenreFilter = string;
type CityFilter = string;
type PopularityFilter = "all" | "trending" | "new" | "popular";

// Componente separado para cada categoria com slider
const CategorySlider = ({
  category,
  categoryIndex,
  onTagToggle,
  selectedTags,
}: {
  category: ExploreCategory;
  categoryIndex: number;
  onTagToggle: (tag: string) => void;
  selectedTags: string[];
}) => {
  // Hooks específicos para este slider
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Função para scroll suave
  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 280 * 2; // Scroll de 2 cards por vez
      const newPosition =
        direction === "left"
          ? scrollPosition - scrollAmount
          : scrollPosition + scrollAmount;

      sliderRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  };

  // Função para verificar posição do scroll
  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Função para formatar números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Effect para verificar posição inicial
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      checkScrollPosition();
      slider.addEventListener("scroll", checkScrollPosition);
      return () => slider.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  // Componente para card de exploração
  const ExploreCard = ({ item }: { item: ExploreItem }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group cursor-pointer">
      <Link
        href={`/${
          item.type === "music"
            ? "musicas"
            : item.type === "artist"
            ? "artistas"
            : "playlists"
        }/${item.id}`}
      >
        <div className="relative">
          {/* Imagem e badges */}
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={item.image === "" ? "/placeholder.png" : item.image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges de status */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {item.isNew && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  NOVO
                </span>
              )}
              {item.isTrending && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <FaFire className="text-xs" /> TRENDING
                </span>
              )}
              {item.isRecommended && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  RECOMENDADO
                </span>
              )}
            </div>

            {/* Score de popularidade */}
            <div className="absolute top-2 right-2">
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-medium">
                {item.popularity_score}
              </div>
            </div>

            {/* Overlay com botão play */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transition-colors">
                  <FaPlay className="text-lg" />
                </button>
                <button className="bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-2 transition-colors">
                  <FaHeart className="text-sm" />
                </button>
                <button className="bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-2 transition-colors">
                  <FaShare className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo do card */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm">
                  {item.title}
                </h3>
                {item.artist && (
                  <p className="text-gray-400 text-xs truncate">
                    {item.artist}
                  </p>
                )}
              </div>

              {/* Ícone do tipo */}
              <div
                className={`p-1 rounded-full ${
                  item.type === "music"
                    ? "bg-green-500/20"
                    : item.type === "artist"
                    ? "bg-blue-500/20"
                    : "bg-purple-500/20"
                }`}
              >
                {item.type === "music" ? (
                  <FaMusic className="text-xs text-green-400" />
                ) : item.type === "artist" ? (
                  <FaStar className="text-xs text-blue-400" />
                ) : (
                  <FaTags className="text-xs text-purple-400" />
                )}
              </div>
            </div>

            {/* Informações do local e gênero */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FaMapMarkerAlt className="text-xs" />
                <span>{item.province}</span>
              </div>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-500">{item.genre}</span>
            </div>

            {/* Estatísticas específicas por tipo */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              {item.type === "music" && (
                <>
                  <span>{formatNumber(item.plays || 0)} plays</span>
                  <span>{item.duration}</span>
                </>
              )}
              {item.type === "artist" && (
                <span>{formatNumber(item.followers || 0)} seguidores</span>
              )}
              {item.type === "playlist" && (
                <span>{item.trackCount} músicas</span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.preventDefault();
                    onTagToggle(tag);
                  }}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {item.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{item.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
    >
      {/* Header da categoria */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color}`}>
            {category.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{category.name}</h2>
            <p className="text-gray-400 text-sm">{category.description}</p>
          </div>
        </div>

        {/* Botões de navegação */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full transition-all duration-300 ${
              canScrollLeft
                ? "bg-gray-700/50 hover:bg-gray-600/50 text-white hover:scale-110"
                : "bg-gray-800/30 text-gray-600 cursor-not-allowed"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-2 rounded-full transition-all duration-300 ${
              canScrollRight
                ? "bg-gray-700/50 hover:bg-gray-600/50 text-white hover:scale-110"
                : "bg-gray-800/30 text-gray-600 cursor-not-allowed"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Slider horizontal de itens */}
      <div className="relative group">
        <div
          ref={sliderRef}
          className="overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div
            className="flex gap-6 pb-4"
            style={{ width: `${category.items.length * 280}px` }}
          >
            {category.items.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-64">
                <ExploreCard item={item} />
              </div>
            ))}
          </div>
        </div>

        {/* Gradientes fade nas bordas para indicar mais conteúdo */}
        {canScrollRight && (
          <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-900 via-gray-900/50 to-transparent pointer-events-none"></div>
        )}
        {canScrollLeft && (
          <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-900 via-gray-900/50 to-transparent pointer-events-none"></div>
        )}
      </div>
    </motion.div>
  );
};

export default function ExplorePage() {
  // Estados para controle de filtros
  const [selectedGenre, setSelectedGenre] = useState<GenreFilter>("all");
  const [selectedCity, setSelectedCity] = useState<CityFilter>("all");
  const [popularityFilter, setPopularityFilter] =
    useState<PopularityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Estados para UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para itens trending reais
  const [trendingItems, setTrendingItems] = useState<ExploreItem[]>([]);
  const [newArtistItems, setNewArtistItems] = useState<ExploreItem[]>([]);
const [genreItems, setGenreItems] = useState<ExploreItem[]>([]);

  // Estados para dados
  const [exploreData, setExploreData] = useState<ExploreItem[]>([]);
  const [filteredData, setFilteredData] = useState<ExploreItem[]>([]);
  const [categories, setCategories] = useState<ExploreCategory[]>([]);

  // Mapeia TrendingItem para ExploreItem
  const mapTrendingToExplore = (item: TrendingItem): ExploreItem => ({
    id: item.id,
    type: "music", // Tratamos vídeos como música por agora
    title: item.title,
    artist: item.artist,
    image: item.image,
    genre: item.genre || "",
    province: "", // Sem informação de província nos dados trending
    tags: [],
    popularity_score: item.trending_score,
    plays: item.streams,
    duration: item.duration,
    isTrending: true,
  });

  // Converte um registro de artista em ExploreItem (Novos Talentos)
  const mapArtistToExplore = (artist: any): ExploreItem => ({
    id: artist.id,
    type: "artist",
    title: artist.name,
    image: artist.profile_image_url || "",
    genre: "", // Ajustar se existir campo genre
    province: artist.province || "",
    tags: [],
    popularity_score: artist.subscribers ?? 0,
    followers: artist.subscribers ?? 0,
    plays: undefined,
    duration: undefined,
    isNew: true,
  });

  // Converte single (ou track) em ExploreItem para seção de gênero
  const mapSingleToExplore = (single: any): ExploreItem => {
    const artistObj = Array.isArray(single.artists) ? single.artists[0] : single.artists;
    return {
      id: single.id,
      type: "music",
      title: single.title,
      artist: artistObj?.name || "",
      image: single.cover_url || artistObj?.profile_image_url || "",
      genre: single.genre || "",
      province: "",
      tags: [],
      popularity_score: single.streams ?? 0,
      plays: single.streams ?? 0,
      duration: single.duration ? single.duration.toString() : "",
      isRecommended: true,
    };
  };

  // Fetch trending items on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await trendingService.getTrendingItems(
          "week",
          "music",
          "",
          20,
          0,
        );
        const mapped = data
          .filter((i) => i.type === "music")
          .map(mapTrendingToExplore);
        setTrendingItems(mapped);
      } catch (error) {
        console.error("Erro ao carregar itens trending:", error);
      }
    };

    fetchTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch recent artists (Novos Talentos)
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('artists')
          .select('id, name, profile_image_url, subscribers, created_at')
          .order('created_at', { ascending: false })
          .limit(20);
        if (error) throw error;
        const mapped = (data as any[]).map(mapArtistToExplore);
        setNewArtistItems(mapped);
      } catch (error) {
        console.error('Erro ao carregar artistas recentes:', error);
      }
    };
    fetchArtists();
  }, []);

  // Fetch singles/albums para recomendações por gênero
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('singles')
          .select('id, title, cover_url, duration, streams, genre, artist_id, artists(name, profile_image_url)')
          .not('genre', 'is', null)
          .order('streams', { ascending: false })
          .limit(30);
        if (error) throw error;
        const singles = data as any[];
        const unique: ExploreItem[] = [];
        const seen = new Set<string>();
        for (const s of singles) {
          if (!s.genre) continue;
          const genreKey = (s.genre as string).toLowerCase();
          if (seen.has(genreKey)) continue;
          unique.push(mapSingleToExplore(s));
          seen.add(genreKey);
          if (unique.length >= 6) break;
        }
        setGenreItems(unique);
      } catch (error) {
        console.error('Erro ao carregar recomendações por gênero:', error);
      }
    };

    fetchGenres();
  }, []);

  // Atualiza dados combinados e categorias sempre que algo mudar
  useEffect(() => {
    const combined = [...trendingItems, ...newArtistItems, ...genreItems];
    setExploreData(combined);
    setCategories(createExploreCategories());
  }, [trendingItems, newArtistItems, genreItems]);

  // Gêneros disponíveis em Moçambique
  const availableGenres = [
    "all",
    "Marrabenta",
    "Hip Hop",
    "Afrobeat",
    "R&B",
    "Pandza",
    "Amapiano",
    "Soul",
    "Gospel",
    "Tradicional",
  ];

  // Cidades principais de Moçambique
  const availableCities = [
    "all",
    "Maputo",
    "Beira",
    "Nampula",
    "Inhambane",
    "Tete",
    "Quelimane",
    "Chimoio",
    "Pemba",
    "Xai-Xai",
  ];

  // Tags populares para exploração
  const popularTags = [
    "trending",
    "novo",
    "emergente",
    "tradicional",
    "moderno",
    "dança",
    "romance",
    "festa",
    "chill",
    "energia",
    "urbano",
    "rural",
    "fusão",
    "acústico",
    "eletrônico",
  ];

  // Função para criar categorias de exploração (somente dados dinâmicos)
  const createExploreCategories = (): ExploreCategory[] => {
    return [
      {
        id: "trending",
        name: "Em Alta",
        icon: <FaFire className="text-orange-400" />,
        description: "O que está bombando agora em Moçambique",
        color: "from-orange-500 to-red-500",
        items: trendingItems,
      },
      {
        id: "new",
        name: "Novos Talentos",
        icon: <FaStar className="text-yellow-400" />,
        description: "Artistas emergentes para descobrir",
        color: "from-yellow-500 to-orange-500",
        items: newArtistItems,
      },
      {
        id: "genres",
        name: "Por Gênero",
        icon: <FaMusic className="text-blue-400" />,
        description: "Explore por estilos musicais",
        color: "from-blue-500 to-indigo-500",
        items: genreItems,
      },
    ];
  };

  // Função para filtrar dados
  const filterExploreData = () => {
    let filtered = exploreData;

    // Filtro por gênero
    if (selectedGenre !== "all") {
      filtered = filtered.filter((item) => item.genre === selectedGenre);
    }

    // Filtro por cidade
    if (selectedCity !== "all") {
      filtered = filtered.filter((item) => item.province === selectedCity);
    }

    // Filtro por popularidade
    if (popularityFilter !== "all") {
      switch (popularityFilter) {
        case "trending":
          filtered = filtered.filter((item) => item.isTrending);
          break;
        case "new":
          filtered = filtered.filter((item) => item.isNew);
          break;
        case "popular":
          filtered = filtered.filter((item) => item.popularity_score >= 85);
          break;
      }
    }

    // Filtro por tags selecionadas
    if (selectedTags.length > 0) {
      filtered = filtered.filter((item) =>
        selectedTags.some((tag) => item.tags.includes(tag))
      );
    }

    // Filtro por busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.artist && item.artist.toLowerCase().includes(query)) ||
          item.genre.toLowerCase().includes(query) ||
          item.province.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Ordenar por relevância/popularidade
    filtered = filtered.sort((a, b) => b.popularity_score - a.popularity_score);

    return filtered;
  };

  // Função para alternar tag selecionada
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setSelectedGenre("all");
    setSelectedCity("all");
    setPopularityFilter("all");
    setSelectedTags([]);
    setSearchQuery("");
  };

  // Função para formatar números
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  // Effect para atualizar dados filtrados
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = filterExploreData();
      setFilteredData(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [
    selectedGenre,
    selectedCity,
    popularityFilter,
    selectedTags,
    searchQuery,
    exploreData,
  ]);

  // Effect inicial – apenas cria categorias vazias até dados carregarem
  useEffect(() => {
    setCategories(createExploreCategories());
  }, []);

  // Componente para card de exploração nos resultados filtrados
  const ExploreCard = ({ item }: { item: ExploreItem }) => (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-300 overflow-hidden group cursor-pointer">
      <Link
        href={`/${
          item.type === "music"
            ? "musicas"
            : item.type === "artist"
            ? "artistas"
            : "playlists"
        }/${item.id}`}
      >
        <div className="relative">
          {/* Imagem e badges */}
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={item.image === "" ? "/user_placeholder.png" : item.image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Badges de status */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {item.isNew && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  NOVO
                </span>
              )}
              {item.isTrending && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <FaFire className="text-xs" /> TRENDING
                </span>
              )}
              {item.isRecommended && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  RECOMENDADO
                </span>
              )}
            </div>

            {/* Score de popularidade */}
            <div className="absolute top-2 right-2">
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-medium">
                {item.popularity_score}
              </div>
            </div>

            {/* Overlay com botão play */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-3 transition-colors">
                  <FaPlay className="text-lg" />
                </button>
                <button className="bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-2 transition-colors">
                  <FaHeart className="text-sm" />
                </button>
                <button className="bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-2 transition-colors">
                  <FaShare className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo do card */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate text-sm">
                  {item.title}
                </h3>
                {item.artist && (
                  <p className="text-gray-400 text-xs truncate">
                    {item.artist}
                  </p>
                )}
              </div>

              {/* Ícone do tipo */}
              <div
                className={`p-1 rounded-full ${
                  item.type === "music"
                    ? "bg-green-500/20"
                    : item.type === "artist"
                    ? "bg-blue-500/20"
                    : "bg-purple-500/20"
                }`}
              >
                {item.type === "music" ? (
                  <FaMusic className="text-xs text-green-400" />
                ) : item.type === "artist" ? (
                  <FaStar className="text-xs text-blue-400" />
                ) : (
                  <FaTags className="text-xs text-purple-400" />
                )}
              </div>
            </div>

            {/* Informações do local e gênero */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <FaMapMarkerAlt className="text-xs" />
                <span>{item.province}</span>
              </div>
              <span className="text-gray-600">•</span>
              <span className="text-xs text-gray-500">{item.genre}</span>
            </div>

            {/* Estatísticas específicas por tipo */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              {item.type === "music" && (
                <>
                  <span>{formatNumber(item.plays || 0)} plays</span>
                  <span>{item.duration}</span>
                </>
              )}
              {item.type === "artist" && (
                <span>{formatNumber(item.followers || 0)} seguidores</span>
              )}
              {item.type === "playlist" && (
                <span>{item.trackCount} músicas</span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 2).map((tag) => (
                <button
                  key={tag}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleTag(tag);
                  }}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-purple-500 text-white"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {item.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{item.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        {/* Header da página */}
        <div className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Explore Moçambique
          </motion.h1>
          <motion.p
            className="text-gray-300 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Descubra novos artistas, sons únicos e a riqueza musical de
            Moçambique
          </motion.p>
        </div>

        {/* Barra de busca principal */}
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar artistas, músicas, gêneros ou cidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-16 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                showFilters ||
                selectedGenre !== "all" ||
                selectedCity !== "all" ||
                popularityFilter !== "all" ||
                selectedTags.length > 0
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-white"
              }`}
            >
              <FaFilter />
            </button>
          </div>
        </motion.div>

        {/* Painel de filtros avançados */}
        {showFilters && (
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 mb-8"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">
                Filtros Avançados
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Limpar Todos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Filtro por Gênero */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gênero
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos os Gêneros</option>
                  {availableGenres.slice(1).map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cidade
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todas as Cidades</option>
                  {availableCities.slice(1).map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Popularidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Popularidade
                </label>
                <select
                  value={popularityFilter}
                  onChange={(e) =>
                    setPopularityFilter(e.target.value as PopularityFilter)
                  }
                  className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Todos</option>
                  <option value="trending">Em Alta</option>
                  <option value="new">Novos</option>
                  <option value="popular">Populares</option>
                </select>
              </div>
            </div>

            {/* Tags populares */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Tags Populares
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      selectedTags.includes(tag)
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Indicador de filtros ativos */}
        {(selectedGenre !== "all" ||
          selectedCity !== "all" ||
          popularityFilter !== "all" ||
          selectedTags.length > 0) && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">Filtros ativos:</span>

              {selectedGenre !== "all" && (
                <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-300 text-sm flex items-center gap-2">
                  {selectedGenre}
                  <button
                    onClick={() => setSelectedGenre("all")}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCity !== "all" && (
                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-300 text-sm flex items-center gap-2">
                  {selectedCity}
                  <button
                    onClick={() => setSelectedCity("all")}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {popularityFilter !== "all" && (
                <span className="px-3 py-1 bg-orange-600/20 border border-orange-500/30 rounded-full text-orange-300 text-sm flex items-center gap-2">
                  {popularityFilter === "trending"
                    ? "Em Alta"
                    : popularityFilter === "new"
                    ? "Novos"
                    : "Populares"}
                  <button
                    onClick={() => setPopularityFilter("all")}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-green-300 text-sm flex items-center gap-2"
                >
                  #{tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Seções de categorias de exploração com slider e navegação */}
        {!searchQuery &&
          selectedGenre === "all" &&
          selectedCity === "all" &&
          popularityFilter === "all" &&
          selectedTags.length === 0 && (
            <div className="space-y-8 mb-12">
              {categories.map((category, categoryIndex) => (
                <CategorySlider
                  key={category.id}
                  category={category}
                  categoryIndex={categoryIndex}
                  onTagToggle={toggleTag}
                  selectedTags={selectedTags}
                />
              ))}
            </div>
          )}

        {/* Resultados filtrados */}
        {(searchQuery ||
          selectedGenre !== "all" ||
          selectedCity !== "all" ||
          popularityFilter !== "all" ||
          selectedTags.length > 0) && (
          <div>
            {/* Header dos resultados */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {searchQuery
                      ? `Resultados para "${searchQuery}"`
                      : "Resultados Filtrados"}
                  </h2>
                  <p className="text-gray-400">
                    {isLoading
                      ? "Carregando..."
                      : `${filteredData.length} ${
                          filteredData.length === 1
                            ? "resultado encontrado"
                            : "resultados encontrados"
                        }`}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Grid de resultados */}
            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-700/50 aspect-square rounded-xl mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              // Estado vazio
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-400 mb-6">
                  Tente ajustar seus filtros ou buscar por outros termos
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg transition-all duration-300"
                >
                  Limpar Filtros
                </button>
              </motion.div>
            ) : (
              // Grid de resultados
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map((item) => (
                  <ExploreCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Seção de tags trending */}
        <motion.div
          className="mt-16 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              <FaTags className="inline mr-2 text-purple-400" />
              Tags em Alta
            </h2>
            <p className="text-gray-400">
              Explore por temas e estilos populares em Moçambique
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {popularTags.map((tag, index) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTags.includes(tag)
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
