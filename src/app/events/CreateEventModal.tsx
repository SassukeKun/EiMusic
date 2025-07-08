'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react'
import { createEvent } from '@/services/eventService'
import uploadService from '@/services/uploadService'
import { useAuth } from '@/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Calendar,
  Clock,
  MapPin,
  Users,
  Music,
  Mic,
  Disc,
  Heart,
  Globe,
  Crown,
  Gem,
  Save,
  AlertCircle,
  Tag
} from 'lucide-react'

// Interface para dados do evento - Boa prática de tipagem forte
interface EventFormData {
  titulo: string
  descricao: string
  tipo: 'show' | 'lancamento' | 'tour' | 'visita' | 'colaboracao'
  data: string
  hora: string
  venue_nome: string
  venue_cidade: string
  venue_tipo: 'teatro' | 'hotel' | 'centro_cultural' | 'festival' | 'online'
  capacidade?: number
  preco_min?: number
  preco_max?: number
  plano_necessario: 'free' | 'premium' | 'vip'
  is_exclusive: boolean
  link_externo?: string
  imagem: File | null
  tags: string[]
}

// Interface para props do modal
interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EventFormData) => Promise<void>
}

// Componente do Modal de Criação de Evento
export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // Estados para gerenciamento do formulário
  const [formData, setFormData] = useState<EventFormData>({
    titulo: '',
    descricao: '',
    tipo: 'show',
    data: '',
    hora: '',
    venue_nome: '',
    venue_cidade: '',
    venue_tipo: 'centro_cultural',
    capacidade: undefined,
    preco_min: undefined,
    preco_max: undefined,
    plano_necessario: 'free',
    is_exclusive: false,
    link_externo: '',
    imagem: null,
    tags: []
  })
  
  // Estados de controle de UI
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  
  // Referências para elementos DOM
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Tipos de eventos disponíveis - Mock data moçambicano
  const tiposEvento = [
    { value: 'show', label: '🎵 Show', icon: Music, description: 'Concertos e apresentações ao vivo' },
    { value: 'lancamento', label: '💿 Lançamento', icon: Disc, description: 'Estreia de álbuns, singles e videoclipes' },
    { value: 'tour', label: '🎤 Tour', icon: Mic, description: 'Tournês e séries de shows' },
    { value: 'visita', label: '👥 Visita', icon: Users, description: 'Meet & greet e sessões com fãs' },
    { value: 'colaboracao', label: '❤️ Colaboração', icon: Heart, description: 'Projetos colaborativos especiais' }
  ]
  
  // Tipos de venues moçambicanos
  const tiposVenue = [
    { value: 'centro_cultural', label: '🏛️ Centro Cultural' },
    { value: 'teatro', label: '🎭 Teatro' },
    { value: 'hotel', label: '🏨 Hotel' },
    { value: 'festival', label: '🎪 Festival' },
    { value: 'online', label: '💻 Online' }
  ]
  
  // Cidades moçambicanas
  const cidadesMocambicanas = [
    'Maputo', 'Beira', 'Nampula', 'Inhambane', 'Tete', 
    'Quelimane', 'Pemba', 'Lichinga', 'Xai-Xai', 'Chimoio'
  ]
  
  // Opções de planos
  const planosOptions = [
    {
      value: 'free' as const,
      label: 'Gratuito',
      description: 'Evento público para todos',
      icon: Globe,
      color: 'text-green-400'
    },
    {
      value: 'premium' as const,
      label: 'Premium',
      description: 'Apenas para membros Premium',
      icon: Crown,
      color: 'text-yellow-400'
    },
    {
      value: 'vip' as const,
      label: 'VIP',
      description: 'Exclusivo para membros VIP',
      icon: Gem,
      color: 'text-purple-400'
    }
  ]

  // Função para validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validação do título (obrigatório, mínimo 5 caracteres)
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título do evento é obrigatório'
    } else if (formData.titulo.trim().length < 5) {
      newErrors.titulo = 'Título deve ter pelo menos 5 caracteres'
    }
    
    // Validação da descrição (obrigatório, mínimo 20 caracteres)
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    } else if (formData.descricao.trim().length < 20) {
      newErrors.descricao = 'Descrição deve ter pelo menos 20 caracteres'
    }
    
    // Validação da data (obrigatório, deve ser futura)
    if (!formData.data) {
      newErrors.data = 'Data do evento é obrigatória'
    } else {
      const eventDate = new Date(formData.data)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        newErrors.data = 'Data deve ser hoje ou no futuro'
      }
    }
    
    // Validação da hora (obrigatório)
    if (!formData.hora) {
      newErrors.hora = 'Hora do evento é obrigatória'
    }
    
    // Validação do venue (obrigatório)
    if (!formData.venue_nome.trim()) {
      newErrors.venue_nome = 'Nome do local é obrigatório'
    }
    
    if (!formData.venue_cidade) {
      newErrors.venue_cidade = 'Cidade é obrigatória'
    }
    
    // Validação de preços (se definidos, min deve ser <= max)
    if (formData.preco_min && formData.preco_max && formData.preco_min > formData.preco_max) {
      newErrors.preco_max = 'Preço máximo deve ser maior que o mínimo'
    }
    
    // Validação de capacidade (deve ser positiva se definida)
    if (formData.capacidade && formData.capacidade <= 0) {
      newErrors.capacidade = 'Capacidade deve ser um número positivo'
    }
    
    // Validação de link externo (deve ser URL válida se preenchida)
    if (formData.link_externo && formData.link_externo.trim()) {
      try {
        new URL(formData.link_externo)
      } catch {
        newErrors.link_externo = 'Link deve ser uma URL válida'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handler para upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validação do arquivo
      if (file.size > 5 * 1024 * 1024) { // 5MB máximo
        setErrors(prev => ({ ...prev, imagem: 'Imagem deve ter menos de 5MB' }))
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imagem: 'Arquivo deve ser uma imagem' }))
        return
      }
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Atualizar form data
      setFormData(prev => ({ ...prev, imagem: file }))
      
      // Limpar erro de imagem se existir
      setErrors(prev => {
        const { imagem, ...rest } = prev
        return rest
      })
    }
  }

  // Handler para adicionar tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 8) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  // Handler para remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Handler para mudança do plano (atualiza is_exclusive automaticamente)
  const handlePlanoChange = (plano: 'free' | 'premium' | 'vip') => {
    setFormData(prev => ({
      ...prev,
      plano_necessario: plano,
      is_exclusive: plano !== 'free'
    }))
  }

  // Handler para submissão do formulário
  const { user, isArtist } = useAuth();

  // Handler para submissão do formulário
  const handleSubmit = async () => {
    // Somente artistas podem criar eventos
    if (!isArtist) {
      setErrors({ submit: 'Somente artistas podem criar eventos.' })
      return
    }
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      // 1️⃣ Upload da imagem do evento se existir
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
        }
      }

      // 2️⃣ Construir payload para o serviço
      const startIso = new Date(`${formData.data}T${formData.hora}:00`).toISOString();
      const payload = {
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
      } as const;

      // 3️⃣ Inserir no banco via EventService
      const created = await createEvent(payload as any);
      console.log('Evento criado:', created);

      // 4️⃣ Callback opcional para pagina pai
      await onSubmit(formData)
      // Reset form após sucesso
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'show',
        data: '',
        hora: '',
        venue_nome: '',
        venue_cidade: '',
        venue_tipo: 'centro_cultural',
        capacidade: undefined,
        preco_min: undefined,
        preco_max: undefined,
        plano_necessario: 'free',
        is_exclusive: false,
        link_externo: '',
        imagem: null,
        tags: []
      })
      setImagePreview(null)
      setTagInput('')
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Erro ao criar evento:', error)
      setErrors({ submit: 'Erro ao criar evento. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handler para fechar modal
  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // Handler para tecla ESC
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !isLoading) {
      onClose()
    }
  }

  // Função para obter data mínima (hoje)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
              onKeyDown={handleKeyDown}
              tabIndex={-1}
            >
              {/* Card principal com gradiente */}
              <div className="bg-gradient-to-br from-gray-800/95 via-purple-900/30 to-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700 shadow-2xl">
                
                {/* Header do modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Criar Novo Evento
                    </h2>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    disabled={isLoading}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </motion.button>
                </div>

                {/* Conteúdo do formulário */}
                <div className="p-6 space-y-6">
                  
                  {/* Upload de imagem */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Imagem do Evento
                    </label>
                    
                    <div className="flex items-center space-x-4">
                      {/* Preview da imagem */}
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-24 h-24 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-red-500 transition-colors duration-200"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-white" />
                          )}
                        </motion.div>
                        
                        {imagePreview && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => {
                              setImagePreview(null)
                              setFormData(prev => ({ ...prev, imagem: null }))
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4 text-white" />
                          </motion.button>
                        )}
                      </div>
                      
                      {/* Botão de upload */}
                      <div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Escolher Imagem</span>
                        </motion.button>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG até 5MB (400x300 recomendado)
                        </p>
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {errors.imagem && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center space-x-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.imagem}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Grid de 2 colunas para desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Coluna Esquerda - Informações Básicas */}
                    <div className="space-y-6">
                      
                      {/* Título do evento */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Título do Evento *
                        </label>
                        <input
                          type="text"
                          value={formData.titulo}
                          onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                          placeholder="Ex: Noite de Marrabenta Moderna"
                          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.titulo 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                          }`}
                        />
                        {errors.titulo && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm flex items-center space-x-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.titulo}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Tipo de evento */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Tipo de Evento *
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {tiposEvento.map((tipo) => {
                            const Icon = tipo.icon
                            return (
                              <motion.button
                                key={tipo.value}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.value as any }))}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between text-left ${
                                  formData.tipo === tipo.value
                                    ? 'border-red-500 bg-red-500/20'
                                    : 'border-gray-600 hover:border-red-500/50 bg-gray-800/30'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <Icon className="w-5 h-5 text-red-400" />
                                  <div>
                                    <p className="text-white font-medium">{tipo.label}</p>
                                    <p className="text-gray-400 text-sm">{tipo.description}</p>
                                  </div>
                                </div>
                                
                                {formData.tipo === tipo.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                                  >
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.1 }}
                                      className="w-2 h-2 bg-white rounded-full"
                                    />
                                  </motion.div>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Data e hora */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Data do Evento *
                          </label>
                          <input
                            type="date"
                            value={formData.data}
                            min={getMinDate()}
                            onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                              errors.data 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                            }`}
                          />
                          {errors.data && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-400 text-sm flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.data}</span>
                            </motion.p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-300">
                            Hora *
                          </label>
                          <input
                            type="time"
                            value={formData.hora}
                            onChange={(e) => setFormData(prev => ({ ...prev, hora: e.target.value }))}
                            className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                              errors.hora 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                            }`}
                          />
                          {errors.hora && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-red-400 text-sm flex items-center space-x-1"
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>{errors.hora}</span>
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Coluna Direita - Local e Detalhes */}
                    <div className="space-y-6">
                      
                      {/* Local do evento */}
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-300">
                          Local do Evento *
                        </label>
                        
                        {/* Nome do venue */}
                        <input
                          type="text"
                          value={formData.venue_nome}
                          onChange={(e) => setFormData(prev => ({ ...prev, venue_nome: e.target.value }))}
                          placeholder="Ex: Centro Cultural Franco-Moçambicano"
                          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.venue_nome 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                          }`}
                        />
                        {errors.venue_nome && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm flex items-center space-x-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.venue_nome}</span>
                          </motion.p>
                        )}

                        {/* Cidade e tipo de venue */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <select
                              value={formData.venue_cidade}
                              onChange={(e) => setFormData(prev => ({ ...prev, venue_cidade: e.target.value }))}
                              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                                errors.venue_cidade 
                                  ? 'border-red-500 focus:ring-red-500' 
                                  : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                              }`}
                            >
                              <option value="">Selecionar cidade</option>
                              {cidadesMocambicanas.map(cidade => (
                                <option key={cidade} value={cidade}>{cidade}</option>
                              ))}
                            </select>
                            {errors.venue_cidade && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm flex items-center space-x-1 mt-1"
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>{errors.venue_cidade}</span>
                              </motion.p>
                            )}
                          </div>

                          <div>
                            <select
                              value={formData.venue_tipo}
                              onChange={(e) => setFormData(prev => ({ ...prev, venue_tipo: e.target.value as any }))}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-500/50 transition-all duration-200"
                            >
                              {tiposVenue.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Capacidade */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Capacidade (opcional)
                        </label>
                        <input
                          type="number"
                          value={formData.capacidade || ''}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            capacidade: e.target.value ? parseInt(e.target.value) : undefined 
                          }))}
                          placeholder="Ex: 500"
                          min="1"
                          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.capacidade 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                          }`}
                        />
                        {errors.capacidade && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm flex items-center space-x-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.capacidade}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Preços */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Preços (MT) - Deixe vazio se gratuito
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <input
                              type="number"
                              value={formData.preco_min || ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                preco_min: e.target.value ? parseFloat(e.target.value) : undefined 
                              }))}
                              placeholder="Preço mínimo"
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-500/50 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={formData.preco_max || ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                preco_max: e.target.value ? parseFloat(e.target.value) : undefined 
                              }))}
                              placeholder="Preço máximo"
                              min="0"
                              step="0.01"
                              className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                                errors.preco_max 
                                  ? 'border-red-500 focus:ring-red-500' 
                                  : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                              }`}
                            />
                          </div>
                        </div>
                        {errors.preco_max && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm flex items-center space-x-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.preco_max}</span>
                          </motion.p>
                        )}
                      </div>

                      {/* Link externo */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Link para Ingressos (opcional)
                        </label>
                        <input
                          type="url"
                          value={formData.link_externo || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, link_externo: e.target.value }))}
                          placeholder="https://eventbrite.com/meu-evento"
                          className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                            errors.link_externo 
                              ? 'border-red-500 focus:ring-red-500' 
                              : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                          }`}
                        />
                        {errors.link_externo && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-400 text-sm flex items-center space-x-1"
                          >
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.link_externo}</span>
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seção de largura completa */}
                  
                  {/* Descrição */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Descrição do Evento *
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o evento, o que os participantes podem esperar, artistas envolvidos, etc..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                        errors.descricao 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:ring-red-500 hover:border-red-500/50'
                      }`}
                    />
                    {errors.descricao && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center space-x-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.descricao}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Nível de acesso */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Nível de Acesso
                    </label>
                    <div className="space-y-3">
                      {planosOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.01 }}
                            type="button"
                            onClick={() => handlePlanoChange(option.value)}
                            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                              formData.plano_necessario === option.value
                                ? 'border-red-500 bg-red-500/20'
                                : 'border-gray-600 hover:border-red-500/50 bg-gray-800/30'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-5 h-5 ${option.color}`} />
                              <div className="text-left">
                                <p className="text-white font-medium">{option.label}</p>
                                <p className="text-gray-400 text-sm">{option.description}</p>
                              </div>
                            </div>
                            
                            {formData.plano_necessario === option.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.1 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Tags do Evento (máximo 8)
                    </label>
                    
                    {/* Input para adicionar tags */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                        placeholder="Digite uma tag e pressione Enter (ex: AoVivo, Maputo, Jazz)"
                        className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 hover:border-red-500/50 transition-all duration-200"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || formData.tags.length >= 8}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
                      >
                        Adicionar
                      </motion.button>
                    </div>
                    
                    {/* Tags adicionadas */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.tags.map((tag, index) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center space-x-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg px-3 py-1"
                          >
                            <span className="text-white text-sm">#{tag}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveTag(tag)}
                              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {/* Contador de tags */}
                    <p className="text-xs text-gray-400">
                      {formData.tags.length}/8 tags adicionadas
                    </p>
                  </div>

                  {/* Resumo do evento (preview) */}
                  {formData.titulo && formData.data && formData.hora && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20 rounded-xl p-6"
                    >
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-red-400" />
                        <span>Preview do Evento</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Music className="w-4 h-4 text-red-400" />
                            <span className="font-medium">{formData.titulo}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span>{new Date(formData.data).toLocaleDateString('pt-MZ', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Clock className="w-4 h-4 text-green-400" />
                            <span>{formData.hora}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {formData.venue_nome && (
                            <div className="flex items-center space-x-2 text-gray-300">
                              <MapPin className="w-4 h-4 text-purple-400" />
                              <span>{formData.venue_nome}</span>
                            </div>
                          )}
                          
                          {formData.venue_cidade && (
                            <div className="flex items-center space-x-2 text-gray-300">
                              <MapPin className="w-4 h-4 text-yellow-400" />
                              <span>{formData.venue_cidade}</span>
                            </div>
                          )}
                          
                          {(formData.preco_min || formData.preco_max) && (
                            <div className="flex items-center space-x-2 text-gray-300">
                              <Tag className="w-4 h-4 text-green-400" />
                              <span>
                                {formData.preco_min && formData.preco_max && formData.preco_min === formData.preco_max
                                  ? `${formData.preco_min} MT`
                                  : formData.preco_min && formData.preco_max
                                  ? `${formData.preco_min} - ${formData.preco_max} MT`
                                  : formData.preco_min
                                  ? `A partir de ${formData.preco_min} MT`
                                  : `Até ${formData.preco_max} MT`
                                }
                              </span>
                            </div>
                          )}
                          
                          {!formData.preco_min && !formData.preco_max && (
                            <div className="flex items-center space-x-2 text-green-400">
                              <Tag className="w-4 h-4" />
                              <span className="font-medium">Gratuito</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Badge do plano */}
                      <div className="mt-4 flex items-center space-x-2">
                        {formData.plano_necessario === 'premium' && (
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                            <Crown className="w-3 h-3" />
                            <span>PREMIUM</span>
                          </div>
                        )}
                        {formData.plano_necessario === 'vip' && (
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            <Gem className="w-3 h-3" />
                            <span>VIP</span>
                          </div>
                        )}
                        {formData.plano_necessario === 'free' && (
                          <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            <Globe className="w-3 h-3" />
                            <span>PÚBLICO</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Erro geral */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                    >
                      <p className="text-red-400 text-sm flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.submit}</span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Footer com botões */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-2 border border-gray-600 hover:border-gray-500 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancelar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Criando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Criar Evento</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

