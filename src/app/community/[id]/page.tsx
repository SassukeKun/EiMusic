"use client";
import Link from "next/link";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { getCommunityById, getCommunityMembership, joinCommunity, leaveCommunity } from "@/services/communityService";
import authService from "@/services/authService";
import { Community } from "@/models/community";
import { getSupabaseBrowserClient } from '@/utils/supabaseClient';
const supabase = getSupabaseBrowserClient();

// Hardcoded gradient colors for community header
const DEFAULT_GRADIENT_COLORS = ['from-purple-600','via-pink-600','to-red-600'];
import { Post } from "@/models/post";
import {
  Users,
  Star,
  Clock,
  MessageCircle,
  Heart,
  Lock,
  Globe,
  Play,
  Download,
  Video,
  Crown,
  Gem,
  Zap,
  Music,
  Sparkles,
  TrendingUp,
  Flame,
  Calendar,
  Gift,
  Phone,
  Settings,
  ArrowLeft,
  Share2,
  MoreVertical,
  Send,
  Image,
  Mic,
  Camera,
  Bell,
} from "lucide-react";

// Interfaces TypeScript para tipagem forte

interface UserPlan {
  tipo: "free" | "premium" | "vip";
  ativo: boolean;
  data_expiracao?: string;
}

// Página de Detalhes da Comunidade - EiMusic Platform
export default function CommunityDetailPage() {
  // Estados para gerenciamento de dados e UI
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan>({
    tipo: "vip",
    ativo: true,
  });
  const [activeTab, setActiveTab] = useState<
    "posts" | "galeria" | "membros" | "sobre"
  >("posts");
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newPostText, setNewPostText] = useState("");

  // Função para verificar acesso ao conteúdo
  const hasAccessToContent = (
    requiredPlan: "free" | "premium" | "vip"
  ): boolean => {
    const planHierarchy = { free: 0, premium: 1, vip: 2 };
    return planHierarchy[userPlan.tipo] >= planHierarchy[requiredPlan];
  };

  // Função para obter badge do plano
  const getPlanBadge = (plan: "free" | "premium" | "vip") => {
    switch (plan) {
      case "premium":
        return (
          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
            <Crown className="w-3 h-3" />
            <span>PREMIUM</span>
          </div>
        );
      case "vip":
        return (
          <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            <Gem className="w-3 h-3" />
            <span>VIP</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Mock data da comunidade
  // const mockCommunity: Community = {
  //   id: "1",
  //   name: "Marrabenta Moderna",
  //   artist: {
  //     id: "art1",
  //     name: "Zena Bakar",
  //     profile_image_url: "/api/placeholder/64/64",
  //     verified: true,
  //   },
  //   description:
  //     "Comunidade dedicada à evolução da marrabenta com toques modernos. Partilhamos experiências, técnicas e colaborações exclusivas com os nossos membros mais fiéis.",
  //   members: 2847,
  //   tipo_acesso: "private",
  //   data_criacao: "2024-08-15T10:30:00Z",
  //   categoria: "Música Tradicional",
  //   ativo: true,
  //   posts_recentes: 12,
  //   is_trending: true,
  //   activity_level: "high",
  //   tags: ["#Marrabenta", "#Fusão", "#Tradição"],
  //   gradient_colors: ["from-purple-600", "via-pink-600", "to-red-600"],
  //   banner: "/api/placeholder/800/300",
  //   plano_necessario: "premium",
  // };

  // Mock data dos posts
  // const mockPosts: Post[] = [
  //   {
  //     id: "1",
  //     author: {
  //       name: "Zena Bakar",
  //       avatar: "/api/placeholder/48/48",
  //       type: "artista",
  //     },
  //     content:
  //       "🎵 Acabei de terminar uma nova faixa que mistura marrabenta tradicional com elementos de jazz moderno! Que acham de fazermos uma sessão ao vivo para ouvirem primeiro? Membros VIP terão acesso exclusivo à demo completa! 🔥",
  //     tipo: "exclusivo",
  //     plano_necessario: "vip",
  //     data_publicacao: "2024-12-13T14:30:00Z",
  //     curtidas: 127,
  //     comentarios: 23,
  //     anexos: [
  //       {
  //         tipo: "audio",
  //         url: "/audio/demo.mp3",
  //         duracao: "3:45",
  //       },
  //     ],
  //     is_pinned: true,
  //   },
  //   {
  //     id: "2",
  //     author: {
  //       name: "Zena Bakar",
  //       avatar: "/api/placeholder/48/48",
  //       type: "artista",
  //     },
  //     content:
  //       "📅 LIVE EXCLUSIVA ESTA SEXTA! Vamos falar sobre as técnicas de guitarra na marrabenta e vou tocar algumas das vossas músicas favoritas. Membros Premium e VIP podem enviar pedidos especiais nos comentários!",
  //     tipo: "live",
  //     plano_necessario: "premium",
  //     data_publicacao: "2024-12-12T10:15:00Z",
  //     curtidas: 89,
  //     comentarios: 34,
  //     anexos: [
  //       {
  //         tipo: "video",
  //         url: "/video/live-preview.mp4",
  //         duracao: "1:20",
  //       },
  //     ],
  //   },
  //   {
  //     id: "3",
  //     autor: {
  //       nome: "Carlos Manjate",
  //       avatar: "/api/placeholder/48/48",
  //       tipo: "membro",
  //     },
  //     conteudo:
  //       "Que energia incrível na última live! Aprendi tanto sobre as técnicas de dedilhado. Obrigado Zena por partilhares o teu conhecimento connosco! 🙏",
  //     tipo: "texto",
  //     plano_necessario: "free",
  //     data_publicacao: "2024-12-11T16:45:00Z",
  //     curtidas: 45,
  //     comentarios: 8,
  //   },
  //   {
  //     id: "4",
  //     autor: {
  //       nome: "Zena Bakar",
  //       avatar: "/api/placeholder/48/48",
  //       tipo: "artista",
  //     },
  //     conteudo:
  //       "🎸 Download exclusivo para membros Premium! Nova base instrumental de marrabenta que criei. Usem-na nos vossos projectos e partilhem os resultados aqui na comunidade!",
  //     tipo: "audio",
  //     plano_necessario: "premium",
  //     data_publicacao: "2024-12-10T09:20:00Z",
  //     curtidas: 156,
  //     comentarios: 41,
  //     anexos: [
  //       {
  //         tipo: "audio",
  //         url: "/audio/base-instrumental.mp3",
  //         duracao: "4:12",
  //       },
  //     ],
  //   },
  // ];

  const params = useParams();
  const communityId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const raw = await getCommunityById(communityId);
        // Fetch member count directly from community_members table
        const { data: memberCountData } = await supabase
          .from('community_members')
          .select('*', { head: true, count: 'exact' })
          .eq('community_id', communityId);
        
        setCommunity({
          id: raw.id,
          name: raw.name,
          description: raw.description ?? null,
          category: raw.category,
          access_type: raw.access_type,
          tags: raw.tags,
          is_active: raw.is_active,
          activity_level: raw.activity_level,
          artist_id: raw.artist_id ?? null,
          created_at: raw.created_at,
          banner: raw.banner ?? undefined,
          members_count: raw.members_count ?? 0,
          posts_count: raw.posts_count ?? 0,
          recent_posts: [],
          artist: raw.artist
            ? {
                artist_id: raw.artist.artist_id,
                name: raw.artist.name,
                profile_image_url: raw.artist.profile_image_url,
                verified: raw.artist.verified,
              }
            : undefined,
        });

        // Determine user and membership status
        const currentUser = await authService.getCurrentUser();
        if (currentUser?.id) {
          setUserId(currentUser.id);
          setIsCreator(currentUser.id === raw.artist_id);
          const membership = await getCommunityMembership(communityId, currentUser.id);
          setIsJoined(membership);
        } else {
          setUserId(null);
          setIsJoined(false);
        }

        // TODO: fetch posts when implemented
      } catch (error) {
        console.error("Erro ao carregar comunidade:", error);
      } finally {
        setLoading(false);
      }
    };
    if (communityId) loadData();
  }, [communityId]);

  // Componente de Loading
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="flex space-x-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente do Post
  const PostCard = ({ post }: { post: Post }) => {
    const [liked, setLiked] = useState(false);
    const hasAccess = hasAccessToContent(post.plan);

    const formatTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      );

      if (diffInHours < 1) return "Agora mesmo";
      if (diffInHours < 24) return `${diffInHours}h atrás`;
      return `${Math.floor(diffInHours / 24)}d atrás`;
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border relative overflow-hidden ${
          post.pinned ? "border-yellow-500/30" : "border-gray-700"
        }`}
      >
        {/* Pin indicator */}
        {post.pinned && (
          <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <Star className="w-3 h-3" fill="currentColor" />
            <span>Fixado</span>
          </div>
        )}

        <div className="p-6">
          {/* Header do post */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={post.autor.avatar}
                alt={post.autor.name}
                className="w-12 h-12 rounded-full border-2 border-gray-600"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-white">
                    {post.autor.name}
                  </h4>
                  {post.autor.verified && (
                    <Star
                      className="w-4 h-4 text-blue-400"
                      fill="currentColor"
                    />
                  )}
                  {getPlanBadge(post.plan)}
                </div>
                <p className="text-gray-400 text-sm">
                  {formatTimeAgo(post.created_at)}
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo do post */}
          {hasAccess ? (
            <>
              <p className="text-gray-300 mb-4 leading-relaxed">
                {post.content}
              </p>

              {/* Anexos */}
              {post.attachments &&
                post.attachments.map((attachment, index) => (
                  <div key={index} className="mb-4">
                    {attachment.type === "audio" && (
                      <div className="bg-gray-700/50 rounded-lg p-4 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            Arquivo de Áudio
                          </p>
                          <p className="text-gray-400 text-sm">
                            Duração: {attachment.duration}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                        >
                          <Play className="w-5 h-5" />
                        </motion.button>
                      </div>
                    )}

                    {attachment.type === "video" && (
                      <div className="bg-gray-700/50 rounded-lg p-4 flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            Vídeo Preview
                          </p>
                          <p className="text-gray-400 text-sm">
                            Duração: {attachment.duration}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                        >
                          <Play className="w-5 h-5" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                ))}
            </>
          ) : (
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg p-6 text-center border border-gray-600/30">
              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">
                Conteúdo Exclusivo
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Este post é exclusivo para membros{" "}
                {post.plan === "premium" ? "Premium" : "VIP"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpgradeModal(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  post.plan === "premium"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                    : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                } text-white`}
              >
                Upgrade para{" "}
                {post.plan === "premium" ? "Premium" : "VIP"}
              </motion.button>
            </div>
          )}

          {/* Ações do post */}
          {hasAccess && (
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-700">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLiked(!liked)}
                className={`flex items-center space-x-2 transition-colors ${
                  liked ? "text-red-400" : "text-gray-400 hover:text-red-400"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                <span>{post.likes + (liked ? 1 : 0)}</span>
              </motion.button>

              <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments}</span>
              </button>

              <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                <Share2 className="w-5 h-5" />
                <span>Partilhar</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Modal de Upgrade
  const UpgradeModal = () => (
    <AnimatePresence>
      {showUpgradeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Upgrade o teu Plano
              </h3>
              <p className="text-gray-400 mb-6">
                Acede a conteúdo exclusivo e benefícios especiais
              </p>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-white">Premium</span>
                    </div>
                    <span className="text-yellow-500 font-bold">
                      120 MT/mês
                    </span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Posts exclusivos do artista</li>
                    <li>• Lives mensais</li>
                    <li>• Downloads de demos</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Gem className="w-5 h-5 text-purple-500" />
                      <span className="font-bold text-white">VIP</span>
                    </div>
                    <span className="text-purple-500 font-bold">
                      250 MT/mês
                    </span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Tudo do Premium +</li>
                    <li>• Video calls 1:1 mensais</li>
                    <li>• Chat direto com artista</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl transition-all">
                  Escolher Plano
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Function to get gradient colors
  const getGradientColors = () => {
    return DEFAULT_GRADIENT_COLORS.join(" ");
  };

  if (loading || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-4xl mx-auto p-4">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white relative overflow-hidden">
      {/* Efeitos de background animados - MESMO DAS OUTRAS PÁGINAS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header com banner */}
      <div className="relative">
        {/* Banner */}
        <div
          className={`h-48 sm:h-64 bg-gradient-to-r ${DEFAULT_GRADIENT_COLORS.join(
            " "
          )} relative overflow-hidden`}
        >
          {community.banner && (
            <img
              src={community.banner}
              alt={community.name}
              className="w-full h-full object-cover opacity-50"
            />
          )}

          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

          {/* Botão voltar */}
          <Link href="/community">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </Link>

          {/* Trending badge */}
          {/* {community.is_trending && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Flame className="w-3 h-3" />
              <span>TRENDING</span>
            </div>
          )}
          */}
        </div>

        {/* Info da comunidade */}
        <div className="max-w-4xl mx-auto px-4 relative -mt-16">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-1 rounded-full bg-gradient-to-r ${DEFAULT_GRADIENT_COLORS.join(
                " "
              )} relative z-10`}
            >                <img
                  src={community.artist?.profile_image_url ?? '/api/placeholder/128/128'}
                  alt={community.artist?.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-800 border-4 border-gray-900"
                />
            </motion.div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {community.name}
                  </h1>
                  <p className="text-gray-300 mb-2">
                    por{" "}
                    <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text font-semibold">
                      {community.artist?.name}
                    </span>
                    {community.artist?.verified && (
                      <Star
                        className="w-4 h-4 text-blue-400 inline ml-1"
                        fill="currentColor"
                      />
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className={`bg-gradient-to-r ${DEFAULT_GRADIENT_COLORS.join(
                        " "
                      )} text-white px-3 py-1 rounded-full text-sm font-medium`}
                    >
                      {community?.category}
                    </span>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {community?.members_count?.toLocaleString()} membros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>

                  {isCreator ? (
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={async () => {
                       // Admin control: Start live
                       console.log("Starting live...");
                     }}
                     className="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all"
                   >
                     Iniciar Live
                   </motion.button>
                 ) : (
                   <motion.button
                     whileHover={{ scale: 1.05 }}
                     whileTap={{ scale: 0.95 }}
                     onClick={async () => {
                       if (userId) {
                         if (isJoined) {
                           await leaveCommunity(communityId, userId);
                           setIsJoined(false);
                         } else {
                           await joinCommunity(communityId, userId);
                           setIsJoined(true);
                         }
                       }
                     }}
                     className={`px-6 py-2 rounded-lg font-bold transition-all ${
                       isJoined
                         ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                         : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                     } text-white`}
                   >
                     {isJoined ? "Membro" : "Participar"}
                   </motion.button>
                 )}
                </div>
              </div>

              <p className="text-gray-300 leading-relaxed">
                {community?.description}
              </p>
            </div>
          </div>

          {/* Tabs - REMOVIDO EVENTOS, ADICIONADO GALERIA */}
          <div className="mt-8 border-b border-gray-700">
            <nav className="flex space-x-8">
              {[
                { id: "posts", label: "Posts", icon: MessageCircle },
                { id: "galeria", label: "Galeria", icon: Image },
                { id: "membros", label: "Membros", icon: Users },
                { id: "sobre", label: "Sobre", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-purple-500 text-purple-400"
                      : "border-transparent text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-4xl mx-auto p-4 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed principal */}
          <div className="lg:col-span-2">
            {activeTab === "posts" && (
              <div className="space-y-6">
                {/* ÁREA DE CRIAR POST - ADAPTADA AO PLANO */}
                {isJoined && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                    <div className="flex space-x-4">
                      <img
                        src="/api/placeholder/48/48"
                        alt="Seu avatar"
                        className="w-12 h-12 rounded-full border-2 border-gray-600"
                      />
                      <div className="flex-1">
                        <textarea
                          value={newPostText}
                          onChange={(e) => setNewPostText(e.target.value)}
                          placeholder={
                            userPlan.tipo === "free"
                              ? "Partilha algo com a comunidade..."
                              : userPlan.tipo === "premium"
                              ? "Partilha conteúdo exclusivo Premium..."
                              : "Partilha conteúdo VIP com a comunidade..."
                          }
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex space-x-3">
                            <button className="text-gray-400 hover:text-purple-400 transition-colors">
                              <Image className="w-5 h-5" />
                            </button>

                            {(userPlan.tipo === "premium" ||
                              userPlan.tipo === "vip") && (
                              <button className="text-gray-400 hover:text-blue-400 transition-colors">
                                <Music className="w-5 h-5" />
                              </button>
                            )}

                            {userPlan.tipo === "vip" && (
                              <button className="text-gray-400 hover:text-red-400 transition-colors">
                                <Video className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!newPostText.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>Publicar</span>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* POSTS FILTRADOS POR PLANO */}
                <div className="space-y-6">
                  {posts            
                    .filter((post) => hasAccessToContent(post.plan))
                    .map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}

                  {posts
                    .filter(
                      (post) => !hasAccessToContent(post.plan)
                    )
                    .slice(0, 2)
                    .map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}

                  {userPlan.tipo !== "vip" && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 rounded-2xl p-8 border border-purple-500/20 text-center"
                    >
                      <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-white mb-2">
                        {userPlan.tipo === "free"
                          ? "Desbloqueia conteúdo Premium e VIP!"
                          : "Upgrade para VIP e acede a tudo!"}
                      </h3>
                      <p className="text-gray-300 mb-6">
                        {userPlan.tipo === "free"
                          ? "Tens acesso apenas a conteúdo básico. Upgrade para ver posts exclusivos, lives e muito mais."
                          : "Como membro Premium, já tens acesso a muito conteúdo. Upgrade para VIP e desbloqueia video calls e chat direto!"}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUpgradeModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
                      >
                        {userPlan.tipo === "free"
                          ? "🚀 Escolher Plano"
                          : "💎 Upgrade para VIP"}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "galeria" && (
              <div className="space-y-6">
                {userPlan.tipo === "free" ? (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      Galeria Exclusiva
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Acesso à galeria de fotos e vídeos é exclusivo para
                      membros Premium e VIP
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-bold"
                    >
                      Upgrade para Premium
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[...Array(userPlan.tipo === "vip" ? 12 : 6)].map(
                      (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="aspect-square bg-gray-800 rounded-xl overflow-hidden group cursor-pointer"
                        >
                          <img
                            src={`/api/placeholder/200/200?random=${i}`}
                            alt={`Galeria ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </motion.div>
                      )
                    )}

                    {userPlan.tipo === "premium" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl flex flex-col items-center justify-center text-center p-4"
                      >
                        <Gem className="w-8 h-8 text-purple-400 mb-2" />
                        <span className="text-sm text-gray-300 font-medium">
                          +6 fotos VIP
                        </span>
                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="text-xs text-purple-400 mt-1 hover:text-purple-300"
                        >
                          Upgrade VIP
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "membros" && (
              <div className="space-y-6">
                {userPlan.tipo === "free" ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                      Lista de Membros
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Ver a lista completa de membros é exclusivo para Premium e
                      VIP
                    </p>
                    <div className="text-gray-400">
                      <span className="text-2xl font-bold text-white">
                        {community?.members_count.toLocaleString()}
                      </span>{" "}
                      membros totais
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[...Array(userPlan.tipo === "vip" ? 10 : 5)].map(
                      (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-xl"
                        >
                          <img
                            src={`/api/placeholder/48/48?random=${i + 10}`}
                            alt={`Membro ${i + 1}`}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">
                              Membro {i + 1}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              Membro há {Math.floor(Math.random() * 12) + 1}{" "}
                              meses
                            </p>
                          </div>
                          {userPlan.tipo === "vip" && (
                            <button className="text-purple-400 hover:text-purple-300 transition-colors">
                              <MessageCircle className="w-5 h-5" />
                            </button>
                          )}
                        </motion.div>
                      )
                    )}

                    {userPlan.tipo === "premium" && (
                      <div className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                        <p className="text-gray-300 mb-4">
                          Como membro VIP, podes enviar mensagens diretas para
                          outros membros
                        </p>
                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium"
                        >
                          Upgrade para VIP
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "sobre" && (
              <div className="space-y-6">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Sobre a Comunidade
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {community.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">
                        {community?.members_count?.toLocaleString() ?? 0}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Posts Recentes
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {community.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-700/30 rounded-lg">
                    <h4 className="font-semibold text-white mb-3">
                      Benefícios do teu plano {userPlan.tipo.toUpperCase()}
                    </h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {userPlan.tipo === "free" && (
                        <>
                          <li>• Visualização de posts públicos</li>
                          <li>• Comentários e curtidas</li>
                          <li>• Chat público básico</li>
                        </>
                      )}
                      {userPlan.tipo === "premium" && (
                        <>
                          <li>• Tudo do FREE +</li>
                          <li>• Posts exclusivos do artista</li>
                          <li>• Lives mensais</li>
                          <li>• Downloads de demos</li>
                          <li>• Galeria de fotos</li>
                          <li>• Lista completa de membros</li>
                        </>
                      )}
                      {userPlan.tipo === "vip" && (
                        <>
                          <li>• Tudo do PREMIUM +</li>
                          <li>• Video calls 1:1 mensais</li>
                          <li>• Chat direto com artista</li>
                          <li>• Galeria completa (fotos + vídeos)</li>
                          <li>• Mensagens diretas para membros</li>
                          <li>• Acesso prioritário a eventos</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - ADAPTADA AO PLANO */}
          <div className="space-y-6">
            <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 ${isCreator ? 'hidden' : ''}`}>
              <h3 className="font-bold text-white mb-4 flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span>Teu Plano Atual</span>
              </h3>

              <div
                className={`p-4 rounded-lg border-2 ${
                  userPlan.tipo === "free"
                    ? "bg-gray-700/30 border-gray-600"
                    : userPlan.tipo === "premium"
                    ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                    : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-white capitalize">
                    {userPlan.tipo}
                  </span>
                  {userPlan.tipo !== "free" && getPlanBadge(userPlan.tipo)}
                </div>

                {userPlan.tipo === "free" ? (
                  <div>
                    <p className="text-gray-400 text-sm mb-4">
                      Acesso básico à comunidade
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium transition-all"
                    >
                      Fazer Upgrade
                    </motion.button>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 text-sm">
                      Renova em: {userPlan.data_expiracao || "30 dias"}
                    </p>
                    {userPlan.tipo === "premium" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUpgradeModal(true)}
                        className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium transition-all"
                      >
                        Upgrade para VIP
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {userPlan.tipo === "vip" && (
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <span>Chat Direto VIP</span>
                </h3>

                <p className="text-gray-300 text-sm mb-4">
                  Tens acesso direto ao chat com {community.artist?.name}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Iniciar Chat</span>
                </motion.button>
              </div>
            )}

            {(userPlan.tipo === "premium" || userPlan.tipo === "vip") && (
              <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <Video className="w-5 h-5 text-red-400" />
                  <span>Próxima Live</span>
                </h3>

                <div className="space-y-3">
                  <p className="text-white font-medium">
                    Técnicas de Guitarra na Marrabenta
                  </p>
                  <p className="text-gray-400 text-sm">
                    Sexta, 15 Dezembro • 19:00
                  </p>

                  {userPlan.tipo === "vip" && (
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-purple-300 text-xs font-medium">
                        ACESSO VIP
                      </p>
                      <p className="text-gray-300 text-sm">
                        Podes fazer perguntas em tempo real
                      </p>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <Bell className="w-4 h-4" />
                    <span>Lembrar-me</span>
                  </motion.button>
                </div>
              </div>
            )}

            {userPlan.tipo !== "vip" && (
              <div
                className={`rounded-xl p-6 border ${
                  userPlan.tipo === "free"
                    ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20"
                    : "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20"
                }`}
              >
                <div className="text-center">
                  {userPlan.tipo === "free" ? (
                    <>
                      <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <h4 className="font-bold text-white mb-2">
                        Upgrade para Premium
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Acede a posts exclusivos, lives mensais e downloads
                      </p>
                      <p className="text-yellow-400 font-bold text-lg mb-4">
                        120 MT/mês
                      </p>
                    </>
                  ) : (
                    <>
                      <Gem className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                      <h4 className="font-bold text-white mb-2">
                        Upgrade para VIP
                      </h4>
                      <p className="text-gray-300 text-sm mb-4">
                        Video calls 1:1, chat direto e acesso a tudo
                      </p>
                      <p className="text-purple-400 font-bold text-lg mb-4">
                        250 MT/mês
                      </p>
                    </>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUpgradeModal(true)}
                    className={`w-full font-bold py-3 rounded-lg transition-all ${
                      userPlan.tipo === "free"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    } text-white`}
                  >
                    {userPlan.tipo === "free"
                      ? "👑 Tornar-me Premium"
                      : "💎 Tornar-me VIP"}
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Upgrade */}
      <UpgradeModal />
    </div>
  );
}
