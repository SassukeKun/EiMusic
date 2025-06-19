'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  FaUpload, 
  FaImage, 
  FaTimes, 
  FaVideo, 
  FaInfoCircle,
  FaGlobe, 
  FaLock, 
  FaUsers, 
  FaCloudUploadAlt,
  FaArrowLeft,
  FaPlay,
  FaCheck,
  FaExclamationTriangle,
  FaChevronDown,
  FaPlus
} from 'react-icons/fa'
import FileUploader from '@/components/upload/FileUploader'
import uploadService from '@/services/uploadService' 

/**
 * BOA PRÁTICA: Definir tipos TypeScript explícitos
 * - Melhora a documentação do código
 * - Previne erros em tempo de compilação
 * - Facilita refatoração e manutenção
 */

// Interface para os metadados do vídeo
interface VideoMetadata {
  title: string;
  description?: string;
  genre?: string;
  tags: string[];
  visibility: 'public' | 'private' | 'followers';
  isVideoClip: boolean;
  director?: string;
  featuredArtists: string[];
}

// Union type para os estados do upload - mais type-safe que strings soltas
type UploadStep = 'selection' | 'details' | 'uploading' | 'success' | 'error';

export default function VideoUploadPage() {
  const { isArtist, loading, user } = useAuth();
  const [uploadStep, setUploadStep] = useState<UploadStep>('selection');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Estado do formulário com valores padrão bem definidos
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    title: '',
    description: '',
    genre: '',
    tags: [],
    visibility: 'public',
    isVideoClip: true,
    director: '',
    featuredArtists: []
  });
  
  // Estados auxiliares para inputs temporários
  const [tagInput, setTagInput] = useState<string>('');
  const [artistInput, setArtistInput] = useState<string>('');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup function para prevenir memory leaks
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [videoPreview, thumbnailPreview]);


 
  
  // Loading state com skeleton/spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificação de permissão com UI amigável
  if (!isArtist) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-xl">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">
            Esta página é exclusiva para artistas. Registre-se como artista para fazer upload de vídeos.
          </p>
          <Link 
            href="/artist/register" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
          >
            Registrar como Artista
          </Link>
        </div>
      </div>
    );
  }
  
  /**
   * BOA PRÁTICA: Separação de responsabilidades em funções
   * - Cada função tem uma responsabilidade específica
   * - Facilita testes unitários
   * - Melhora legibilidade e manutenção
   * - Reutilização de código
   */
  
  // Manipulador para seleção de vídeo
  const handleVideoSelect = (file: File) => {
    // Validação básica do arquivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido');
      return;
    }
    
    // Verificar tamanho (100MB máximo)
    if (file.size > 100 * 1024 * 1024) {
      setError('O arquivo deve ter menos de 100MB');
      return;
    }
    
    // Limpar erro anterior
    setError(null);
    
    // Definir arquivo
    setVideoFile(file);
    
    // Criar preview do vídeo (Object URL)
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
    
    // Extrair título do nome do arquivo se não existir
    if (!videoMetadata.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setVideoMetadata(prev => ({ ...prev, title: nameWithoutExt }));
    }
    
    // Avançar para a próxima etapa
    setUploadStep('details');
    
    /**
     * BOA PRÁTICA: Cleanup de Object URLs
     * - Previne memory leaks
     * - Object URLs consomem memória até serem liberados
     */
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Manipulador para seleção de thumbnail
  const handleThumbnailSelect = (file: File) => {
    // Validação de tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida para o thumbnail');
      return;
    }
    
    // Verificar tamanho (5MB máximo para imagens)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter menos de 5MB');
      return;
    }
    
    setError(null);
    setThumbnailFile(file);
    
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Limpar thumbnail selecionado
  const handleClearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
  };
  
  /**
   * BOA PRÁTICA: Validação robusta de entrada
   * - Verificar dados antes de processar
   * - Prevenir duplicatas
   * - Respeitar limites (máximo 5 tags)
   * - Sanitização básica (trim)
   */
  
  // Função para adicionar tag com validações
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    
    // Validações em cascata - early return pattern
    if (!trimmedTag) {
      setError('Digite uma tag válida');
      return;
    }
    
    if (videoMetadata.tags.length >= 5) {
      setError('Máximo de 5 tags permitidas');
      return;
    }
    
    if (videoMetadata.tags.includes(trimmedTag)) {
      setError('Esta tag já foi adicionada');
      return;
    }
    
    // Validação de comprimento
    if (trimmedTag.length > 20) {
      setError('Tags devem ter no máximo 20 caracteres');
      return;
    }
    
    setError(null);
    setVideoMetadata(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setTagInput('');
  };
  
  // Função para remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    setVideoMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Função para adicionar artista em destaque
  const handleAddFeaturedArtist = () => {
    const trimmedArtist = artistInput.trim();
    
    if (!trimmedArtist) {
      setError('Digite o nome do artista');
      return;
    }
    
    if (videoMetadata.featuredArtists.includes(trimmedArtist)) {
      setError('Este artista já foi adicionado');
      return;
    }
    
    if (trimmedArtist.length > 50) {
      setError('Nome do artista deve ter no máximo 50 caracteres');
      return;
    }
    
    setError(null);
    setVideoMetadata(prev => ({
      ...prev,
      featuredArtists: [...prev.featuredArtists, trimmedArtist]
    }));
    setArtistInput('');
  };
  
  // Função para remover artista em destaque
  const handleRemoveFeaturedArtist = (artistToRemove: string) => {
    setVideoMetadata(prev => ({
      ...prev,
      featuredArtists: prev.featuredArtists.filter(artist => artist !== artistToRemove)
    }));
  };
  
  /**
   * BOA PRÁTICA: Funções de navegação centralizadas
   * - Controle centralizado do fluxo
   * - Facilita debugging
   * - Consistência no comportamento
   */
  
  // Voltar para seleção de arquivo
  const handleBackToSelection = () => {
    setUploadStep('selection');
    setError(null);
  };
  
  // Resetar completamente o formulário
  const handleReset = () => {
    // Cleanup de Object URLs para prevenir memory leaks
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    
    // Reset de todos os estados
    setVideoFile(null);
    setVideoPreview(null);
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setVideoMetadata({
      title: '',
      description: '',
      genre: '',
      tags: [],
      visibility: 'public',
      isVideoClip: true,
      director: '',
      featuredArtists: []
    });
    setTagInput('');
    setArtistInput('');
    setUploadProgress(0);
    setError(null);
    setUploadStep('selection');
  };
  
  /**
   * BOA PRÁTICA: Validação antes de submissão
   * - Verificar todos os campos obrigatórios
   * - Dar feedback específico sobre o que está faltando
   * - Prevenir submissões inválidas
   */
  
  // Função de validação do formulário
  const validateForm = (): boolean => {
    if (!videoFile) {
      setError('Por favor, selecione um arquivo de vídeo');
      return false;
    }
    
    if (!videoMetadata.title.trim()) {
      setError('Por favor, adicione um título para o vídeo');
      return false;
    }
    
    if (videoMetadata.title.trim().length < 3) {
      setError('O título deve ter pelo menos 3 caracteres');
      return false;
    }
    
    if (videoMetadata.title.trim().length > 100) {
      setError('O título deve ter no máximo 100 caracteres');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  // Função de submissão real usando uploadService
  const handleSubmitUpload = async () => {
    if (!validateForm()) return;

    setUploadStep('uploading');
    setUploadProgress(0);

    try {
      const artistId = user?.id || '';
      const artistName = (user as any)?.user_metadata?.name || artistId;
      await uploadService.uploadVideo(
        artistId,
        artistName,
        videoFile!,
        {
          title: videoMetadata.title,
          isVideoClip: videoMetadata.isVideoClip,
          genre: videoMetadata.genre,
          tags: videoMetadata.tags,
          visibility: videoMetadata.visibility,
          description: videoMetadata.description,
          director: videoMetadata.director,
        },
        thumbnailFile ?? undefined
      );

      setUploadProgress(100);
      setUploadStep('success');
    } catch (err: any) {
      console.error('Erro ao fazer upload de vídeo:', err);
      setError('Falha ao enviar vídeo. Tente novamente.');
      setUploadStep('error');
    }
  };
  /**
   * BOA PRÁTICA: Componentes de renderização separados
   * - Cada tela tem sua própria função
   * - Facilita manutenção e debugging
   * - Melhora legibilidade do código principal
   * - Permite reutilização se necessário
   */
  
  // Renderizar tela de seleção de arquivo
  const renderSelectionStep = () => (
    <motion.div
      className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Upload de Vídeo</h1>
        <p className="text-gray-300">
          Faça upload do seu videoclipe
        </p>
      </div>
      
      {/* 
        BOA PRÁTICA: Reutilização de componentes
        - FileUploader é reutilizável para diferentes tipos de mídia
        - Props específicas para cada caso de uso
        - Configuração clara e explícita
      */}
      <FileUploader
        type="video"
        accept="video/*"
        maxSize={100} // 100MB para vídeos
        label="Selecionar Vídeo"
        onFileSelect={handleVideoSelect}
        className="mb-6"
      />
      
      {/* Informações adicionais para o usuário */}
      <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
          <FaInfoCircle className="mr-2 text-indigo-400" />
          Formatos Suportados
        </h3>
        <p className="text-xs text-gray-400">
          MP4, WebM, MOV, AVI • Máximo 100MB • Resolução recomendada: 1080p
        </p>
      </div>
      
      <div className="text-center">
        <Link 
          href="/upload" 
          className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center"
        >
          <FaArrowLeft className="mr-2" />
          Voltar para opções de upload
        </Link>
      </div>
    </motion.div>
  );
  
  // Renderizar formulário de detalhes
  const renderDetailsStep = () => (
    <motion.div
      className="max-w-5xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header com título e botão de fechar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Detalhes do Vídeo</h1>
        <button 
          onClick={handleReset}
          className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-700"
          title="Cancelar e recomeçar"
        >
          <FaTimes className="text-xl" />
        </button>
      </div>
      
      {/**
       * BOA PRÁTICA: Layout responsivo com CSS Grid
       * - Grid para desktop, stack para mobile
       * - Separação clara entre preview e formulário
       * - Aproveitamento eficiente do espaço
       */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA 1: Preview e Thumbnail */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Preview do vídeo */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaVideo className="mr-2 text-indigo-400" />
              Preview
            </h3>
            
            {videoPreview && (
              <div className="mb-4">
                <video 
                  src={videoPreview} 
                  controls 
                  className="w-full rounded-lg shadow-lg"
                  poster={thumbnailPreview || undefined}
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              </div>
            )}
            
            {/* Informações do arquivo */}
            <div className="text-sm text-gray-400 space-y-1">
              <p className="truncate">
                <span className="font-medium">Arquivo:</span> {videoFile?.name}
              </p>
              <p>
                <span className="font-medium">Tamanho:</span> {' '}
                {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}
              </p>
              <p>
                <span className="font-medium">Tipo:</span> {videoFile?.type}
              </p>
            </div>
          </div>
          
          {/* Seção de Thumbnail personalizado */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-md font-medium mb-3 flex items-center">
              <FaImage className="mr-2 text-indigo-400" />
              Thumbnail Personalizado
              <span className="ml-2 text-xs text-gray-500">(Opcional)</span>
            </h4>
            
            {!thumbnailFile ? (
              <FileUploader
                type="image"
                accept="image/*"
                maxSize={5}
                label="Adicionar Thumbnail"
                onFileSelect={handleThumbnailSelect}
              />
            ) : (
              <div className="space-y-3">
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <Image
                    src={thumbnailPreview!}
                    alt="Thumbnail"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                  />
                </div>
                <button
                  onClick={handleClearThumbnail}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                >
                  <FaTimes className="mr-2" />
                  Remover Thumbnail
                </button>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Recomendado: 1280x720px, formato JPG ou PNG
            </p>
          </div>
        </div>
        
        {/* COLUNA 2 e 3: Formulário de metadados */}
        <div className="lg:col-span-2">
          
          {/**
           * BOA PRÁTICA: Formulário semântico
           * - Uso correto de labels
           * - Campos required marcados visualmente
           * - Placeholders informativos
           * - Feedback visual nos estados (focus, error)
           */}
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmitUpload(); }}>
            
            {/* Campo Título - Obrigatório */}
            <div>
              <label htmlFor="video-title" className="block text-gray-300 mb-2 text-sm font-medium">
                Título do Vídeo
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="video-title"
                type="text"
                value={videoMetadata.title}
                onChange={(e) => setVideoMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-colors"
                placeholder="Digite um título atrativo para seu vídeo"
                maxLength={100}
                required
                autoComplete="off"
              />
              <p className="text-xs text-gray-500 mt-1">
                {videoMetadata.title.length}/100 caracteres
              </p>
            </div>
            
            {/* Campo Descrição */}
            <div>
              <label htmlFor="video-description" className="block text-gray-300 mb-2 text-sm font-medium">
                Descrição
              </label>
              <textarea
                id="video-description"
                value={videoMetadata.description}
                onChange={(e) => setVideoMetadata(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-colors min-h-[100px] resize-vertical"
                placeholder="Conte mais sobre seu vídeo, o conceito, a história por trás..."
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {videoMetadata.description?.length || 0}/500 caracteres
              </p>
            </div>
            
            {/* Grid para Gênero e Diretor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Campo Gênero */}
              <div>
                <label htmlFor="video-genre" className="block text-gray-300 mb-2 text-sm font-medium">
                  Gênero Musical
                </label>
                <div className="relative">
                  <select
                    id="video-genre"
                    value={videoMetadata.genre}
                    onChange={(e) => setVideoMetadata(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-colors cursor-pointer"
                  >
                    <option value="">Selecione um gênero</option>
                    <option value="afrobeat">Afrobeat</option>
                    <option value="hip-hop">Hip Hop</option>
                    <option value="r-b">R&B</option>
                    <option value="kizomba">Kizomba</option>
                    <option value="afro-house">Afro House</option>
                    <option value="pop">Pop</option>
                    <option value="dancehall">Dancehall</option>
                    <option value="reggae">Reggae</option>
                    <option value="amapiano">Amapiano</option>
                    <option value="rap">Rap</option>
                    <option value="outros">Outros</option>
                  </select>
                  <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {/* Campo Diretor */}
              <div>
                <label htmlFor="video-director" className="block text-gray-300 mb-2 text-sm font-medium">
                  Diretor
                </label>
                <input
                  id="video-director"
                  type="text"
                  value={videoMetadata.director}
                  onChange={(e) => setVideoMetadata(prev => ({ ...prev, director: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-colors"
                  placeholder="Nome do diretor do vídeo"
                  maxLength={50}
                  autoComplete="off"
                />
              </div>
            </div>
            
            {/* Checkbox para Videoclipe */}
            <div className="bg-gray-700/30 rounded-lg p-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={videoMetadata.isVideoClip}
                  onChange={(e) => setVideoMetadata(prev => ({ ...prev, isVideoClip: e.target.checked }))}
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 bg-gray-700 border-gray-600 mr-3"
                />
                <div>
                  <span className="text-gray-300 font-medium">Este é um videoclipe oficial</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Marque se este vídeo é o clipe oficial da música
                  </p>
                </div>
              </label>
            </div>

            {/* Seção de Visibilidade com Cards */}
            <div>
              <label className="block text-gray-300 mb-3 text-sm font-medium">
                Quem pode ver este vídeo?
              </label>
              
              {/**
               * BOA PRÁTICA: Interface de seleção visual
               * - Cards em vez de radio buttons tradicionais
               * - Visual claro do que cada opção significa
               * - Feedback visual imediato na seleção
               */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { 
                    value: 'public', 
                    icon: FaGlobe, 
                    label: 'Público', 
                    description: 'Qualquer pessoa pode ver',
                    color: 'text-green-400'
                  },
                  { 
                    value: 'followers', 
                    icon: FaUsers, 
                    label: 'Seguidores', 
                    description: 'Apenas seus seguidores',
                    color: 'text-blue-400'
                  },
                  { 
                    value: 'private', 
                    icon: FaLock, 
                    label: 'Privado', 
                    description: 'Apenas você pode ver',
                    color: 'text-yellow-400'
                  }
                ].map(({ value, icon: Icon, label, description, color }) => (
                  <label
                    key={value}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 ${
                      videoMetadata.visibility === value
                        ? 'border-indigo-500 bg-indigo-900/30 shadow-lg'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={value}
                      checked={videoMetadata.visibility === value}
                      onChange={(e) => setVideoMetadata(prev => ({ 
                        ...prev, 
                        visibility: e.target.value as 'public' | 'private' | 'followers'
                      }))}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <Icon className={`text-xl ${videoMetadata.visibility === value ? 'text-indigo-400' : color}`} />
                      <div className="flex-1">
                        <div className="font-medium text-white">{label}</div>
                        <div className="text-xs text-gray-400">{description}</div>
                      </div>
                    </div>
                    {videoMetadata.visibility === value && (
                      <motion.div 
                        className="absolute top-2 right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FaCheck className="text-indigo-400" />
                      </motion.div>
                    )}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Seção de Tags */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Tags
                <span className="text-gray-500 ml-2">(máximo 5)</span>
              </label>
              
              {/**
               * BOA PRÁTICA: Input com botão integrado
               * - UX clara: botão próximo ao input
               * - Validação visual: botão disabled quando inválido
               * - Múltiplas formas de adicionar: Enter ou botão
               */}
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-colors"
                  placeholder="Ex: videoclipe, estreia, novo single..."
                  maxLength={20}
                  disabled={videoMetadata.tags.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || videoMetadata.tags.length >= 5}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                >
                  <FaPlus className="mr-1" />
                  Adicionar
                </button>
              </div>
              
              {/* Lista de tags adicionadas */}
              {videoMetadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  <AnimatePresence>
                    {videoMetadata.tags.map((tag) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-900/50 border border-indigo-700 text-indigo-200"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-indigo-300 hover:text-white transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Tags ajudam as pessoas a encontrarem seu vídeo
              </p>
            </div>
            
            {/* Seção de Artistas em Destaque */}
            <div>
              <label className="block text-gray-300 mb-2 text-sm font-medium">
                Artistas em Destaque
                <span className="text-gray-500 ml-2">(opcional)</span>
              </label>
              
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeaturedArtist();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-colors"
                  placeholder="Nome do artista colaborador..."
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={handleAddFeaturedArtist}
                  disabled={!artistInput.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                >
                  <FaPlus className="mr-1" />
                  Adicionar
                </button>
              </div>
              
              {/* Lista de artistas em destaque */}
              {videoMetadata.featuredArtists.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {videoMetadata.featuredArtists.map((artist) => (
                      <motion.span
                        key={artist}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900/50 border border-purple-700 text-purple-200"
                      >
                        🎤 {artist}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeaturedArtist(artist)}
                          className="ml-2 text-purple-300 hover:text-white transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Exibir erro se houver */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center"
          >
            <FaExclamationTriangle className="text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Botões de ação */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={handleBackToSelection}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center order-2 sm:order-1"
        >
          <FaArrowLeft className="mr-2" />
          Voltar
        </button>
        
        <button
          onClick={handleSubmitUpload}
          disabled={!videoMetadata.title.trim()}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center font-semibold order-1 sm:order-2"
        >
          <FaCloudUploadAlt className="mr-2" />
          Publicar Vídeo
        </button>
      </div>
    </motion.div>
  );
  
  /**
   * BOA PRÁTICA: Telas de feedback com animações
   * - Feedback visual claro para o usuário
   * - Animações suaves para melhor UX
   * - Informações relevantes durante o processo
   */
  
  // Renderizar tela de upload em progresso
  const renderUploadingStep = () => (
    <motion.div
      className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Enviando seu Vídeo</h1>
        
        {/* Ícone animado */}
        <div className="flex justify-center mb-8">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaCloudUploadAlt className="text-6xl text-indigo-400" />
          </motion.div>
        </div>
        
        {/* Informações do vídeo */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-white mb-2">{videoMetadata.title}</h3>
          <div className="text-sm text-gray-400 space-y-1">
            <p>📁 {videoFile?.name}</p>
            <p>📊 {videoFile ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : ''}</p>
            {videoMetadata.genre && <p>🎵 {videoMetadata.genre}</p>}
            {videoMetadata.tags.length > 0 && (
              <p>🏷️ {videoMetadata.tags.join(', ')}</p>
            )}
          </div>
        </div>
        
        <p className="text-gray-300 mb-2">
          Processando e enviando seu conteúdo...
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Isso pode levar alguns minutos. Por favor, não feche esta janela.
        </p>
        
        {/* Barra de progresso avançada */}
        <div className="w-full bg-gray-700 rounded-full h-6 mb-4 overflow-hidden relative">
          <motion.div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-6 rounded-full flex items-center justify-end pr-2"
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <span className="text-white text-xs font-bold">
              {Math.round(uploadProgress)}%
            </span>
          </motion.div>
          
          {/* Efeito de brilho */}
          <motion.div
            className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-80, 320] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        {/* Fases do upload */}
        <div className="flex justify-between text-xs text-gray-400 mb-6">
          <span className={uploadProgress >= 20 ? 'text-indigo-400' : ''}>
            Preparando...
          </span>
          <span className={uploadProgress >= 50 ? 'text-indigo-400' : ''}>
            Enviando...
          </span>
          <span className={uploadProgress >= 80 ? 'text-indigo-400' : ''}>
            Processando...
          </span>
          <span className={uploadProgress >= 100 ? 'text-indigo-400' : ''}>
            Concluído!
          </span>
        </div>
        
        <p className="text-xs text-gray-500">
          ⚡ Upload seguro e criptografado
        </p>
      </div>
    </motion.div>
  );
  
  // Renderizar tela de sucesso
  const renderSuccessStep = () => (
    <motion.div
      className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        {/* Ícone de sucesso animado */}
        <motion.div 
          className="flex justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2,
            type: "spring",
            stiffness: 200
          }}
        >
          <div className="bg-green-500/20 p-6 rounded-full">
            <FaCheck className="text-4xl text-green-400" />
          </div>
        </motion.div>
        
        <motion.h1 
          className="text-3xl font-bold text-green-400 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          🎉 Upload Concluído!
        </motion.h1>
        
        {/* Card com preview do vídeo enviado */}
        <motion.div
          className="bg-gray-700/50 rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-4">
            {thumbnailPreview ? (
              <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={thumbnailPreview}
                  alt="Thumbnail"
                  width={96}
                  height={64}
                  style={{ objectFit: 'cover' }}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="w-24 h-16 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaVideo className="text-gray-400 text-xl" />
              </div>
            )}
            
            <div className="text-left flex-1">
              <h3 className="font-bold text-white text-lg">{videoMetadata.title}</h3>
              <p className="text-gray-400 text-sm">
                {videoMetadata.isVideoClip ? 'Videoclipe Oficial' : 'Vídeo'} • {videoMetadata.visibility}
              </p>
              {videoMetadata.genre && (
                <p className="text-indigo-400 text-sm">🎵 {videoMetadata.genre}</p>
              )}
            </div>
          </div>
        </motion.div>
        
        <motion.p 
          className="text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Seu vídeo foi enviado com sucesso e já está disponível na plataforma!
        </motion.p>
        
        {/* Botões de ação */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Link
            href={`/video/mock-id`} // Será substituído pelo ID real
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <FaPlay className="mr-2" />
            Ver Vídeo
          </Link>
          
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Enviar Outro Vídeo
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
  
  // Renderizar tela de erro
  const renderErrorStep = () => (
    <motion.div
      className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-500/20 p-6 rounded-full">
            <FaExclamationTriangle className="text-4xl text-red-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-red-400 mb-4">Erro no Upload</h1>
        
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 mb-8">
          <p className="text-red-200">
            {error || "Ocorreu um erro inesperado ao enviar seu vídeo. Por favor, tente novamente."}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setUploadStep('details')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
          
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Recomeçar
          </button>
        </div>
      </div>
    </motion.div>
  );

  
  
  /**
   * BOA PRÁTICA: Render principal com switch/case
   * - Controle de fluxo claro e explícito
   * - Fácil adição de novas etapas
   * - Cada caso bem definido
   * - Fallback para casos não previstos
   */

  // Função para renderizar o conteúdo baseado na etapa atual
  const renderCurrentStep = () => {
    switch (uploadStep) {
      case 'selection':
        return renderSelectionStep();
      case 'details':
        return renderDetailsStep();
      case 'uploading':
        return renderUploadingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        // Fallback case - sempre bom ter
        console.warn(`Estado de upload não reconhecido: ${uploadStep}`);
        return renderSelectionStep();
    }
  };

  /**
   * BOA PRÁTICA: Estrutura de layout consistente
   * - Container wrapper para toda a página
   * - Padding responsivo
   * - Background consistente com o design system
   * - Classes Tailwind bem organizadas
   */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* 
        BOA PRÁTICA: Header fixo com informações contextuais
        - Usuario sempre sabe onde está no processo
        - Breadcrumb visual claro
        - Ações secundárias acessíveis
      */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Breadcrumb e título */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/upload"
                className="text-gray-400 hover:text-white transition-colors flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Upload
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-white font-medium">Vídeo</span>
            </div>
            
            {/* Indicador de progresso/etapa */}
            <div className="hidden md:flex items-center space-x-3">
              {[
                { step: 'selection', label: 'Arquivo', icon: FaVideo },
                { step: 'details', label: 'Detalhes', icon: FaInfoCircle },
                { step: 'uploading', label: 'Enviando', icon: FaCloudUploadAlt },
                { step: 'success', label: 'Sucesso', icon: FaCheck }
              ].map(({ step, label, icon: Icon }, index) => {
                const isActive = uploadStep === step;
                const isCompleted = ['selection', 'details', 'uploading'].indexOf(uploadStep) > index;
                const isAccessible = index === 0 || isCompleted || 
                  ['selection', 'details'].indexOf(uploadStep) >= index - 1;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                      isActive 
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                        : isCompleted
                          ? 'bg-green-600/30 text-green-300'
                          : isAccessible
                            ? 'bg-gray-700/50 text-gray-400'
                            : 'bg-gray-800/50 text-gray-600'
                    }`}>
                      <Icon className="text-xs" />
                      <span className="hidden lg:inline">{label}</span>
                    </div>
                    
                    {/* Conectores entre etapas */}
                    {index < 3 && (
                      <div className={`w-8 h-px mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Ações rápidas */}
            <div className="flex items-center space-x-2">
              {uploadStep !== 'selection' && uploadStep !== 'uploading' && (
                <button
                  onClick={handleReset}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Recomeçar processo"
                >
                  <FaTimes />
                </button>
              )}
              
              {/* Indicador de salvamento automático */}
              {uploadStep === 'details' && videoMetadata.title && (
                <div className="flex items-center text-xs text-green-400">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-green-400 rounded-full mr-2"
                  />
                  Progresso salvo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 
        BOA PRÁTICA: Container principal com padding responsivo
        - Espaçamento adequado em todas as telas
        - Máxima largura para legibilidade
        - Padding vertical para respirar
      */}
      <main className="px-4 py-8">
        {/* 
          BOA PRÁTICA: AnimatePresence para transições suaves
          - Transições entre etapas são fluidas
          - Melhora significativamente a percepção de performance
          - UX mais profissional e polida
        */}
        <AnimatePresence mode="wait">
          <motion.div
            key={uploadStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
          >
            {renderCurrentStep()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 
        BOA PRÁTICA: Footer informativo contextual
        - Informações relevantes para cada etapa
        - Links úteis e suporte
        - Não interfere com o fluxo principal
      */}
      {uploadStep !== 'uploading' && (
        <footer className="mt-12 border-t border-gray-700 bg-gray-900/50">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              
              {/* Dicas contextuais */}
              <div>
                <h3 className="font-medium text-white mb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-400" />
                  Dicas para seu vídeo
                </h3>
                <ul className="text-gray-400 space-y-1">
                  <li>• Use títulos chamativos e descritivos</li>
                  <li>• Adicione tags relevantes para descoberta</li>
                  <li>• Thumbnails personalizados aumentam visualizações</li>
                  <li>• Resolução mínima recomendada: 720p</li>
                </ul>
              </div>
              
              {/* Formatos suportados */}
              <div>
                <h3 className="font-medium text-white mb-2">Formatos suportados</h3>
                <div className="text-gray-400 space-y-1">
                  <p><strong>Vídeo:</strong> MP4, WebM, MOV, AVI</p>
                  <p><strong>Tamanho:</strong> Até 100MB</p>
                  <p><strong>Duração:</strong> Até 10 minutos</p>
                  <p><strong>Thumbnail:</strong> JPG, PNG (até 5MB)</p>
                </div>
              </div>
              
              {/* Links úteis */}
              <div>
                <h3 className="font-medium text-white mb-2">Precisa de ajuda?</h3>
                <div className="space-y-2">
                  <Link 
                    href="/help/video-upload" 
                    className="text-indigo-400 hover:text-indigo-300 transition-colors block"
                  >
                    📖 Guia de upload de vídeos
                  </Link>
                  <Link 
                    href="/help/best-practices" 
                    className="text-indigo-400 hover:text-indigo-300 transition-colors block"
                  >
                    ⭐ Melhores práticas
                  </Link>
                  <Link 
                    href="/support" 
                    className="text-indigo-400 hover:text-indigo-300 transition-colors block"
                  >
                    💬 Suporte técnico
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Copyright e informações legais */}
            <div className="mt-6 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
              <p>
                Ao fazer upload, você concorda com nossos{' '}
                <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
                  Política de Privacidade
                </Link>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

