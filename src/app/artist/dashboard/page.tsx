"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import ArtistConfigSection from "@/components/artist/ArtistConfigSection";
import DashboardOverviewSection from "@/components/artist/dashboard/OverviewSection";
import DashboardMusicasSection from "@/components/artist/dashboard/MusicasSection";
import DashboardVideosSection from "@/components/artist/dashboard/VideosSection";
import DashboardComunidadesSection from "@/components/artist/dashboard/ComunidadesSection";
import DashboardEventosSection from "@/components/artist/dashboard/EventosSection";
import DashboardAnalyticsSection from "@/components/artist/dashboard/AnalyticsSection";
import DashboardDeleteConfirmModal from "@/components/artist/dashboard/DeleteConfirmModal";
import DashboardEditEventModal from "@/components/artist/dashboard/EditEventModal";
import { CreateEventModal } from "@/app/events/CreateEventModal";
import artistService from "@/services/artistService";
import { fetchCommunities } from "@/services/communityService";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  Music,
  Calendar,
  Settings,
  Play,
  Star,
  Video,
  Home,
  MapPin,
} from "lucide-react";

import type { Artist as DBArtist } from "@/models/artist";
import type { Track } from "@/models/track";
import { getArtistTracks, getArtistSingles } from "@/services/trackService";
import type { Video as VideoModel } from "@/models/video";
import type { Community as CommunityModel } from "@/models/community";
import type { Event as EventModel } from "@/models/event";
import { createEvent } from "@/services/eventService";
import uploadService from "@/services/uploadService";

// 🎬 MODEL PARA UI DE VÍDEOS NA DASHBOARD
interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  status: "publicado" | "rascunho" | "agendado";
  duration: string; // formato mm:ss
}

// Helper para converter modelo de banco (VideoModel) em VideoData de UI
const toVideoData = (video: VideoModel): VideoData => {
  const minutes = Math.floor(video.duration / 60);
  const seconds = video.duration % 60;
  return {
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnail_url ?? "/placeholder-video.jpg",
    views: video.views,
    likes: video.likes,
    comments: 0, // TODO: integrar comentários reais
    status: "publicado",
    duration: `${minutes}:${seconds.toString().padStart(2, "0")}`,
  };
};

// 🔧 INTERFACES SIMPLIFICADAS E CORRIGIDAS (para mock apenas)
interface DashboardArtist {
  id: string;
  nome: string;
  avatar: string;
  verificado: boolean;
  total_seguidores: number;
  total_streams: number;
  receita_mensal: number;
}

// Extensão do artista vindo da API para incluir stats opcionais
type FullArtist = DBArtist & {
  subscribers?: number;
  verified?: boolean;
};

// 🔧 REMOVIDO 'upload' das seções (não precisa mais)
type DashboardSection =
  | "overview"
  | "musicas"
  | "videos"
  | "comunidades"
  | "eventos"
  | "analytics"
  | "configuracoes";

// 🎵 DASHBOARD ARTISTA EIMUSIC - VERSÃO CORRIGIDA
export default function ArtistDashboard() {
  const { user } = useAuth();
  const [artist, setArtist] = useState<FullArtist | null>(null);
  // 🔧 ESTADOS ESSENCIAIS (SEM UPLOAD)
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [loading, setLoading] = useState(true);
  // ⚙️ Salvar estados de loading para upload de avatar etc.
  const [saving, setSaving] = useState(false);
  const [artistName, setArtistName] = useState<string>("");
  const [artistBio, setArtistBio] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const MOZ_PROVINCES = [
    "Cabo Delgado",
    "Gaza",
    "Inhambane",
    "Manica",
    "Maputo",
    "Maputo Cidade",
    "Nampula",
    "Niassa",
    "Sofala",
    "Tete",
    "Zambézia",
  ];
  // Fetch current artist data once we have the authenticated user
  useEffect(() => {
    const fetchArtist = async () => {
      if (!user?.id) return;
      try {
        const data = (await artistService.getArtistById(user.id)) as FullArtist;
        if (data) {
          setArtist(data);
          setArtistName(data.name || "");
          setArtistBio(data.bio || "");
          setProvince(data.province || "");
          setInstagram(
            data.social_links?.instagram || (data as any).instagram || ""
          );
          setTwitter(data.social_links?.twitter || (data as any).twitter || "");
          setWebsite(data.social_links?.website || (data as any).website || "");
          setPhone(data.phone || (data as any).phone || "");
        }
      } catch (err) {
        console.error("Erro ao carregar artista", err);
      }
    };
    fetchArtist();
  }, [user]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<
    Track | VideoModel | CommunityModel | EventModel | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 🔄 ESTADOS PARA O MODAL DE EDIÇÃO DE EVENTOS
  const [showEditEventModal, setShowEditEventModal] = useState<boolean>(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<EventModel | null>(null);
  const [videos, setVideos] = useState<VideoModel[]>([]); // will fetch later
  const [comunidades, setComunidades] = useState<CommunityModel[]>([]); // will fetch
  const [eventos, setEventos] = useState<EventModel[]>([]);

  // 📥 Carregar comunidades criadas pelo artista
  useEffect(() => {
    const loadCommunities = async () => {
      if (!user?.id) return;
      try {
        const all = await fetchCommunities();
        const mine = all.filter(
          (c) => c.artist_id === user.id || c.artist?.artist_id === user.id
        );
        setComunidades(mine);
      } catch (err) {
        console.error("Erro ao carregar comunidades", err);
      }
    };
    loadCommunities();
  }, [user]);

  // 👉 Centralized content selection handler
  const handleSelectContent = (content: any) => {
    setSelectedContent(content);
    if (content && "start_time" in content && "location" in content) {
      setEventToEdit(content as EventModel);
    }
  };

  // 👉 Confirm delete handler
  const handleDeleteConfirm = () => {
    if (!selectedContent) return;

    if ("duration" in selectedContent && !("video_url" in selectedContent)) {
      // Track
      setMusicas((prev) => prev.filter((m) => m.id !== selectedContent.id));
    } else if ("thumbnail" in selectedContent) {
      // Video
      setVideos((prev) => prev.filter((v) => v.id !== selectedContent.id));
    } else if ("members" in selectedContent) {
      // Community
      setComunidades((prev) => prev.filter((c) => c.id !== selectedContent.id));
    } else if (
      "start_time" in selectedContent &&
      "location" in selectedContent
    ) {
      // Event
      setEventos((prev) => prev.filter((e) => e.id !== selectedContent.id));
    }

    setShowDeleteConfirm(false);
    setSelectedContent(null);
  };

  // 👉 Create event handler
  const handleCreateEvent = async (formData: any) => {
    try {
      // 1. Upload da imagem (se existir)
      let uploadedImageUrl: string | undefined;
      if (formData.imagem) {
        try {
          const uploadRes = await uploadService.uploadImage(
            user?.id ?? "anon",
            formData.imagem,
            "cover",
            true
          );
          uploadedImageUrl = uploadRes.url;
        } catch (err) {
          console.error("Falha ao fazer upload da imagem do evento:", err);
        }
      }

      // 2. Construir input para Supabase
      const startIso = new Date(`${formData.data}T${formData.hora}:00`).toISOString();
      const input = {
        artist_id: user?.id ?? "",
        name: formData.titulo,
        event_type: formData.tipo,
        price: formData.preco_min ?? 0,
        description: formData.descricao,
        start_time: startIso,
        location: `${formData.venue_nome}, ${formData.venue_cidade}`,
        capacity: formData.capacidade ?? null,
        status: "agendado" as const,
        image_url: uploadedImageUrl,
      } as any;

      const created = await createEvent(input);
      setEventos((prev) => [...prev, created]);
      setShowCreateEventModal(false);
    } catch (err) {
      console.error("Erro ao criar evento", err);
    }
  };

  // 👉 Save / update event handler
  const handleSaveEvent = (eventData: any) => {
    // Converter dados do formulário para o modelo Event
    const eventToSave: EventModel = {
      id: eventData.id || Date.now().toString(),
      artist_id: eventData.artist_id,
      title: eventData.title,
      event_type: eventData.event_type,
      event_date: eventData.event_date,
      price_min: eventData.price_min,
      price_max: eventData.price_max,
      description: eventData.description,
      start_time: eventData.start_time,
      location: eventData.location,
      capacity: eventData.capacity,
      created_at: new Date().toISOString(),
      event_status: eventData.event_status || "agendado",
    };

    if (eventData.id) {
      // Atualizar evento existente
      setEventos((prev) =>
        prev.map((e) => (e.id === eventData.id ? eventToSave : e))
      );
    } else {
      // Criar novo evento
      setEventos((prev) => [...prev, eventToSave]);
    }

    setShowEditEventModal(false);
    setEventToEdit(null);
  };

  // 🎭 MOCK DATA ARTISTA
  const mockArtist: DashboardArtist = {
    id: "1",
    nome: "Zena Bakar",
    avatar: "/avatar.svg",
    verificado: true,
    total_seguidores: 12547,
    total_streams: 234891,
    receita_mensal: 2840,
  };

  // 🎵 MOCK DATA MÚSICAS
  const [musicas, setMusicas] = useState<Track[]>([]); // fetched from Supabase

  // Fetch tracks once artist is available
  useEffect(() => {
    if (!user?.id) return;
    const fetchTracksAndSingles = async () => {
      try {
        const [tracks, singles] = await Promise.all([
          getArtistTracks(user.id),
          getArtistSingles(user.id),
        ]);
        setMusicas([...tracks, ...singles]);
      } catch (err) {
        console.error("Erro ao carregar músicas e singles", err);
      }
    };
    fetchTracksAndSingles();
  }, [user]);

  // 🔄 LOADING RÁPIDO
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLoading(false);
    };
    loadData();
  }, []);

  // 🧭 NAVEGAÇÃO HORIZONTAL CORRIGIDA - ESPAÇAMENTO PERFEITO
  // 🔧 CORREÇÃO DO HEADER - SUBSTITUA A FUNÇÃO NavigationHeader PELA VERSÃO CORRIGIDA:

  const NavigationHeader = () => {
    const tabs = [
      { id: "overview", label: "Resumo", icon: Home },
      { id: "musicas", label: "Músicas", icon: Music },
      { id: "videos", label: "Vídeos", icon: Video },
      { id: "comunidades", label: "Comunidades", icon: Users },
      { id: "eventos", label: "Eventos", icon: Calendar },
      { id: "analytics", label: "Analytics", icon: BarChart3 },
      { id: "configuracoes", label: "Config", icon: Settings },
    ];

    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-4">
          {" "}
          {/* 🔧 Reduzido padding lateral */}
          <div className="flex items-center justify-between py-4 gap-6">
            {" "}
            {/* 🔧 Reduzido padding vertical e adicionado gap */}
            {/* 🎨 LOGO E PERFIL COM ESPAÇAMENTO CORRIGIDO */}
            <div className="flex items-center space-x-6 min-w-0">
              {" "}
              {/* 🔧 Reduzido espaçamento e adicionado min-w-0 */}
              {/* Logo EiMusic */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {" "}
                {/* 🔧 Reduzido espaçamento */}
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  {" "}
                  {/* 🔧 Logo menor */}
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">EiMusic</h1>
                  <p className="text-gray-400 text-xs">Dashboard</p>
                </div>
              </div>
              {/* Perfil do artista com espaçamento corrigido */}
              <div className="flex items-center space-x-3 bg-gray-700/30 rounded-lg px-3 py-2 flex-shrink-0">
                {" "}
                {/* 🔧 Reduzido padding */}
                <img
                  src={artist?.profile_image_url || mockArtist.avatar}
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    t.onerror = null;
                    t.src = "/avatar.svg";
                  }}
                  alt={artist?.name || mockArtist.nome}
                  className="w-8 h-8 rounded-full border-2 border-purple-400"
                />
                <div className="hidden lg:block">
                  {" "}
                  {/* 🔧 Só mostra em telas grandes */}
                  <div className="flex items-center space-x-1">
                    <span className="text-white font-medium text-sm">
                      {artist?.name || artistName || mockArtist.nome}
                    </span>
                    {((artist?.verified ?? false) || mockArtist.verificado) && (
                      <Star
                        className="w-3 h-3 text-blue-400"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {(
                      artist?.subscribers ?? mockArtist.total_seguidores
                    ).toLocaleString()}{" "}
                    seguidores
                  </p>
                </div>
              </div>
            </div>
            {/* 🧭 TABS DE NAVEGAÇÃO DESKTOP - MAIS COMPACTO */}
            <div className="hidden lg:flex items-center space-x-1 bg-gray-900/50 rounded-lg p-1 flex-shrink-0">
              {" "}
              {/* 🔧 Reduzido espaçamento e padding */}
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as DashboardSection)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                    /* 🔧 Reduzido padding */
                    activeSection === tab.id
                      ? "bg-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/60"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="font-medium text-sm whitespace-nowrap">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
            {/* 📊 STATS RÁPIDOS - CORRIGIDO PARA NÃO SAIR DA TELA */}
            <div className="hidden xl:flex items-center space-x-4 flex-shrink-0">
              {" "}
              {/* 🔧 Reduzido espaçamento e adicionado flex-shrink-0 */}
              <div className="text-center px-3 py-1 bg-gray-700/20 rounded-lg">
                {" "}
                {/* 🔧 Reduzido padding */}
                <p className="text-gray-400 text-xs font-medium">Streams</p>
                <p className="text-white font-bold text-sm">
                  {(mockArtist.total_streams / 1000).toFixed(0)}k
                </p>{" "}
                {/* 🔧 Texto menor */}
                <p className="text-green-400 text-xs">+12.5%</p>
              </div>
              <div className="text-center px-3 py-1 bg-gray-700/20 rounded-lg">
                <p className="text-gray-400 text-xs font-medium">Receita</p>
                <p className="text-green-400 font-bold text-sm">
                  {mockArtist.receita_mensal}
                </p>{" "}
                {/* 🔧 Removido MT para economizar espaço */}
                <p className="text-green-400 text-xs">+15.7%</p>
              </div>
            </div>
          </div>
          {/* 📱 TABS MÓVEIS - SEM ALTERAÇÕES */}
          <div className="lg:hidden flex overflow-x-auto pb-3 space-x-3 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as DashboardSection)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg whitespace-nowrap transition-all min-w-[80px] ${
                  activeSection === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 🔄 LOADING ELEGANTE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
            <Play className="w-10 h-10 text-white animate-ping" />
          </div>
          <h2 className="text-white font-bold text-2xl mb-4">EiMusic</h2>
          <p className="text-gray-400 text-lg">Carregando dashboard...</p>
          <div className="w-64 bg-gray-700 rounded-full h-2 mt-6 mx-auto">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // 🎨 LAYOUT PRINCIPAL FINAL
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* 🌟 EFEITOS DE BACKGROUND SUTIS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl"
        />
      </div>

      {/* 📱 LAYOUT RESPONSIVO */}
      <div className="relative z-10">
        {/* 🧭 NAVEGAÇÃO HORIZONTAL */}
        <NavigationHeader />

        {/* 📄 CONTEÚDO PRINCIPAL */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            {activeSection === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardOverviewSection
                  mockArtist={mockArtist}
                  musicas={musicas}
                  videos={videos.map(toVideoData)}
                  eventos={eventos}
                  setActiveSection={(section: string) =>
                    setActiveSection(section as DashboardSection)
                  }
                />
              </motion.div>
            )}
            {activeSection === "musicas" && (
              <motion.div
                key="musicas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardMusicasSection
                  musicas={musicas}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setSelectedContent={handleSelectContent}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              </motion.div>
            )}
            {activeSection === "videos" && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardVideosSection
                  videos={videos.map(toVideoData)}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setSelectedContent={handleSelectContent}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              </motion.div>
            )}
            {activeSection === "comunidades" && (
              <motion.div
                key="comunidades"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardComunidadesSection
                  comunidades={comunidades}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setSelectedContent={handleSelectContent}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              </motion.div>
            )}
            {activeSection === "eventos" && (
              <motion.div
                key="eventos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardEventosSection
                  eventos={eventos}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  setSelectedContent={handleSelectContent}
                  setShowEditModal={setShowEditEventModal}
                  setShowCreateModal={setShowCreateEventModal}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              </motion.div>
            )}
            {activeSection === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <DashboardAnalyticsSection />
              </motion.div>
            )}
            {activeSection === "configuracoes" && (
              <motion.div
                key="configuracoes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ArtistConfigSection
                  userId={user?.id}
                  artist={artist}
                  provinces={MOZ_PROVINCES}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 🎭 MODAIS */}
      {/* Modal criação de evento */}
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSubmit={handleCreateEvent}
      />

      <DashboardDeleteConfirmModal
        show={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        content={selectedContent}
      />
      <DashboardEditEventModal
        show={showEditEventModal}
        onClose={() => {
          setShowEditEventModal(false);
          setEventToEdit(null);
        }}
        onSave={handleSaveEvent}
        event={eventToEdit}
        artistId={user?.id || ""}
      />

      {/* 📱 FOOTER MÓVEL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-xl border-t border-gray-700 p-4">
        <div className="text-center">
          <p className="text-white font-semibold">EiMusic Dashboard</p>
          <p className="text-gray-400 text-sm">
            Desenvolvido para artistas moçambicanos 🇲🇿
          </p>
        </div>
      </div>
    </div>
  );
}
