'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Users,
  Music,
  Calendar,
  DollarSign,
  Settings,
  Upload,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  Heart,
  Plus,
  Search,
  X,
  TrendingUp,
  Bell,
  Star,
  Download,
  Clock,
  Video,
  Filter,
  MoreHorizontal,
  Home,
  Mic,
  Share2,
  Target,
  Zap,
  MapPin,
} from "lucide-react";

// 🔧 INTERFACES SIMPLIFICADAS E CORRIGIDAS
interface Artist {
  id: string;
  nome: string;
  avatar: string;
  verificado: boolean;
  total_seguidores: number;
  total_streams: number;
  receita_mensal: number;
}

interface Music {
  id: string;
  titulo: string;
  genero: string;
  duracao: string;
  capa: string;
  data_lancamento: string;
  status: "publicada" | "rascunho" | "agendada";
  streams: number;
  curtidas: number;
  receita_gerada: number;
}

interface VideoContent {
  id: string;
  titulo: string;
  thumbnail: string;
  duracao: string;
  data_lancamento: string;
  status: "publicada" | "rascunho";
  views: number;
  curtidas: number;
  tipo: "videoclipe" | "live" | "documentario";
}

interface Community {
  id: string;
  nome: string;
  membros: number;
  ativa: boolean;
  tipo: "publica" | "premium" | "vip";
  engajamento: number;
}

interface Event {
  id: string;
  titulo: string;
  data: string;
  local: string;
  status: "agendado" | "confirmado" | "realizado";
  participantes: number;
}

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
  // 🔧 ESTADOS ESSENCIAIS (SEM UPLOAD)
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContent, setSelectedContent] = useState<
    Music | VideoContent | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 🎭 MOCK DATA ARTISTA
  const mockArtist: Artist = {
    id: "1",
    nome: "Zena Bakar",
    avatar: "/api/placeholder/128/128",
    verificado: true,
    total_seguidores: 12547,
    total_streams: 234891,
    receita_mensal: 2840,
  };

  // 🎵 MOCK DATA MÚSICAS
  const [musicas, setMusicas] = useState<Music[]>([
    {
      id: "1",
      titulo: "Marrabenta do Futuro",
      genero: "Marrabenta",
      duracao: "3:45",
      capa: "/api/placeholder/300/300",
      data_lancamento: "2024-11-20T00:00:00Z",
      status: "publicada",
      streams: 45623,
      curtidas: 1247,
      receita_gerada: 456.23,
    },
    {
      id: "2",
      titulo: "Noites de Maputo",
      genero: "Afrobeats",
      duracao: "4:12",
      capa: "/api/placeholder/300/300",
      data_lancamento: "2024-10-15T00:00:00Z",
      status: "publicada",
      streams: 32189,
      curtidas: 892,
      receita_gerada: 321.89,
    },
  ]);

  // 🎬 MOCK DATA VÍDEOS
  const [videos, setVideos] = useState<VideoContent[]>([
    {
      id: "1",
      titulo: "Marrabenta do Futuro - Videoclipe",
      thumbnail: "/api/placeholder/300/200",
      duracao: "3:45",
      data_lancamento: "2024-11-20T00:00:00Z",
      status: "publicada",
      views: 25847,
      curtidas: 1532,
      tipo: "videoclipe",
    },
    {
      id: "2",
      titulo: "Live Session - Acústico",
      thumbnail: "/api/placeholder/300/200",
      duracao: "15:30",
      data_lancamento: "2024-12-01T00:00:00Z",
      status: "publicada",
      views: 8904,
      curtidas: 445,
      tipo: "live",
    },
  ]);

  // 👥 MOCK DATA COMUNIDADES
  const [comunidades, setComunidades] = useState<Community[]>([
    {
      id: "1",
      nome: "Fãs da Zena",
      membros: 3254,
      ativa: true,
      tipo: "publica",
      engajamento: 8.7,
    },
    {
      id: "2",
      nome: "VIP Members",
      membros: 145,
      ativa: true,
      tipo: "vip",
      engajamento: 9.2,
    },
    {
      id: "3",
      nome: "Marrabenta Lovers",
      membros: 856,
      ativa: false,
      tipo: "premium",
      engajamento: 6.1,
    },
  ]);

  // 📅 MOCK DATA EVENTOS
  const [eventos, setEventos] = useState<Event[]>([
    {
      id: "1",
      titulo: "Show Acústico",
      data: "2025-01-20T20:00:00Z",
      local: "Centro Cultural Franco-Moçambicano",
      status: "confirmado",
      participantes: 145,
    },
    {
      id: "2",
      titulo: "Lançamento EP",
      data: "2025-02-15T18:00:00Z",
      local: "Polana Serena Hotel",
      status: "agendado",
      participantes: 0,
    },
  ]);

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
                  src={mockArtist.avatar}
                  alt={mockArtist.nome}
                  className="w-8 h-8 rounded-full border-2 border-purple-400"
                />
                <div className="hidden lg:block">
                  {" "}
                  {/* 🔧 Só mostra em telas grandes */}
                  <div className="flex items-center space-x-1">
                    <span className="text-white font-medium text-sm">
                      {mockArtist.nome}
                    </span>
                    {mockArtist.verificado && (
                      <Star
                        className="w-3 h-3 text-blue-400"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">
                    {mockArtist.total_seguidores.toLocaleString()} seguidores
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
  // 📊 COMPONENTE STATSCARD MELHORADO
  const StatsCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-2xl font-bold text-white mb-1">{value}</p>
          {trend && (
            <p className="text-green-400 text-sm flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>{trend}</span>
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
          {" "}
          {/* 🔧 Ícone maior com sombra */}
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </motion.div>
  );
  // 🎯 SEÇÃO OVERVIEW - COM REDIRECIONAMENTOS CORRIGIDOS
  const OverviewSection = () => (
    <div className="space-y-8">
      {" "}
      {/* 🔧 Mais espaçamento entre seções */}
      {/* 📊 STATS PRINCIPAIS COM ESPAÇAMENTO MELHORADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {" "}
        {/* 🔧 Gap maior */}
        <StatsCard
          title="Total de Streams"
          value={mockArtist.total_streams.toLocaleString()}
          icon={Play}
          color="from-blue-500 to-purple-500"
          trend="+12.5%"
        />
        <StatsCard
          title="Seguidores"
          value={mockArtist.total_seguidores.toLocaleString()}
          icon={Users}
          color="from-green-500 to-blue-500"
          trend="+8.3%"
        />
        <StatsCard
          title="Receita Mensal"
          value={`${mockArtist.receita_mensal} MT`}
          icon={DollarSign}
          color="from-green-500 to-emerald-500"
          trend="+15.7%"
        />
        <StatsCard
          title="Conteúdos"
          value={musicas.length + videos.length}
          icon={Music}
          color="from-purple-500 to-pink-500"
        />
      </div>
      {/* 🚀 AÇÕES RÁPIDAS - REDIRECIONAMENTOS CORRIGIDOS */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
        {" "}
        {/* 🔧 Mais padding */}
        <h3 className="text-white font-semibold text-xl mb-6">
          Ações Rápidas
        </h3>{" "}
        {/* 🔧 Título maior */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {" "}
          {/* 🔧 Gap maior */}
          {/* 🔧 UPLOAD - REDIRECIONA PARA PÁGINA REAL */}
          <motion.button
            onClick={() => (window.location.href = "/upload")}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-xl transition-all flex items-center space-x-4 shadow-lg hover:shadow-xl"
          >
            <div className="p-3 bg-white/20 rounded-lg">
              {" "}
              {/* 🔧 Ícone com background */}
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-lg">Upload Conteúdo</p>{" "}
              {/* 🔧 Texto maior */}
              <p className="text-sm opacity-90">Música ou vídeo</p>
            </div>
          </motion.button>
          {/* CRIAR EVENTO */}
          <motion.button
            onClick={() => setActiveSection("eventos")}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-6 rounded-xl transition-all flex items-center space-x-4 shadow-lg hover:shadow-xl"
          >
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-lg">Criar Evento</p>
              <p className="text-sm opacity-90">Shows e lançamentos</p>
            </div>
          </motion.button>
          {/* GERIR COMUNIDADES */}
          <motion.button
            onClick={() => setActiveSection("comunidades")}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-xl transition-all flex items-center space-x-4 shadow-lg hover:shadow-xl"
          >
            <div className="p-3 bg-white/20 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-lg">Gerir Comunidades</p>
              <p className="text-sm opacity-90">Interação com fãs</p>
            </div>
          </motion.button>
        </div>
      </div>
      {/* 📈 RESUMO RÁPIDO COM ESPAÇAMENTO MELHORADO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {" "}
        {/* 🔧 Gap maior */}
        {/* 🎵 TOP MÚSICAS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
        >
          <h3 className="text-white font-semibold text-lg mb-6">Top Músicas</h3>{" "}
          {/* 🔧 Título maior */}
          <div className="space-y-4">
            {" "}
            {/* 🔧 Mais espaçamento */}
            {musicas.slice(0, 3).map((music, index) => (
              <motion.div
                key={music.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    /* 🔧 Ranking maior */
                    index === 0
                      ? "bg-yellow-500 text-black"
                      : index === 1
                      ? "bg-gray-400 text-black"
                      : "bg-orange-600 text-white"
                  }`}
                >
                  {index + 1}
                </div>
                <img
                  src={music.capa}
                  alt={music.titulo}
                  className="w-12 h-12 rounded-lg object-cover"
                />{" "}
                {/* 🔧 Imagem maior */}
                <div className="flex-1">
                  <p className="text-white font-medium">{music.titulo}</p>
                  <p className="text-gray-400 text-sm">
                    {music.streams.toLocaleString()} streams
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium text-sm">
                    +{music.receita_gerada.toFixed(0)} MT
                  </p>{" "}
                  {/* 🔧 Receita destacada */}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* 📅 PRÓXIMOS EVENTOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
        >
          <h3 className="text-white font-semibold text-lg mb-6">
            Próximos Eventos
          </h3>
          <div className="space-y-4">
            {eventos.slice(0, 2).map((evento) => (
              <motion.div
                key={evento.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
              >
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{evento.titulo}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(evento.data).toLocaleDateString("pt-MZ")} •{" "}
                    {evento.local}
                  </p>
                  <p className="text-yellow-400 text-xs mt-1">
                    {evento.participantes} participantes
                  </p>{" "}
                  {/* 🔧 Info adicional */}
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    /* 🔧 Badge melhorado */
                    evento.status === "confirmado"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {evento.status}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  // 🎵 SEÇÃO DE MÚSICAS COM REDIRECIONAMENTO CORRIGIDO
  const MusicasSection = () => {
    const filteredMusicas = musicas.filter((music) =>
      music.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-8">
        {" "}
        {/* 🔧 Mais espaçamento */}
        {/* 🔍 HEADER COM BUSCA E ESPAÇAMENTO MELHORADO */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {" "}
          {/* 🔧 Gap maior */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Gestão de Músicas
            </h2>{" "}
            {/* 🔧 Título maior */}
            <p className="text-gray-400 text-lg">
              Gere as tuas músicas e acompanha a performance
            </p>{" "}
            {/* 🔧 Descrição maior */}
          </div>
          <div className="flex items-center space-x-4">
            {" "}
            {/* 🔧 Mais espaçamento */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />{" "}
              {/* 🔧 Ícone maior */}
              <input
                type="text"
                placeholder="Buscar músicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
              />
            </div>
            {/* 🔧 BOTÃO NOVA MÚSICA - REDIRECIONA PARA PÁGINA REAL */}
            <button
              onClick={() => (window.location.href = "/upload")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nova Música</span>
            </button>
          </div>
        </div>
        {/* 📊 STATS DAS MÚSICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Músicas"
            value={musicas.length}
            icon={Music}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="Publicadas"
            value={musicas.filter((m) => m.status === "publicada").length}
            icon={Eye}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Total de Streams"
            value={musicas
              .reduce((acc, m) => acc + m.streams, 0)
              .toLocaleString()}
            icon={Play}
            color="from-blue-500 to-purple-500"
          />
          <StatsCard
            title="Receita Total"
            value={`${musicas
              .reduce((acc, m) => acc + m.receita_gerada, 0)
              .toFixed(0)} MT`}
            icon={DollarSign}
            color="from-green-500 to-blue-500"
          />
        </div>
        {/* 🎵 LISTA DE MÚSICAS COM ESPAÇAMENTO MELHORADO */}
        <div className="space-y-6">
          {" "}
          {/* 🔧 Mais espaçamento */}
          {filteredMusicas.length === 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-16 border border-gray-700 text-center">
              {" "}
              {/* 🔧 Mais padding */}
              <Music className="w-20 h-20 text-gray-600 mx-auto mb-6" />{" "}
              {/* 🔧 Ícone maior */}
              <h3 className="text-2xl font-semibold text-gray-400 mb-4">
                {searchTerm
                  ? "Nenhuma música encontrada"
                  : "Nenhuma música ainda"}
              </h3>
              <p className="text-gray-500 mb-8 text-lg">
                {searchTerm
                  ? "Tenta ajustar o termo de busca"
                  : "Comece fazendo upload da sua primeira música"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => (window.location.href = "/upload")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  Upload Primeira Música
                </button>
              )}
            </div>
          ) : (
            filteredMusicas.map((music, index) => (
              <motion.div
                key={music.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-6">
                  {" "}
                  {/* 🔧 Mais espaçamento */}
                  <img
                    src={music.capa}
                    alt={music.titulo}
                    className="w-20 h-20 rounded-xl object-cover shadow-lg"
                  />{" "}
                  {/* 🔧 Imagem maior */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-xl mb-2">
                      {music.titulo}
                    </h3>{" "}
                    {/* 🔧 Título maior */}
                    <p className="text-gray-400 mb-3">
                      {music.genero} • {music.duracao}
                    </p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      {" "}
                      {/* 🔧 Mais espaçamento */}
                      <span className="flex items-center space-x-2">
                        <Play className="w-4 h-4" />
                        <span>{music.streams.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Heart className="w-4 h-4" />
                        <span>{music.curtidas.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-2 text-green-400">
                        <DollarSign className="w-4 h-4" />
                        <span>{music.receita_gerada.toFixed(2)} MT</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {" "}
                    {/* 🔧 Mais espaçamento */}
                    <button className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 rounded-xl transition-all">
                      {" "}
                      {/* 🔧 Botões maiores */}
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedContent(music);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  // 🎬 SEÇÃO DE VÍDEOS COM REDIRECIONAMENTO CORRIGIDO
  const VideosSection = () => {
    const filteredVideos = videos.filter((video) =>
      video.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-8">
        {/* 🔍 HEADER COM BUSCA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Gestão de Vídeos
            </h2>
            <p className="text-gray-400 text-lg">
              Gere os teus videoclipes e conteúdo visual
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vídeos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
              />
            </div>
            {/* 🔧 BOTÃO NOVO VÍDEO - REDIRECIONA PARA PÁGINA REAL */}
            <button
              onClick={() => (window.location.href = "/upload")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Novo Vídeo</span>
            </button>
          </div>
        </div>

        {/* 📊 STATS DOS VÍDEOS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total de Vídeos"
            value={videos.length}
            icon={Video}
            color="from-red-500 to-pink-500"
          />
          <StatsCard
            title="Publicados"
            value={videos.filter((v) => v.status === "publicada").length}
            icon={Eye}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Total de Views"
            value={videos.reduce((acc, v) => acc + v.views, 0).toLocaleString()}
            icon={Play}
            color="from-blue-500 to-purple-500"
          />
          <StatsCard
            title="Curtidas Totais"
            value={videos
              .reduce((acc, v) => acc + v.curtidas, 0)
              .toLocaleString()}
            icon={Heart}
            color="from-pink-500 to-red-500"
          />
        </div>

        {/* 🎬 GRID DE VÍDEOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {" "}
          {/* 🔧 Gap maior */}
          {filteredVideos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button className="bg-white/90 text-black rounded-full p-4 shadow-lg hover:scale-110 transition-transform">
                    {" "}
                    {/* 🔧 Botão maior */}
                    <Play className="w-8 h-8" />
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {" "}
                  {/* 🔧 Badge melhorado */}
                  {video.duracao}
                </div>
                <div
                  className={`absolute top-3 left-3 px-3 py-1 rounded-lg text-sm font-medium ${
                    video.tipo === "videoclipe"
                      ? "bg-purple-500"
                      : video.tipo === "live"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  } text-white`}
                >
                  {video.tipo}
                </div>
              </div>
              <div className="p-6">
                {" "}
                {/* 🔧 Mais padding */}
                <h3 className="text-white font-semibold text-lg mb-3">
                  {video.titulo}
                </h3>{" "}
                {/* 🔧 Título maior */}
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  {" "}
                  {/* 🔧 Mais espaçamento */}
                  <span className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{video.views.toLocaleString()}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>{video.curtidas.toLocaleString()}</span>
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors">
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContent(video);
                      setShowDeleteConfirm(true);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };
  // 👥 SEÇÃO DE COMUNIDADES COM FILTROS MELHORADOS
  const ComunidadesSection = () => {
    const [filtroTipo, setFiltroTipo] = useState<
      "todas" | "publica" | "premium" | "vip"
    >("todas");
    const [filtroStatus, setFiltroStatus] = useState<
      "todas" | "ativa" | "inativa"
    >("todas");

    const filteredComunidades = comunidades.filter((com) => {
      const matchesTipo = filtroTipo === "todas" || com.tipo === filtroTipo;
      const matchesStatus =
        filtroStatus === "todas" ||
        (filtroStatus === "ativa" && com.ativa) ||
        (filtroStatus === "inativa" && !com.ativa);
      return matchesTipo && matchesStatus;
    });

    return (
      <div className="space-y-8">
        {/* 🔍 HEADER COM ESPAÇAMENTO MELHORADO */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Gestão de Comunidades
            </h2>
            <p className="text-gray-400 text-lg">
              Gere as tuas comunidades de fãs e acompanha o engajamento
            </p>
          </div>
          <button
            onClick={() => window.open("/comunidades/criar", "_blank")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Comunidade</span>
          </button>
        </div>

        {/* 🎛️ FILTROS COM ESPAÇAMENTO */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as any)}
            className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
          >
            <option value="todas">Todos os tipos</option>
            <option value="publica">🌍 Pública</option>
            <option value="premium">👑 Premium</option>
            <option value="vip">💎 VIP</option>
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
          >
            <option value="todas">Todos os status</option>
            <option value="ativa">✅ Ativa</option>
            <option value="inativa">⏸️ Inativa</option>
          </select>
        </div>

        {/* 📊 STATS DAS COMUNIDADES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Comunidades"
            value={comunidades.length}
            icon={Users}
            color="from-blue-500 to-purple-500"
          />
          <StatsCard
            title="Membros Totais"
            value={comunidades
              .reduce((acc, c) => acc + c.membros, 0)
              .toLocaleString()}
            icon={Heart}
            color="from-green-500 to-blue-500"
          />
          <StatsCard
            title="Comunidades Ativas"
            value={comunidades.filter((c) => c.ativa).length}
            icon={Zap}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Engajamento Médio"
            value={`${(
              comunidades.reduce((acc, c) => acc + c.engajamento, 0) /
              comunidades.length
            ).toFixed(1)}/10`}
            icon={Target}
            color="from-yellow-500 to-orange-500"
          />
        </div>

        {/* 👥 LISTA DE COMUNIDADES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredComunidades.map((comunidade, index) => (
            <motion.div
              key={comunidade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg">
                  {comunidade.nome}
                </h3>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    comunidade.ativa
                      ? "bg-green-500/20 text-green-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {comunidade.ativa ? "Ativa" : "Inativa"}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Membros</span>
                  <span className="text-white font-semibold text-lg">
                    {comunidade.membros.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Engajamento</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(comunidade.engajamento / 10) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-blue-400 font-medium text-sm">
                      {comunidade.engajamento}/10
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Tipo</span>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      comunidade.tipo === "publica"
                        ? "bg-blue-500/20 text-blue-400"
                        : comunidade.tipo === "premium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-purple-500/20 text-purple-400"
                    }`}
                  >
                    {comunidade.tipo}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Gerir
                </button>
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Estatísticas
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // 📅 SEÇÃO DE EVENTOS MELHORADA
  const EventosSection = () => (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Gestão de Eventos
          </h2>
          <p className="text-gray-400 text-lg">
            Organiza shows, lançamentos e encontros com os fãs
          </p>
        </div>
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Novo Evento</span>
        </button>
      </div>

      {/* 📊 STATS DOS EVENTOS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Eventos"
          value={eventos.length}
          icon={Calendar}
          color="from-yellow-500 to-orange-500"
        />
        <StatsCard
          title="Confirmados"
          value={eventos.filter((e) => e.status === "confirmado").length}
          icon={Star}
          color="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Participantes Totais"
          value={eventos.reduce((acc, e) => acc + e.participantes, 0)}
          icon={Users}
          color="from-blue-500 to-purple-500"
        />
        <StatsCard
          title="Próximos 30 dias"
          value={eventos.filter((e) => new Date(e.data) > new Date()).length}
          icon={Clock}
          color="from-purple-500 to-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventos.map((evento, index) => (
          <motion.div
            key={evento.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">
                {evento.titulo}
              </h3>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  evento.status === "confirmado"
                    ? "bg-green-500/20 text-green-400"
                    : evento.status === "agendado"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {evento.status}
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 text-base">
                  {new Date(evento.data).toLocaleDateString("pt-MZ", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 text-base">{evento.local}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300 text-base">
                  {evento.participantes} participantes
                </span>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium transition-colors">
                Editar
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                Promover
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // 📊 SEÇÃO DE ANALYTICS MELHORADA
  const AnalyticsSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Analytics Detalhados
        </h2>
        <p className="text-gray-400 text-lg">
          Análise completa da tua performance e audiência
        </p>
      </div>

      {/* 📈 STATS PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Streams (30 dias)"
          value="78,012"
          icon={Play}
          color="from-blue-500 to-purple-500"
          trend="+12.5%"
        />
        <StatsCard
          title="Novos Seguidores"
          value="1,247"
          icon={Users}
          color="from-green-500 to-blue-500"
          trend="+8.3%"
        />
        <StatsCard
          title="Engajamento"
          value="7.8%"
          icon={Heart}
          color="from-pink-500 to-red-500"
          trend="+2.1%"
        />
        <StatsCard
          title="Receita (mês)"
          value="2,840 MT"
          icon={DollarSign}
          color="from-green-500 to-emerald-500"
          trend="+15.7%"
        />
      </div>

      {/* 📊 GRÁFICOS E DEMOGRAFIA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
          <h3 className="text-white font-semibold text-xl mb-6">
            Crescimento de Audiência
          </h3>
          <div className="h-64 bg-gray-700/30 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Gráfico em desenvolvimento</p>
              <p className="text-gray-500 text-sm mt-2">
                Dados sendo processados...
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
          <h3 className="text-white font-semibold text-xl mb-6">
            Demografia dos Ouvintes
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Maputo</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
                <span className="text-white font-semibold min-w-[60px]">
                  45%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Beira</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: "22%" }}
                  ></div>
                </div>
                <span className="text-white font-semibold min-w-[60px]">
                  22%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Nampula</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full"
                    style={{ width: "15%" }}
                  ></div>
                </div>
                <span className="text-white font-semibold min-w-[60px]">
                  15%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Matola</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-yellow-500 h-3 rounded-full"
                    style={{ width: "12%" }}
                  ></div>
                </div>
                <span className="text-white font-semibold min-w-[60px]">
                  12%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-medium">Outras</span>
              <div className="flex items-center space-x-3">
                <div className="w-24 bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full"
                    style={{ width: "6%" }}
                  ></div>
                </div>
                <span className="text-white font-semibold min-w-[60px]">
                  6%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // ⚙️ SEÇÃO DE CONFIGURAÇÕES
  const ConfiguracoesSection = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Configurações</h2>
        <p className="text-gray-400 text-lg">
          Personaliza o teu perfil e preferências da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PERFIL */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
          <h3 className="text-white font-semibold text-xl mb-6">
            Informações do Perfil
          </h3>
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <img
                src={mockArtist.avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full border-2 border-purple-500"
              />
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
                Alterar Foto
              </button>
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-3">
                Nome do Artista
              </label>
              <input
                type="text"
                defaultValue={mockArtist.nome}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-3">
                Bio
              </label>
              <textarea
                rows={4}
                placeholder="Conta a tua história..."
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* PREFERÊNCIAS */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
          <h3 className="text-white font-semibold text-xl mb-6">
            Preferências
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-lg">
                  Notificações por email
                </h4>
                <p className="text-gray-400 text-sm">
                  Receber updates sobre a conta
                </p>
              </div>
              <button className="bg-purple-600 w-14 h-7 rounded-full relative transition-colors">
                <div className="bg-white w-5 h-5 rounded-full absolute top-1 right-1 transition-all"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-lg">
                  Perfil público
                </h4>
                <p className="text-gray-400 text-sm">
                  Permitir que outros te encontrem
                </p>
              </div>
              <button className="bg-purple-600 w-14 h-7 rounded-full relative transition-colors">
                <div className="bg-white w-5 h-5 rounded-full absolute top-1 right-1 transition-all"></div>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium text-lg">
                  Analytics detalhados
                </h4>
                <p className="text-gray-400 text-sm">
                  Dados avançados de audiência
                </p>
              </div>
              <button className="bg-gray-600 w-14 h-7 rounded-full relative transition-colors">
                <div className="bg-white w-5 h-5 rounded-full absolute top-1 left-1 transition-all"></div>
              </button>
            </div>
          </div>

          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl mt-8 font-medium transition-colors">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );

  // 🗑️ MODAL DE CONFIRMAÇÃO DE DELETE
  const DeleteConfirmModal = () => (
    <AnimatePresence>
      {showDeleteConfirm && selectedContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Eliminar Conteúdo
              </h3>
              <p className="text-gray-400 mb-8 text-lg">
                Tens a certeza que queres eliminar "{selectedContent.titulo}"?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedContent(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if ("genero" in selectedContent) {
                      setMusicas(
                        musicas.filter((m) => m.id !== selectedContent.id)
                      );
                    } else {
                      setVideos(
                        videos.filter((v) => v.id !== selectedContent.id)
                      );
                    }
                    setShowDeleteConfirm(false);
                    setSelectedContent(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // 🔄 LOADING ELEGANTE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-2xl">
            <Music className="w-10 h-10 text-white" />
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
                <OverviewSection />
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
                <MusicasSection />
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
                <VideosSection />
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
                <ComunidadesSection />
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
                <EventosSection />
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
                <AnalyticsSection />
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
                <ConfiguracoesSection />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* 🎭 MODAIS */}
      <DeleteConfirmModal />

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
