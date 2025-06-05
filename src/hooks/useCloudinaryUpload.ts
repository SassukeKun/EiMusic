'use client'

import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import cloudinaryService, { AudioMetadata, VideoMetadata, CloudinaryUploadResult } from '@/services/cloudinaryService'
import { v4 as uuidv4 } from 'uuid'

export interface UploadProgress {
  isUploading: boolean
  progress: number
  error: string | null
}

interface UseCloudinaryUploadReturn {
  // Estado de upload
  uploadState: UploadProgress
  
  // Funções de upload
  uploadAudio: (
    file: File, 
    metadata: Omit<AudioMetadata, 'uploadDate'>,
    coverArt?: File
  ) => Promise<CloudinaryUploadResult | null>
  
  uploadVideo: (
    file: File, 
    metadata: Omit<VideoMetadata, 'uploadDate'>,
    thumbnail?: File
  ) => Promise<CloudinaryUploadResult | null>
  
  uploadProfileImage: (
    file: File,
    type: 'avatar' | 'banner'
  ) => Promise<CloudinaryUploadResult | null>
  
  // Função para limpar o estado
  resetUploadState: () => void
}

/**
 * Hook para gerenciar uploads para o Cloudinary
 */
export function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const { user, isArtist } = useAuth()
  const [uploadState, setUploadState] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null
  })
  
  // Função para limpar estado de upload
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null
    })
  }, [])
  
  // Função para simular progresso de upload
  // Em um ambiente de produção, este progresso seria obtido do evento de upload real
  const simulateProgress = useCallback(() => {
    setUploadState(prev => ({ ...prev, isUploading: true, progress: 0 }))
    
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 1
      
      if (progress >= 100) {
        clearInterval(interval)
        progress = 100
      }
      
      setUploadState(prev => ({ ...prev, progress }))
    }, 300)
    
    return () => clearInterval(interval)
  }, [])
  
  // Upload de áudio com metadados
  const uploadAudio = useCallback(async (
    file: File,
    metadata: Omit<AudioMetadata, 'uploadDate'>,
    coverArt?: File
  ): Promise<CloudinaryUploadResult | null> => {
    if (!user || !isArtist) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Apenas artistas podem fazer upload de músicas'
      })
      return null
    }
    
    try {
      const stopSimulation = simulateProgress()
      
      // Adicionar data de upload aos metadados
      const fullMetadata: AudioMetadata = {
        ...metadata,
        uploadDate: new Date().toISOString()
      }
      
      // Fazer upload do arquivo de áudio
      const result = await cloudinaryService.uploadAudio(
        user.id, 
        file, 
        fullMetadata
      )
      
      // Se também tiver uma imagem de capa, fazer upload
      if (coverArt && result) {
        // O trackId está no publicId, extrair da pasta
        // Na nova estrutura, o caminho é eimusic/{artistId}/single/{track_title}
        const pathParts = result.publicId.split('/')
        
        // Usamos o ID da faixa, mas também passamos o título para manter consistência no caminho
        const trackId = uuidv4() // Gerar um ID único para referência
        
        await cloudinaryService.uploadCoverArt(
          user.id, 
          trackId, 
          coverArt,
          fullMetadata.title // Passar o título da faixa para garantir o mesmo caminho
        )
      }
      
      // Limpar intervalo de simulação
      stopSimulation()
      
      // Atualizar estado para concluído
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      })
      
      return result
    } catch (error: any) {
      console.error('Erro no upload de áudio:', error)
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || 'Erro ao fazer upload do áudio'
      })
      
      return null
    }
  }, [user, isArtist, simulateProgress])
  
  // Upload de vídeo com metadados
  const uploadVideo = useCallback(async (
    file: File,
    metadata: Omit<VideoMetadata, 'uploadDate'>,
    thumbnail?: File
  ): Promise<CloudinaryUploadResult | null> => {
    if (!user || !isArtist) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Apenas artistas podem fazer upload de vídeos'
      })
      return null
    }
    
    try {
      const stopSimulation = simulateProgress()
      
      // Adicionar data de upload aos metadados
      const fullMetadata: VideoMetadata = {
        ...metadata,
        uploadDate: new Date().toISOString()
      }
      
      // Fazer upload do arquivo de vídeo
      const result = await cloudinaryService.uploadVideo(
        user.id,
        file,
        fullMetadata,
        thumbnail
      )
      
      // Limpar intervalo de simulação
      stopSimulation()
      
      // Atualizar estado para concluído
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      })
      
      return result
    } catch (error: any) {
      console.error('Erro no upload de vídeo:', error)
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || 'Erro ao fazer upload do vídeo'
      })
      
      return null
    }
  }, [user, isArtist, simulateProgress])
  
  // Upload de imagem de perfil (avatar ou banner)
  const uploadProfileImage = useCallback(async (
    file: File,
    type: 'avatar' | 'banner'
  ): Promise<CloudinaryUploadResult | null> => {
    if (!user || !isArtist) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Apenas artistas podem fazer upload de imagens de perfil'
      })
      return null
    }
    
    try {
      const stopSimulation = simulateProgress()
      
      // Fazer upload da imagem de perfil
      const result = await cloudinaryService.uploadProfileImage(
        user.id,
        file,
        type
      )
      
      // Limpar intervalo de simulação
      stopSimulation()
      
      // Atualizar estado para concluído
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      })
      
      return result
    } catch (error: any) {
      console.error(`Erro no upload de ${type}:`, error)
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || `Erro ao fazer upload da imagem de ${type}`
      })
      
      return null
    }
  }, [user, isArtist, simulateProgress])
  
  return {
    uploadState,
    uploadAudio,
    uploadVideo,
    uploadProfileImage,
    resetUploadState
  }
}

export default useCloudinaryUpload 