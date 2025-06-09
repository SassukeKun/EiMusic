// src/hooks/useVideoUpload.ts
import React from 'react'
'use client'

import { useState, useCallback, useRef } from 'react'

// Tipos TypeScript para type safety
export interface VideoFile {
  file: File
  preview: string
  duration?: number
  size: string
}

export interface ThumbnailFile {
  file: File
  preview: string
}

export interface VideoMetadata {
  title: string
  description: string
  genre: string
  visibility: 'public' | 'private' | 'followers'
  isVideoClip: boolean
  director: string
  tags: string[]
}

export interface UploadState {
  step: 'initial' | 'details' | 'uploading' | 'success' | 'error'
  progress: number
  error: string | null
  isUploading: boolean
}

// Configurações de validação centralizadas
const VALIDATION_CONFIG = {
  video: {
    maxSize: 500 * 1024 * 1024, // 500MB
    acceptedTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
    acceptedExtensions: ['.mp4', '.mov', '.avi', '.webm']
  },
  thumbnail: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  metadata: {
    maxTags: 5,
    maxTitleLength: 100,
    maxDescriptionLength: 500
  }
}


export function useVideoUpload() {
  // Estados principais
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<ThumbnailFile | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    step: 'initial',
    progress: 0,
    error: null,
    isUploading: false
  })

  // Estado dos metadados com valores padrão
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    description: '',
    genre: '',
    visibility: 'public',
    isVideoClip: true,
    director: '',
    tags: []
  })

  // Estado para input de tag temporário
  const [tagInput, setTagInput] = useState('')

  // Refs para controles de input
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  /**
   * Função de validação de arquivo de vídeo
   * Boa prática: Validação detalhada com mensagens específicas
   */
  const validateVideoFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    // Verificar tamanho do arquivo
    if (file.size > VALIDATION_CONFIG.video.maxSize) {
      return {
        isValid: false,
        error: `O vídeo deve ter menos de ${VALIDATION_CONFIG.video.maxSize / (1024 * 1024)}MB`
      }
    }

    // Verificar tipo MIME
    if (!VALIDATION_CONFIG.video.acceptedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Formato não suportado. Use: ${VALIDATION_CONFIG.video.acceptedExtensions.join(', ')}`
      }
    }

    // Verificar extensão do arquivo como validação adicional
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!VALIDATION_CONFIG.video.acceptedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Extensão de arquivo não suportada: ${fileExtension}`
      }
    }

    return { isValid: true }
  }, [])

  /**
   * Função de validação de thumbnail
   */
  const validateThumbnailFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (file.size > VALIDATION_CONFIG.thumbnail.maxSize) {
      return {
        isValid: false,
        error: `A imagem deve ter menos de ${VALIDATION_CONFIG.thumbnail.maxSize / (1024 * 1024)}MB`
      }
    }

    if (!VALIDATION_CONFIG.thumbnail.acceptedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Formato de imagem não suportado. Use: ${VALIDATION_CONFIG.thumbnail.acceptedExtensions.join(', ')}`
      }
    }

    return { isValid: true }
  }, [])

  /**
   * Formatar tamanho do arquivo para exibição
   * Boa prática: Função utilitária reutilizável
   */
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }, [])

  /**
   * Handler para seleção de arquivo de vídeo
   * Boa prática: Cleanup automático de recursos
   */
  const handleVideoSelect = useCallback((file: File) => {
    const validation = validateVideoFile(file)
    
    if (!validation.isValid) {
      setUploadState(prev => ({ ...prev, error: validation.error! }))
      return
    }

    // Cleanup da URL anterior se existir
    if (videoFile?.preview) {
      URL.revokeObjectURL(videoFile.preview)
    }

    // Criar nova URL de preview
    const preview = URL.createObjectURL(file)
    
    // Extrair título do nome do arquivo se não houver título
    if (!metadata.title.trim()) {
      const titleFromFileName = file.name.replace(/\.[^/.]+$/, "")
      setMetadata(prev => ({ ...prev, title: titleFromFileName }))
    }

    setVideoFile({
      file,
      preview,
      size: formatFileSize(file.size)
    })

    // Limpar erro anterior e avançar para próximo step
    setUploadState(prev => ({ 
      ...prev, 
      error: null, 
      step: 'details' 
    }))
  }, [videoFile?.preview, validateVideoFile, formatFileSize, metadata.title])

  /**
   * Handler para seleção de thumbnail
   */
  const handleThumbnailSelect = useCallback((file: File) => {
    const validation = validateThumbnailFile(file)
    
    if (!validation.isValid) {
      setUploadState(prev => ({ ...prev, error: validation.error! }))
      return
    }

    // Cleanup da URL anterior se existir
    if (thumbnailFile?.preview) {
      URL.revokeObjectURL(thumbnailFile.preview)
    }

    const preview = URL.createObjectURL(file)
    
    setThumbnailFile({ file, preview })
    setUploadState(prev => ({ ...prev, error: null }))
  }, [thumbnailFile?.preview, validateThumbnailFile])

  /**
   * Limpar arquivo de vídeo
   */
  const clearVideoFile = useCallback(() => {
    if (videoFile?.preview) {
      URL.revokeObjectURL(videoFile.preview)
    }
    setVideoFile(null)
    setUploadState(prev => ({ ...prev, step: 'initial', error: null }))
    
    // Reset do input
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }, [videoFile?.preview])

  /**
   * Limpar thumbnail
   */
  const clearThumbnailFile = useCallback(() => {
    if (thumbnailFile?.preview) {
      URL.revokeObjectURL(thumbnailFile.preview)
    }
    setThumbnailFile(null)
    
    // Reset do input
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }, [thumbnailFile?.preview])

  /**
   * Atualizar metadados
   * Boa prática: Função genérica para updates parciais
   */
  const updateMetadata = useCallback(<K extends keyof VideoMetadata>(
    key: K, 
    value: VideoMetadata[K]
  ) => {
    setMetadata(prev => ({ ...prev, [key]: value }))
  }, [])

  /**
   * Gerenciamento de tags
   */
  const addTag = useCallback(() => {
    const trimmedTag = tagInput.trim()
    
    if (!trimmedTag) return
    
    if (metadata.tags.length >= VALIDATION_CONFIG.metadata.maxTags) {
      setUploadState(prev => ({ 
        ...prev, 
        error: `Máximo de ${VALIDATION_CONFIG.metadata.maxTags} tags permitidas` 
      }))
      return
    }
    
    if (metadata.tags.includes(trimmedTag)) {
      setUploadState(prev => ({ 
        ...prev, 
        error: 'Esta tag já foi adicionada' 
      }))
      return
    }
    
    setMetadata(prev => ({ 
      ...prev, 
      tags: [...prev.tags, trimmedTag] 
    }))
    setTagInput('')
    setUploadState(prev => ({ ...prev, error: null }))
  }, [tagInput, metadata.tags])

  const removeTag = useCallback((tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }, [])

  /**
   * Validar metadados antes do upload
   */
  const validateMetadata = useCallback((): { isValid: boolean; error?: string } => {
    if (!metadata.title.trim()) {
      return { isValid: false, error: 'Título é obrigatório' }
    }
    
    if (metadata.title.length > VALIDATION_CONFIG.metadata.maxTitleLength) {
      return { 
        isValid: false, 
        error: `Título deve ter menos de ${VALIDATION_CONFIG.metadata.maxTitleLength} caracteres` 
      }
    }
    
    if (metadata.description.length > VALIDATION_CONFIG.metadata.maxDescriptionLength) {
      return { 
        isValid: false, 
        error: `Descrição deve ter menos de ${VALIDATION_CONFIG.metadata.maxDescriptionLength} caracteres` 
      }
    }

    return { isValid: true }
  }, [metadata])

  /**
   * Simular processo de upload
   * Nota: Substitua por integração real com o backend
   */
  const startUpload = useCallback(async () => {
    if (!videoFile) {
      setUploadState(prev => ({ ...prev, error: 'Nenhum vídeo selecionado' }))
      return
    }

    const validation = validateMetadata()
    if (!validation.isValid) {
      setUploadState(prev => ({ ...prev, error: validation.error! }))
      return
    }

    setUploadState(prev => ({ 
      ...prev, 
      step: 'uploading', 
      isUploading: true, 
      progress: 0, 
      error: null 
    }))

    // Simulação de progresso (substituir por upload real)
    const progressInterval = setInterval(() => {
      setUploadState(prev => {
        if (prev.progress >= 100) {
          clearInterval(progressInterval)
          return { 
            ...prev, 
            step: 'success', 
            isUploading: false, 
            progress: 100 
          }
        }
        return { ...prev, progress: prev.progress + 10 }
      })
    }, 500)

    // Cleanup se o componente for desmontado
    return () => clearInterval(progressInterval)
  }, [videoFile, validateMetadata])

  /**
   * Reset completo do estado
   */
  const resetUpload = useCallback(() => {
    // Cleanup de URLs
    if (videoFile?.preview) {
      URL.revokeObjectURL(videoFile.preview)
    }
    if (thumbnailFile?.preview) {
      URL.revokeObjectURL(thumbnailFile.preview)
    }

    // Reset de todos os estados
    setVideoFile(null)
    setThumbnailFile(null)
    setMetadata({
      title: '',
      description: '',
      genre: '',
      visibility: 'public',
      isVideoClip: true,
      director: '',
      tags: []
    })
    setTagInput('')
    setUploadState({
      step: 'initial',
      progress: 0,
      error: null,
      isUploading: false
    })

    // Reset dos inputs
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }, [videoFile?.preview, thumbnailFile?.preview])

  // Cleanup ao desmontar o componente
  React.useEffect(() => {
    return () => {
      if (videoFile?.preview) {
        URL.revokeObjectURL(videoFile.preview)
      }
      if (thumbnailFile?.preview) {
        URL.revokeObjectURL(thumbnailFile.preview)
      }
    }
  }, [videoFile?.preview, thumbnailFile?.preview])

  // Retorna todas as funções e estados necessários
  return {
    // Estados
    videoFile,
    thumbnailFile,
    metadata,
    uploadState,
    tagInput,
    
    // Refs
    videoInputRef,
    thumbnailInputRef,
    
    // Handlers
    handleVideoSelect,
    handleThumbnailSelect,
    clearVideoFile,
    clearThumbnailFile,
    updateMetadata,
    setTagInput,
    addTag,
    removeTag,
    startUpload,
    resetUpload,
    
    // Validações (expostas para uso externo se necessário)
    validateVideoFile,
    validateThumbnailFile,
    validateMetadata,
    
    // Configurações (expostas para referência)
    VALIDATION_CONFIG
  }
}