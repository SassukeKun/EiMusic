"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Star,
  Clock,
  MessageCircle,
  Heart,
  Lock,
  Globe,
  Search,
  Filter,
  Plus,
  Crown,
  Zap,
  Music,
  Sparkles,
  TrendingUp,
  Flame,
} from "lucide-react";
import { CreateCommunityModal } from './CreateCommunityModal';
import { useAuth } from '@/hooks/useAuth';
import { fetchCommunities, createCommunity } from '@/services/communityService';
import uploadService from '@/services/uploadService';
import { Community } from '@/models/community';



// Interface para dados do formulário do modal
interface CommunityFormData {
  name: string;
  description: string;
  category: string;
  access_type: 'public' | 'private' | 'invite_only';
  image?: File | null;
  tags: string[];
}

// Página de Comunidades - EiMusic Platform
export default function CommunityPage() {
  // Hook de autenticação para verificar se é artista
  const { user, isArtist, isAuthenticated } = useAuth();

  // Estados para gerenciamento de dados e UI
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "public" | "private">(
    "all"
  );

  // Estado para controle do modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // // Mock data realista seguindo padrões moçambicanos
  // const mockCommunities: Community[] = [
  //   {
  //     id: "1",
  //     name: "Marrabenta Moderna",
  //     artist: {
  //       id: "art1",
  //       name: "Zena Bakar",
  //       profile_image_url: "/api/placeholder/64/64",
  //       verified: true,
  //     },
  //     descricao:
  //       "Comunidade dedicada à evolução da marrabenta com toques modernos. Partilhamos experiências, técnicas e colaborações exclusivas.",
  //     membros: 2847,
  //     tipo_acesso: "public",
  //     data_criacao: "2024-08-15T10:30:00Z",
  //     categoria: "Música Tradicional",
  //     ativo: true,
  //     posts_recentes: 12,
  //     is_trending: true,
  //     activity_level: "high",
  //     tags: ["#Marrabenta", "#Fusão", "#Tradição"],
  //     "from-purple-600", "via-pink-600", "to-red-600"],
  //   },
  //   {
  //     id: "2",
  //     name: "Pandza Fusion",
  //     artist: {
  //       id: "art2",
  //       name: "MC Joaquim",
  //       profile_image_url: "/api/placeholder/64/64",
  //       verified: true,
  //     },
  //     descricao:
  //       "Explorando a fusão do pandza com hip-hop internacional. Exclusivo para membros premium com beats e colaborações únicas.",
  //     membros: 856,
  //     tipo_acesso: "private",
  //     data_criacao: "2024-10-02T14:20:00Z",
  //     categoria: "Hip-Hop",
  //     ativo: true,
  //     posts_recentes: 8,
  //     is_trending: false,
  //     activity_level: "medium",
  //     tags: ["#Pandza", "#HipHop", "#Premium"],
  //     "from-yellow-500", "via-orange-500", "to-red-500"],
  //   },
  //   {
  //     id: "3",
  //     name: "Produtores de Maputo",
  //     artist: {
  //       id: "art3",
  //       name: "DJ Azagaia Jr",
  //       profile_image_url: "/api/placeholder/64/64",
  //       verified: false,
  //     },
  //     descricao:
  //       "Rede de produtores musicais da capital. Partilhamos beats exclusivos, dicas de produção e oportunidades de colaboração.",
  //     membros: 1205,
  //     tipo_acesso: "public",
  //     data_criacao: "2024-07-22T08:45:00Z",
  //     categoria: "Produção",
  //     ativo: true,
  //     posts_recentes: 25,
  //     is_trending: true,
  //     activity_level: "high",
  //     tags: ["#Beats", "#Produção", "#Maputo"],
  //     "from-cyan-500", "via-blue-500", "to-purple-600"],
  //   },
  //   {
  //     id: "4",
  //     name: "Vocal Coaching Moz",
  //     artist: {
  //       id: "art4",
  //       name: "Maria dos Anjos",
  //       profile_image_url: "/api/placeholder/64/64",
  //       verified: true,
  //     },
  //     descricao:
  //       "Técnicas vocais e desenvolvimento artístico. Sessões exclusivas de coaching, exercícios e dicas para membros VIP.",
  //     membros: 643,
  //     tipo_acesso: "private",d
  //     data_criacao: "2024-09-10T16:00:00Z",
  //     categoria: "Educação Musical",
  //     ativo: true,
  //     posts_recentes: 6,
  //     is_trending: false,
  //     activity_level: "medium",
  //     tags: ["#Vocal", "#Coaching", "#VIP"],
  //     "from-emerald-500", "via-teal-500", "to-cyan-600"],
  //   },
  //   {
  //     id: "5",
  //     nome: "Afrobeats Moçambique",
  //     artista: {
  //       id: "art5",
  //       nome: "Kelvin Momo Moz",
  //       avatar: "/api/placeholder/64/64",
  //       verificado: true,
  //     },
  //     descricao:
  //       "O melhor do afrobeats moçambicano! Descobrimos novos talentos, partilhamos playlists e organizamos eventos exclusivos.",
  //     membros: 3421,
  //     tipo_acesso: "public",
  //     data_criacao: "2024-06-05T12:15:00Z",
  //     categoria: "Afrobeats",
  //     ativo: true,
  //     posts_recentes: 35,
  //     is_trending: true,
  //     activity_level: "high",
  //     tags: ["#Afrobeats", "#Novos", "#Eventos"],
  //     "from-green-500", "via-yellow-500", "to-orange-500"],
  //   },
  //   {
  //     id: "6",
  //     nome: "Jazz & Soul Moz",
  //     artista: {
  //       id: "art6",
  //       nome: "Lenna Bahule",
  //       avatar: "/api/placeholder/64/64",
  //       verificado: true,
  //     },
  //     descricao:
  //       "Para os apreciadores do jazz e soul moçambicano. Discussões profundas sobre música, sessões ao vivo e masterclasses.",
  //     membros: 892,
  //     tipo_acesso: "public",
  //     data_criacao: "2024-05-20T18:30:00Z",
  //     categoria: "Jazz & Soul",
  //     ativo: true,
  //     posts_recentes: 15,
  //     is_trending: false,
  //     activity_level: "medium",
  //     tags: ["#Jazz", "#Soul", "#Masterclass"],
  //     "from-indigo-600", "via-purple-600", "to-pink-600"],
  //   },
  // ];

  // Carregar comunidades reais do backend
  useEffect(() => {
    const loadCommunities = async () => {
      setLoading(true);
      try {
        const data = await fetchCommunities();
        // Map backend data to Community model
        const uiData = data.map((raw: any) => ({
          id: raw.id,
          name: raw.name,
          artist: raw.artist
            ? {
                artist_id: raw.artist.id,
                name: raw.artist.name,
                profile_image_url: raw.artist.profile_image_url || '/api/placeholder/64/64',
                verified: raw.artist.verified || false,
              }
            : undefined,
          description: raw.description || '',
          members_count: raw.members_count || 1,
          access_type: raw.access_type,
          created_at: raw.created_at,
          category: raw.category,
          is_active: raw.is_active,
          posts_count: raw.posts_count || 0,
          activity_level: raw.activity_level,
          tags: raw.tags || [],
          artist_id: raw.artist_id,
          banner: raw.banner || undefined,
          
          recent_posts: raw.recent_posts || [],
        }));
        setCommunities(uiData);
      } catch (error) {
        console.error('Erro ao buscar comunidades:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCommunities();
  }, []);

  // Handler para criar nova comunidade
  const handleCreateCommunity = async (formData: CommunityFormData) => {
    try {
      // Criar comunidade no backend
      const created = await createCommunity({
        name: formData.name,
        description: formData.description,
        access_type: formData.access_type === 'invite_only' ? 'private' : formData.access_type,
        category: formData.category,
        tags: formData.tags,
        artist_id: user?.id,
      });
      // Upload de imagem, se existir
      if (formData.image) {
        await uploadService.uploadCommunityMedia(
          created.id,
          formData.image,
          'image'
        );
      }
      // Atualizar lista após criação
      const data = await fetchCommunities();
      const uiData = data.map((raw: any) => ({
        id: raw.id,
        name: raw.name,
        artist: raw.artist
          ? {
              artist_id: raw.artist.id,
              name: raw.artist.name,
              profile_image_url: raw.artist.profile_image_url || '/api/placeholder/64/64',
              verified: raw.artist.verified || false,
            }
          : undefined,
        description: raw.description || '',
        members_count: raw.members_count || 1,
        access_type: raw.access_type,
        created_at: raw.created_at,
        category: raw.category,
        is_active: raw.is_active,
        posts_count: raw.posts_count || 0,
        activity_level: raw.activity_level,
        tags: raw.tags || [],
        artist_id: raw.artist_id,
        banner: raw.banner || undefined,
        
        recent_posts: raw.recent_posts || [],
      }));
      setCommunities(uiData);
    } catch (error) {
      console.error('Erro ao criar comunidade:', error);
      throw error;
    }
  };

  // Lógica de filtros reativa
  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.artist?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || community.access_type === filterType;

    return matchesSearch && matchesFilter;
  });

  // Formatação de data em português
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-MZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Formatação de números grandes
  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // Definir cores do nível de atividade
  const getActivityColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getActivityIcon = (level: string) => {
    switch (level) {
      case "high":
        return <Flame className="w-4 h-4" />;
      case "medium":
        return <TrendingUp className="w-4 h-4" />;
      case "low":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Componente de Loading Skeleton
  const CommunityCardSkeleton = () => (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 animate-pulse border border-gray-700">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-600 rounded w-3/4"></div>
          <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded w-1/2"></div>
          <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded w-full"></div>
        </div>
      </div>
      <div className="mt-4 flex space-x-4">
        <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded w-20"></div>
        <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded w-16"></div>
      </div>
    </div>
  );

  // Componente individual de comunidade
  const CommunityCard = ({ community }: { community: Community }) => {
    const [isJoined, setIsJoined] = useState(false);
    const [joinLoading, setJoinLoading] = useState(false);

    // Handler de ação com feedback visual
    const handleJoinCommunity = async () => {
      setJoinLoading(true);
      // Simular chamada à API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsJoined(!isJoined);
      setJoinLoading(false);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-[1px] rounded-xl overflow-hidden group h-full flex flex-col"
      >
        {/* Efeito de brilho animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Card interno */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl relative z-10 h-full flex flex-col">
          {community.banner && (
            <Link href={`/community/${community.id}`}>
              <div className="cursor-pointer">
                <img
                  src={community.banner}
                  alt={`${community.name} banner`}
                  className="w-full h-32 object-cover"
                />
              </div>
            </Link>
          )}

          <div className="p-6 flex flex-col flex-grow">
            {/* Header da comunidade - RESPONSIVO */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                {/* Avatar do artista com efeito glow */}
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-[2px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  >
                    <img
                      src={community.artist?.profile_image_url || '/api/placeholder/64/64'}
                      alt={community.artist?.name || ''}
                      className="w-14 h-14 rounded-full object-cover bg-gray-800"
                    />
                  </motion.div>

                  {/* Badge de verificação com animação */}
                  {community.artist?.verified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-gray-900"
                    >
                      <Star className="w-3 h-3 text-white" fill="currentColor" />
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                      {community.name}
                    </h3>
                    {/* Indicador de tipo de acesso com cores vibrantes */}
                    <div className="flex items-center">
                      {community.access_type === "private" ? (
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="text-yellow-400"
                        >
                          <Lock className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="text-green-400"
                        >
                          <Globe className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-2">
                    por{" "}
                    <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text font-semibold">
                      {community.artist?.name}
                    </span>
                  </p>

                  <div className="flex items-center space-x-2 flex-wrap">
                    <span
                      className="inline-block bg-gray-700 text-white text-xs px-3 py-1 rounded-full font-medium"
                    >
                      {community.category}
                    </span>

                    {/* Nível de atividade */}
                    <div
                      className={`flex items-center space-x-1 ${getActivityColor(
                        community.activity_level
                      )}`}
                    >
                      {getActivityIcon(community.activity_level)}
                      <span className="text-xs font-medium capitalize">
                        {community.activity_level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de ação com gradientes vibrantes - RESPONSIVO */}
              <div className="flex justify-end sm:justify-start mt-3 sm:mt-0">
                <Link href={`/community/${community.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
        px-3 py-2 sm:px-6 sm:py-3 
        rounded-lg sm:rounded-xl 
        font-bold text-sm sm:text-base
        transition-all duration-300 
        flex items-center space-x-1 sm:space-x-2 
        text-white shadow-lg
        min-w-[80px] sm:min-w-[120px]
        ${
          community.access_type === "private"
            ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
            : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
        }
      `}
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline sm:inline">
                      {community.access_type === "private"
                        ? "Explorar"
                        : "Entrar"}
                    </span>
                    <span className="inline xs:hidden sm:hidden">→</span>
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Tags da comunidade */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.tags.map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 text-gray-300 text-xs px-2 py-1 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  {tag}
                </motion.span>
              ))}
            </div>

            {/* Descrição */}
            <p className="text-gray-300 text-sm mb-6 leading-relaxed flex-grow">
              {community.description}
            </p>

            {/* Estatísticas com ícones coloridos */}
            <div className="flex items-center justify-between text-sm mt-auto">
              <div className="flex items-center space-x-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 text-blue-400"
                >
                  <Users className="w-4 h-4" />
                  <span className="font-medium">
                    {formatMemberCount(community.members_count)} membros
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2 text-green-400"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">
                    {community.posts_count} posts
                  </span>
                </motion.div>
              </div>

              <div className="flex items-center space-x-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs">
                  {formatDate(community.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
// Render da página principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white relative overflow-hidden">
      {/* Efeitos de background animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header da página com efeitos vibrantes */}
      <div className="border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl relative top-0 z-20">
        {/* Linha de gradiente no topo */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-yellow-500 to-green-500"></div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Título e descrição com animações */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Comunidades de Artistas
                </h1>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>
              <p className="text-gray-300 text-lg max-w-2xl">
                🎵 Conecte-se com outros fãs e participe de discussões
                exclusivas dos seus artistas favoritos
              </p>

              {/* Estatísticas rápidas */}
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {communities.length} comunidades ativas
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    8.2k membros totais
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-medium">94 posts hoje</span>
                </div>
              </div>
            </motion.div>

            {/* Área de busca e filtros com efeitos visuais */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
            >
              {/* Campo de busca com gradiente */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder="Buscar comunidades mágicas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-80 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Filtro de tipo com estilo vibrante */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(
                        e.target.value as "all" | "public" | "private"
                      )
                    }
                    className="pl-12 pr-8 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all duration-300"
                  >
                    <option value="all">🌟 Todas</option>
                    <option value="public">🌍 Públicas</option>
                    <option value="private">🔒 Privadas</option>
                  </select>
                </div>
              </div>

              {/* Botão Criar Comunidade - Apenas para artistas autenticados */}
              {isAuthenticated && isArtist && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  <Plus className="w-3 h-3" />
                  <span className="hidden sm:inline">Criar Comunidade</span>
                  <span className="inline sm:hidden">Criar</span>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Estados de carregamento e vazio */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CommunityCardSkeleton />
                </motion.div>
              ))}
            </motion.div>
          ) : filteredCommunities.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div className="relative">
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Users className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                </motion.div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-8 h-8 text-purple-400" />
                  </motion.div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-3">
                Nenhuma comunidade encontrada
              </h3>
              <p className="text-gray-400 text-lg">
                🔍 Tente ajustar os filtros ou buscar por outros termos mágicos
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Contador de resultados com animação */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <p className="text-gray-300 text-lg">
                    <span className="font-bold text-white">
                      {filteredCommunities.length}
                    </span>{" "}
                    {filteredCommunities.length === 1
                      ? "comunidade encontrada"
                      : "comunidades encontradas"}
                  </p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Music className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                </div>

                {/* Filtros ativos */}
                {(searchTerm || filterType !== "all") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Filtros ativos</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Grid de comunidades */}
              <div className="space-y-8">
                {filteredCommunities.map((community, index) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <CommunityCard community={community} />
                  </motion.div>
                ))}
              </div>

              {/* Call to action para criar comunidade - Apenas para usuários não-artistas */}
              {(!isAuthenticated || !isArtist) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: filteredCommunities.length * 0.1 + 0.3 }}
                  className="mt-12 text-center"
                >
                  <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 rounded-2xl p-8 border border-purple-500/20">
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                      És artista? Cria a tua comunidade!
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                      Conecta-te diretamente com os teus fãs e constrói uma
                      comunidade em torno da tua música
                    </p>

                    <Link href="/artist/register">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                      >
                        ✨ Tornar-me Artista
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Criação de Comunidade */}
      <CreateCommunityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCommunity}
      />
    </div>
  );
}
