/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import { fetchEvents, createEvent } from '@/services/eventService';
import uploadService from '@/services/uploadService';
import { PlansModal } from "@/components/PlansModal";
import { CreateEventModal } from "./CreateEventModal";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseClient } from "@/utils/supabaseClient";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  ExternalLink,
  Bell,
  Search,
  Filter,
  Music,
  Mic,
  Disc,
  Heart,
  Lock,
  Crown,
  Gem,
  Flame,
  TrendingUp,
  Eye,
  Share2,
  ChevronDown,
  Tag,
} from "lucide-react";
// Tipos específicos para exibição no front-end – independentes do schema de banco
interface Artist {
  id: string;
  nome: string;
  avatar: string;
  verificado: boolean;
}

interface Venue {
  nome: string;
  cidade: string;
  capacidade?: number;
  tipo: "teatro" | "hotel" | "centro_cultural" | "festival" | "online";
}

interface UiEvent {
  id: string;
  titulo: string;
  artista: Artist;
  tipo: "show" | "lancamento" | "tour" | "visita" | "colaboracao";
  data: string;
  hora?: string;
  venue: Venue;
  descricao: string;
  preco_min?: number;
  preco_max?: number;
  status: "confirmado" | "esgotado" | "cancelado" | "em_breve";
  is_exclusive: boolean;
  plano_necessario: "free" | "premium" | "vip";
  imagem: string;
  link_externo?: string;
  tags: string[];
  participantes?: number;
  is_trending?: boolean;
}

// Interfaces TypeScript para tipagem forte

interface UserPlan {
  tipo: "free" | "premium" | "vip";
  ativo: boolean;
}

interface EventFormData {
  titulo: string;
  descricao: string;
  tipo: "show" | "lancamento" | "tour" | "visita" | "colaboracao";
  data: string;
  hora: string;
  venue_nome: string;
  venue_cidade: string;
  venue_tipo: "teatro" | "hotel" | "centro_cultural" | "festival" | "online";
  capacidade?: number;
  preco_min?: number;
  preco_max?: number;
  plano_necessario: "free" | "premium" | "vip";
  is_exclusive: boolean;
  link_externo?: string;
  imagem: File | null;
  tags: string[];
}

type FilterType =
  | "todos"
  | "show"
  | "lancamento"
  | "tour"
  | "visita"
  | "colaboracao";
type DateFilter = "todos" | "proximos" | "este_mes" | "este_ano" | "passados";

// Página de Eventos - EiMusic Platform
export default function EventsPage() {
  const { user, isArtist, isAuthenticated } = useAuth();
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);
  // Estados para gerenciamento de dados e UI
  const [events, setEvents] = useState<UiEvent[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan>({
    tipo: "free",
    ativo: true,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("todos");
  const [dateFilter, setDateFilter] = useState<DateFilter>("proximos");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Função para verificar acesso ao evento
  const hasAccessToEvent = (event: UiEvent): boolean => {
    if (!event.is_exclusive) return true;
    const planHierarchy = { free: 0, premium: 1, vip: 2 };
    return (
      planHierarchy[userPlan.tipo] >= planHierarchy[event.plano_necessario]
    );
  };

  // Função para obter badge do tipo de evento
  const getEventTypeBadge = (tipo: string) => {
    const badges = {
      show: { icon: Music, text: "Show", colors: "from-red-500 to-orange-500" },
      lancamento: {
        icon: Disc,
        text: "Lançamento",
        colors: "from-blue-500 to-purple-500",
      },
      tour: { icon: Mic, text: "Tour", colors: "from-green-500 to-yellow-500" },
      visita: {
        icon: Users,
        text: "Visita",
        colors: "from-pink-500 to-purple-500",
      },
      colaboracao: {
        icon: Heart,
        text: "Colaboração",
        colors: "from-purple-500 to-pink-500",
      },
    };

    const badge = badges[tipo as keyof typeof badges];
    if (!badge) return null;

    const IconComponent = badge.icon;

    return (
      <div
        className={`flex items-center space-x-1 bg-gradient-to-r ${badge.colors} text-white px-2 py-1 rounded-full text-xs font-bold`}
      >
        <IconComponent className="w-3 h-3" />
        <span>{badge.text}</span>
      </div>
    );
  };

  // Função para obter badge do plano necessário
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

  // Função para obter status do evento
  const getEventStatus = (status: string) => {
    const statusConfig = {
      confirmado: { text: "Confirmado", color: "text-green-400" },
      esgotado: { text: "Esgotado", color: "text-red-400" },
      cancelado: { text: "Cancelado", color: "text-gray-400" },
      em_breve: { text: "Em Breve", color: "text-yellow-400" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? (
      <span className={`text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    ) : null;
  };

  // Função para formatear data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("pt-MZ", { month: "short" }),
      year: date.getFullYear(),
      weekday: date.toLocaleDateString("pt-MZ", { weekday: "short" }),
    };
  };

  // Função para formatear preço
  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return "Gratuito";
    if (min === max) return `${min} MT`;
    if (!max) return `A partir de ${min} MT`;
    return `${min} - ${max} MT`;
  };



  // Carregar eventos a partir do Supabase
  useEffect(() => {
    // Fetch current user's subscription plan
    async function fetchUserPlan() {
      if (!user?.id) return; // no logged-in user yet
      try {
        // Busca info de assinatura do utilizador
        const { data: userRow, error: userErr } = await supabase
          .from('users')
          .select('has_active_subscription, subscription_plan_id')
          .eq('id', user.id)
          .maybeSingle();
        if (userErr && userErr.code !== 'PGRST116') throw userErr;

        if (userRow && userRow.has_active_subscription && userRow.subscription_plan_id) {
          // Obtém nome do plano
          const { data: planRow, error: planErr } = await supabase
            .from('monetization_plans')
            .select('name')
            .eq('id', userRow.subscription_plan_id)
            .maybeSingle();
          if (planErr) throw planErr;
          if (!planRow) {
            // Plano desconhecido, volta para FREE
            setUserPlan({ tipo: 'free', ativo: true });
            return;
          }

          const planName = (planRow?.name?.toLowerCase() ?? 'premium') as
            | 'premium'
            | 'vip';
          setUserPlan({ tipo: planName, ativo: true });
        } else {
          // Sem assinatura ativa
          setUserPlan({ tipo: 'free', ativo: true });
        }
      } catch (err) {
        console.error('Erro ao buscar plano do usuário:', err);
      }
    }
    fetchUserPlan();
  }, [user, supabase]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const data = await fetchEvents();
        // Transformar os dados retornados pelo Supabase para o formato esperado pelo UI
        const mapped: UiEvent[] = data.map((e: any) => {
          const startDate = new Date(e.start_time);
          const accessLevel = (e.access_level || 'publico') as 'publico' | 'premium' | 'vip';
          const requiredPlan: 'free' | 'premium' | 'vip' = accessLevel === 'publico' ? 'free' : accessLevel;
          return {
            id: e.id,
            titulo: e.title ?? e.name ?? '',
            artista: {
              id: e.artist_id,
              nome: e.artist_name ?? 'Artista',
              avatar: '/api/placeholder/64/64', // TODO: substituir quando tivermos avatar do artista
              verificado: true,
            },
            tipo: e.event_type,
            data: e.start_time,
            hora: startDate.toISOString().split('T')[1]?.substring(0, 5) ?? '',
            venue: {
              nome: e.location ?? 'Local a anunciar',
              cidade: e.location?.split(',').pop()?.trim() ?? '',
              tipo: 'centro_cultural',
            },
            descricao: e.description ?? '',
            preco_min: e.price_min ?? 0,
            preco_max: e.price_max ?? e.price_min ?? 0,
            status: e.event_status ?? 'agendado',
            is_exclusive: requiredPlan !== 'free',
            plano_necessario: requiredPlan,
            imagem: e.image_url ?? '/api/placeholder/400/300',
            tags: e.tags ?? [],
            participantes: e.participants ?? 0,
            is_trending: false,
            link_externo: undefined,
          };
        });
        setEvents(mapped);
      } catch (err) {
        console.error('Erro ao buscar eventos do Supabase:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Filtros aplicados
  const filteredEvents = events.filter((event) => {
    // Filtro de busca
    const matchesSearch =
      event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.artista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.cidade.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de tipo
    const matchesType = filterType === "todos" || event.tipo === filterType;

    // Filtro de data
    const eventDate = new Date(event.data);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let matchesDate = true;
    switch (dateFilter) {
      case "proximos":
        matchesDate = eventDate >= now;
        break;
      case "este_mes":
        matchesDate =
          eventDate >= startOfMonth &&
          eventDate <= new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "este_ano":
        matchesDate = eventDate >= startOfYear;
        break;
      case "passados":
        matchesDate = eventDate < now;
        break;
      default:
        matchesDate = true;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      // 1. Upload da imagem (se existir)
      let uploadedImageUrl: string | undefined;
      if (formData.imagem) {
        try {
          const uploadRes = await uploadService.uploadImage(
            user?.id ?? 'anon',
            formData.imagem,
            'cover',
            isArtist,
          );
          uploadedImageUrl = uploadRes.url;
        } catch (err) {
          console.error('Falha ao fazer upload da imagem do evento:', err);
          // Continua sem imagem
        }
      }

      // 2. Criar objeto de input para o Supabase
      const startIso = new Date(`${formData.data}T${formData.hora}:00`).toISOString();
      const input = {
        event_date: new Date(formData.data).toISOString(),
        access_level: formData.plano_necessario === 'free' ? 'publico' : formData.plano_necessario,
        artist_id: user?.id ?? '',
        title: formData.titulo,
        event_type: formData.tipo,
        price_min: formData.preco_min ?? 0,
        price_max: formData.preco_max ?? formData.preco_min ?? 0,
        description: formData.descricao,
        start_time: startIso,
        location: `${formData.venue_nome}, ${formData.venue_cidade}`,
        capacity: formData.capacidade ?? null,
        event_status: 'agendado' as const,
        image_url: uploadedImageUrl,
        tags: formData.tags,
        participants: formData.capacidade ?? 0,
        link_externo: formData.link_externo,
        is_exclusive: formData.is_exclusive,
        plano_necessario: formData.plano_necessario,
      } as any; // usar any para permitir image_url extra se tabela tiver essa coluna

      // 3. Inserir evento no Supabase
      const created = await createEvent(input);
      console.log('Evento criado:', created);

      // 4. Atualizar lista de eventos local (opcional: refetch)
      setEvents((prev) => [
        {
          id: created.id,
          titulo: created.title ?? created.name ?? '',
          artista: {
            id: created.artist_id,
            nome: user?.user_metadata?.name || 'Artista',
            avatar: '/api/placeholder/64/64',
            verificado: isArtist,
          },
          tipo: created.event_type,
          data: created.start_time,
          hora: formData.hora,
          venue: {
            nome: formData.venue_nome,
            cidade: formData.venue_cidade,
            capacidade: formData.capacidade,
            tipo: formData.venue_tipo,
          },
          descricao: created.description,
          preco_min: created.price_min,
          preco_max: created.price_max,
          status: created.event_status,
          is_exclusive: formData.is_exclusive,
          plano_necessario: formData.plano_necessario,
          imagem: uploadedImageUrl ?? '/api/placeholder/400/300',
          link_externo: formData.link_externo,
          tags: formData.tags.map((t) => `#${t}`),
          participantes: formData.capacidade ?? 0,
          is_trending: false,
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  };

  // Componente de Loading
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Componente do Card de Evento
  const EventCard = ({ event }: { event: UiEvent }) => {
    const [isReminded, setIsReminded] = useState(false);
    const hasAccess = hasAccessToEvent(event);
    const dateInfo = formatDate(event.data);
    const isUpcoming = new Date(event.data) > new Date();

    const handleReminder = () => {
      setIsReminded(!isReminded);
    };

    const handleExternalLink = () => {
      if (event.link_externo) {
        window.open(event.link_externo, "_blank");
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 group relative"
      >
        {/* Badge de trending */}
        {event.is_trending && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1 z-10">
            <Flame className="w-3 h-3" />
            <span>HOT</span>
          </div>
        )}

        {/* Imagem do evento */}
        <div className="relative overflow-hidden">
          <img
            src={event.imagem}
            alt={event.titulo}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Overlay com data */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg p-2 text-center">
            <div className="text-white font-bold text-lg">{dateInfo.day}</div>
            <div className="text-gray-300 text-xs uppercase">
              {dateInfo.month}
            </div>
          </div>

          {/* Status do evento */}
          <div className="absolute bottom-3 left-3">
            {getEventStatus(event.status)}
          </div>

          {/* Badge de acesso bloqueado */}
          {!hasAccess && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">
                  Evento Exclusivo
                </p>
                <p className="text-gray-300 text-xs">
                  {event.plano_necessario === "premium" ? "Premium" : "VIP"}{" "}
                  necessário
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Conteúdo do card */}
        <div className="p-6">
          {/* Header com badges */}
          <div className="flex items-center justify-between mb-3">
            {getEventTypeBadge(event.tipo)}
            {event.is_exclusive && getPlanBadge(event.plano_necessario)}
          </div>

          {/* Título */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
            {event.titulo}
          </h3>

          {/* Artista */}
          <div className="flex items-center space-x-2 mb-3">
            <img
              src={event.artista.avatar}
              alt={event.artista.nome}
              className="w-8 h-8 rounded-full border border-gray-600"
            />
            <span className="text-gray-300 font-medium">
              {event.artista.nome}
            </span>
            {event.artista.verificado && (
              <Star className="w-4 h-4 text-blue-400" fill="currentColor" />
            )}
          </div>

          {/* Detalhes do evento */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              <span>
                {event.venue.nome}, {event.venue.cidade}
              </span>
            </div>

            {event.hora && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{event.hora}</span>
              </div>
            )}

            {event.participantes && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Users className="w-4 h-4" />
                <span>{event.participantes} participantes</span>
              </div>
            )}

            {(event.preco_min || event.preco_max) && (
              <div className="flex items-center space-x-2 text-green-400 text-sm font-medium">
                <Tag className="w-4 h-4" />
                <span>{formatPrice(event.preco_min, event.preco_max)}</span>
              </div>
            )}
          </div>

          {/* Descrição */}
          {hasAccess && (
            <p className="text-gray-400 text-sm mb-4 line-clamp-2">
              {event.descricao}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Ações */}
          <div className="flex space-x-2">
            {hasAccess ? (
              <>
                {event.link_externo && isUpcoming && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExternalLink}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Ver Ingressos</span>
                  </motion.button>
                )}

                {isUpcoming && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReminder}
                    className={`p-2 rounded-lg transition-all ${
                      isReminded
                        ? "bg-yellow-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </motion.button>
                )}

                {!isUpcoming && (
                  <div className="flex-1 bg-gray-700 text-gray-300 py-2 px-4 rounded-lg font-medium text-center">
                    Evento Realizado
                  </div>
                )}
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpgradeModal(true)}
                className={`flex-1 font-medium py-2 px-4 rounded-lg transition-all ${
                  event.plano_necessario === "premium"
                    ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                    : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                } text-white`}
              >
                Upgrade para{" "}
                {event.plano_necessario === "premium" ? "Premium" : "VIP"}
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-all"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Contato VIP */}
          {userPlan.tipo === "vip" && event.artista.verificado && hasAccess && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
            >
              <Crown className="w-4 h-4" />
              <span>Contato Direto VIP</span>
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };

  const handleSelectPlan = (planType: "premium" | "vip") => {
    const planData = {
      premium: { price: 120, name: "Premium" },
      vip: { price: 250, name: "VIP" },
    };

    const plan = planData[planType];

    // Redirecionar para a página de pagamento com parâmetros
    router.push(
      `/payment?plan=${planType}&price=${plan.price}&name=${plan.name}`
    );

    // Fechar o modal
    setIsPlansModalOpen(false);
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
          onClick={() => setShowUpgradeModal(false)} // <- MUDANÇA: fecha o modal ao clicar fora
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Upgrade o teu Plano
              </h3>
              <p className="text-gray-400 mb-6">
                Acede a eventos exclusivos e benefícios especiais
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
                    <li>• Eventos exclusivos Premium</li>
                    <li>• Notificações antecipadas</li>
                    <li>• Meet & greet selecionados</li>
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
                    <li>• Contato direto com artistas</li>
                    <li>• Eventos exclusivos VIP</li>
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
                <button
                  onClick={() => setIsPlansModalOpen(true)} // <- MUDANÇA: abre o PlansModal
                  className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl transition-all"
                >
                  Escolher Plano
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-8">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Render da página principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white relative overflow-hidden">
      {/* Efeitos de background animados - MESMO DAS OUTRAS PÁGINAS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header da página */}
      <div className="border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl top-0 z-20 relative">
        {/* Linha de gradiente no topo */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            {/* Título e descrição */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-white via-red-200 to-orange-200 bg-clip-text text-transparent">
                  Eventos de Música
                </h1>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <Music className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </div>
              <p className="text-gray-300 text-lg max-w-2xl">
                🎪 Descobre shows, lançamentos e eventos dos teus artistas
                favoritos em Moçambique
              </p>

              {/* Estatísticas rápidas */}
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {
                      filteredEvents.filter(
                        (e) => new Date(e.data) > new Date()
                      ).length
                    }{" "}
                    eventos próximos
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {filteredEvents.filter((e) => e.is_trending).length} em alta
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-purple-400">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {filteredEvents.length} total
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Área de busca e filtros com efeitos visuais */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col space-y-4"
            >
              {/* Campo de busca com gradiente */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-400" />
                  <input
                    type="text"
                    placeholder="Buscar eventos, artistas, locais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-96 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Container para filtros e botão criar */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Botão de filtros */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center space-x-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-xl px-4 py-3 text-white hover:bg-gray-700/80 transition-all duration-300"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filtros</span>
                  <motion.div
                    animate={{ rotate: showFilters ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>

                {/* Botão Criar Evento - Apenas para artistas autenticados */}
                {isAuthenticated && isArtist && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-xl px-4 py-3 text-white font-bold transition-all duration-300 shadow-lg hover:shadow-red-500/25"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="hidden sm:inline">Criar Evento</span>
                    <span className="inline sm:hidden">Criar</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Área de filtros expansível */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-6"
              >
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Filtro por tipo */}
                    <div>
                      <label className="block text-white font-medium mb-3">
                        Tipo de Evento
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "todos", label: "🌟 Todos" },
                          { value: "show", label: "🎵 Shows" },
                          { value: "lancamento", label: "💿 Lançamentos" },
                          { value: "tour", label: "🎤 Tours" },
                          { value: "visita", label: "👥 Visitas" },
                          { value: "colaboracao", label: "❤️ Colaborações" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              setFilterType(option.value as FilterType)
                            }
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              filterType === option.value
                                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filtro por data */}
                    <div>
                      <label className="block text-white font-medium mb-3">
                        Período
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: "todos", label: "📅 Todos" },
                          { value: "proximos", label: "⏭️ Próximos" },
                          { value: "este_mes", label: "📆 Este Mês" },
                          { value: "este_ano", label: "🗓️ Este Ano" },
                          { value: "passados", label: "⏮️ Passados" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              setDateFilter(option.value as DateFilter)
                            }
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              dateFilter === option.value
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Indicador de plano atual */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-3 h-3 rounded-full bg-green-500`}
                ></div>
                {userPlan.tipo !== 'free' && (
                  <span className="text-white font-medium">
                    Plano {userPlan.tipo.toUpperCase()}
                  </span>
                )}
                <span className="text-gray-400 text-sm">
                  {userPlan.tipo === "free"
                    ? "Acesso a eventos públicos"
                    : userPlan.tipo === "premium"
                    ? "Acesso a eventos Premium + públicos"
                    : "Acesso total + contato direto"}
                  {userPlan.tipo === "free" && "Acesso a eventos públicos"}
                  {userPlan.tipo === "premium" &&
                    "Acesso a eventos Premium + públicos"}
                  {userPlan.tipo === "vip" && "Acesso total + contato direto"}
                </span>
              </div>

              {userPlan.tipo !== "vip" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUpgradeModal(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    userPlan.tipo === "free"
                      ? "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                      : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  } text-white`}
                >
                  Upgrade para {userPlan.tipo === "free" ? "Premium" : "VIP"}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Resultados */}
        <AnimatePresence mode="wait">
          {filteredEvents.length === 0 ? (
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
                  <Calendar className="w-24 h-24 text-gray-600 mx-auto mb-6" />
                </motion.div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Music className="w-8 h-8 text-red-400" />
                  </motion.div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text mb-3">
                Nenhum evento encontrado
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                🔍 Tenta ajustar os filtros ou buscar por outros termos
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("todos");
                  setDateFilter("proximos");
                }}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
              >
                Limpar Filtros
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Contador de resultados */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full"></div>
                  <p className="text-gray-300 text-lg">
                    <span className="font-bold text-white">
                      {filteredEvents.length}
                    </span>{" "}
                    {filteredEvents.length === 1
                      ? "evento encontrado"
                      : "eventos encontrados"}
                  </p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Disc className="w-5 h-5 text-yellow-400" />
                  </motion.div>
                </div>

                {/* Filtros ativos */}
                {(searchTerm ||
                  filterType !== "todos" ||
                  dateFilter !== "proximos") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <Filter className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-400">Filtros ativos</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Grid de eventos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>

              {/* Seção de eventos bloqueados para FREE */}
              {userPlan.tipo === "free" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: filteredEvents.length * 0.1 + 0.3 }}
                  className="mt-12"
                >
                  <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 rounded-2xl p-8 border border-yellow-500/20 text-center">
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

                    <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text mb-2">
                      Eventos Exclusivos Esperando por Ti!
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-md mx-auto">
                      Há eventos Premium e VIP que não podes ver. Upgrade e
                      acede a meet & greets, lançamentos exclusivos e muito
                      mais!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-white font-bold">Premium</p>
                        <p className="text-yellow-400 text-sm">120 MT/mês</p>
                      </div>
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <Gem className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                        <p className="text-white font-bold">VIP</p>
                        <p className="text-purple-400 text-sm">250 MT/mês</p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUpgradeModal(true)}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-yellow-500/25"
                    >
                      🎫 Ver Todos os Eventos
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Upgrade existente */}
      <UpgradeModal />
      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        onSelectPlan={handleSelectPlan}
        currentPlan={userPlan.tipo}
      />
      {/* Modal de Criação de Evento */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}
