import { v4 as uuidv4 } from 'uuid';

// Tipos para mídia e metadados
export interface MediaMetadata {
  title: string;
  description?: string;
  genre?: string;
  mood?: string;
  tags?: string[];
  releaseDate?: string;
  duration?: number;
  visibility: 'public' | 'private' | 'followers';
  uploadDate: string;
}

export interface AudioMetadata extends MediaMetadata {
  bpm?: number;
  key?: string;
  lyrics?: string;
  isOriginal: boolean;
  isExplicit: boolean;
  featuredArtists?: string[];
}

export interface VideoMetadata extends MediaMetadata {
  isVideoClip: boolean;
  director?: string;
  featuredArtists?: string[];
}

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  resourceType: string;
}

/**
 * Serviço para gerenciar uploads e manipulação de mídia no Cloudinary
 */
const cloudinaryService = {
  /**
   * Configuração do Cloudinary para uploads diretos via frontend
   * @returns Configuração necessária para uploads no frontend
   */
  getUploadConfig() {
    return {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      folder: 'eimusic/temp/uploads'
    };
  },
  
  /**
   * Upload de arquivo de áudio para um artista
   * @param artistId - ID único do artista
   * @param file - Arquivo de áudio a ser enviado
   * @param metadata - Metadados da faixa
   * @returns Resultado do upload com URLs e IDs
   */
  async uploadAudio(artistId: string, file: File, metadata: AudioMetadata): Promise<CloudinaryUploadResult> {
    try {
      // Gerar ID único para a faixa
      const trackId = uuidv4();
      
      // Definir pasta de destino no Cloudinary
      const folder = `eimusic/artists/${artistId}/audio/${trackId}`;
      
      // Upload via upload widget ou API do Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', folder);
      formData.append('resource_type', 'auto');
      
      // Adicionar metadados como tags estruturados
      formData.append('context', JSON.stringify({
        alt: metadata.title,
        caption: metadata.description || '',
        custom: {
          title: metadata.title,
          genre: metadata.genre || '',
          mood: metadata.mood || '',
          visibility: metadata.visibility,
          artist_id: artistId,
          track_id: trackId,
          media_type: 'audio'
        }
      }));
      
      // Tags para facilitar busca e organização
      const tags = [`artist_${artistId}`, `track_${trackId}`, ...(metadata.tags || [])];
      if (metadata.genre) tags.push(`genre_${metadata.genre.toLowerCase()}`);
      if (metadata.mood) tags.push(`mood_${metadata.mood.toLowerCase()}`);
      
      formData.append('tags', tags.join(','));
      
      // Fazer o upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao fazer upload para o Cloudinary');
      }
      
      const result = await response.json();
      
      // Salvar metadados completos em um arquivo JSON no mesmo local
      await this.saveMetadata(artistId, trackId, 'audio', metadata);
      
      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        duration: result.duration,
        resourceType: result.resource_type
      };
    } catch (error) {
      console.error('Erro ao fazer upload de áudio:', error);
      throw error;
    }
  },
  
  /**
   * Upload de arquivo de vídeo para um artista
   * @param artistId - ID único do artista
   * @param file - Arquivo de vídeo a ser enviado
   * @param metadata - Metadados do vídeo
   * @param thumbnailFile - Opcional: arquivo de thumbnail personalizado
   * @returns Resultado do upload com URLs e IDs
   */
  async uploadVideo(
    artistId: string,
    file: File,
    metadata: VideoMetadata,
    thumbnailFile?: File
  ): Promise<CloudinaryUploadResult> {
    try {
      // Gerar ID único para o vídeo
      const clipId = uuidv4();
      
      // Definir pasta de destino no Cloudinary
      const folder = `eimusic/artists/${artistId}/video/${clipId}`;
      
      // Upload via upload widget ou API do Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('folder', folder);
      formData.append('resource_type', 'video');
      
      // Configurações para gerar thumbnail automaticamente
      if (!thumbnailFile) {
        formData.append('eager', JSON.stringify([
          { format: 'jpg', transformation: [
            { width: 640, height: 360, crop: 'fill' },
            { quality: 'auto' }
          ]}
        ]));
      }
      
      // Adicionar metadados como tags estruturados
      formData.append('context', JSON.stringify({
        alt: metadata.title,
        caption: metadata.description || '',
        custom: {
          title: metadata.title,
          genre: metadata.genre || '',
          mood: metadata.mood || '',
          visibility: metadata.visibility,
          artist_id: artistId,
          clip_id: clipId,
          media_type: 'video',
          is_video_clip: metadata.isVideoClip
        }
      }));
      
      // Tags para facilitar busca e organização
      const tags = [`artist_${artistId}`, `clip_${clipId}`, ...(metadata.tags || [])];
      if (metadata.genre) tags.push(`genre_${metadata.genre.toLowerCase()}`);
      if (metadata.mood) tags.push(`mood_${metadata.mood.toLowerCase()}`);
      if (metadata.isVideoClip) tags.push('videoclip');
      
      formData.append('tags', tags.join(','));
      
      // Fazer o upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao fazer upload para o Cloudinary');
      }
      
      const result = await response.json();
      
      // Se foi fornecido um thumbnail personalizado, fazer upload
      if (thumbnailFile) {
        await this.uploadThumbnail(artistId, clipId, thumbnailFile);
      }
      
      // Salvar metadados completos em um arquivo JSON no mesmo local
      await this.saveMetadata(artistId, clipId, 'video', metadata);
      
      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
        resourceType: result.resource_type
      };
    } catch (error) {
      console.error('Erro ao fazer upload de vídeo:', error);
      throw error;
    }
  },
  
  /**
   * Upload de imagem de capa para uma faixa
   * @param artistId - ID do artista
   * @param trackId - ID da faixa
   * @param file - Arquivo de imagem
   * @returns Resultado do upload
   */
  async uploadCoverArt(artistId: string, trackId: string, file: File): Promise<CloudinaryUploadResult> {
    try {
      // Definir pasta de destino no Cloudinary
      const folder = `eimusic/artists/${artistId}/cover-art`;
      const publicId = `${folder}/${trackId}_cover`;
      
      // Upload via API do Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('public_id', publicId);
      formData.append('resource_type', 'image');
      
      // Adicionar transformações para diferentes resoluções
      formData.append('eager', JSON.stringify([
        { width: 300, height: 300, crop: 'fill', quality: 'auto' },
        { width: 600, height: 600, crop: 'fill', quality: 'auto' }
      ]));
      
      // Tags para facilitar busca
      formData.append('tags', `artist_${artistId},track_${trackId},cover`);
      
      // Fazer o upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao fazer upload da imagem de capa');
      }
      
      const result = await response.json();
      
      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type
      };
    } catch (error) {
      console.error('Erro ao fazer upload de capa:', error);
      throw error;
    }
  },
  
  /**
   * Upload de thumbnail para um vídeo
   * @param artistId - ID do artista
   * @param clipId - ID do vídeo
   * @param file - Arquivo de imagem para thumbnail
   * @returns Resultado do upload
   */
  async uploadThumbnail(artistId: string, clipId: string, file: File): Promise<CloudinaryUploadResult> {
    try {
      // Definir pasta de destino no Cloudinary
      const folder = `eimusic/artists/${artistId}/video/${clipId}`;
      const publicId = `${folder}/thumbnail`;
      
      // Upload via API do Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('public_id', publicId);
      formData.append('resource_type', 'image');
      
      // Transformações para diferentes resoluções
      formData.append('eager', JSON.stringify([
        { width: 640, height: 360, crop: 'fill', quality: 'auto' },
        { width: 1280, height: 720, crop: 'fill', quality: 'auto' }
      ]));
      
      // Tags para facilitar busca
      formData.append('tags', `artist_${artistId},clip_${clipId},thumbnail`);
      
      // Fazer o upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao fazer upload do thumbnail');
      }
      
      const result = await response.json();
      
      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type
      };
    } catch (error) {
      console.error('Erro ao fazer upload de thumbnail:', error);
      throw error;
    }
  },
  
  /**
   * Upload de imagem de perfil para um artista
   * @param artistId - ID do artista
   * @param file - Arquivo de imagem
   * @param type - Tipo de imagem (avatar ou banner)
   * @returns Resultado do upload
   */
  async uploadProfileImage(
    artistId: string, 
    file: File, 
    type: 'avatar' | 'banner'
  ): Promise<CloudinaryUploadResult> {
    try {
      // Definir pasta de destino no Cloudinary
      const folder = `eimusic/artists/${artistId}/profile`;
      const publicId = `${folder}/${type}`;
      
      // Upload via API do Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('public_id', publicId);
      formData.append('resource_type', 'image');
      
      // Transformações específicas para cada tipo de imagem
      if (type === 'avatar') {
        formData.append('eager', JSON.stringify([
          { width: 150, height: 150, crop: 'fill', quality: 'auto' },
          { width: 300, height: 300, crop: 'fill', quality: 'auto' }
        ]));
      } else {
        // Banner
        formData.append('eager', JSON.stringify([
          { width: 800, height: 250, crop: 'fill', quality: 'auto' },
          { width: 1600, height: 500, crop: 'fill', quality: 'auto' }
        ]));
      }
      
      // Tags para facilitar busca
      formData.append('tags', `artist_${artistId},profile,${type}`);
      
      // Fazer o upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error(`Falha ao fazer upload de ${type}`);
      }
      
      const result = await response.json();
      
      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type
      };
    } catch (error) {
      console.error(`Erro ao fazer upload de ${type}:`, error);
      throw error;
    }
  },
  
  /**
   * Salvar metadados completos da mídia em um arquivo JSON
   * @param artistId - ID do artista
   * @param mediaId - ID da mídia (track ou clip)
   * @param mediaType - Tipo de mídia (audio ou video)
   * @param metadata - Objeto com metadados completos
   */
  async saveMetadata(
    artistId: string,
    mediaId: string,
    mediaType: 'audio' | 'video',
    metadata: AudioMetadata | VideoMetadata
  ): Promise<void> {
    try {
      // Criar um texto JSON dos metadados
      const jsonContent = JSON.stringify(metadata, null, 2);
      
      // Converter para um Blob
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const file = new File([blob], 'metadata.json', { type: 'application/json' });
      
      // Definir pasta de destino no Cloudinary
      const folder = `eimusic/artists/${artistId}/${mediaType}/${mediaId}`;
      const publicId = `${folder}/metadata`;
      
      // Upload via API do Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('public_id', publicId);
      formData.append('resource_type', 'raw');
      
      // Tags para facilitar busca
      formData.append('tags', `artist_${artistId},${mediaType === 'audio' ? 'track' : 'clip'}_${mediaId},metadata`);
      
      // Fazer o upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao salvar metadados');
      }
    } catch (error) {
      console.error('Erro ao salvar metadados:', error);
      throw error;
    }
  },
  
  /**
   * Cria registros de "artista do mês" ou "faixas em destaque"
   * @param type - Tipo de destaque (artist-of-month, trending-tracks)
   * @param period - Período (formato YYYY-MM para mês, YYYY-WW para semana)
   * @param data - Dados a serem armazenados
   */
  async saveFeaturedData(
    type: 'artist-of-month' | 'trending-tracks',
    period: string,
    data: any
  ): Promise<void> {
    try {
      // Criar um texto JSON dos dados
      const jsonContent = JSON.stringify(data, null, 2);
      
      // Converter para um Blob
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const file = new File([blob], `${period}.json`, { type: 'application/json' });
      
      // Definir pasta de destino no Cloudinary
      const folder = `eimusic/featured/${type}`;
      const publicId = `${folder}/${period}`;
      
      // Upload via API do Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
      formData.append('public_id', publicId);
      formData.append('resource_type', 'raw');
      
      // Tags para facilitar busca
      formData.append('tags', `featured,${type},${period}`);
      
      // Fazer o upload para o Cloudinary
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao salvar dados de destaque');
      }
    } catch (error) {
      console.error('Erro ao salvar dados de destaque:', error);
      throw error;
    }
  },
  
  /**
   * Gera URLs para diferentes resoluções de imagens usando transformações do Cloudinary
   * @param publicId - ID público da imagem no Cloudinary
   * @param options - Opções de transformação
   * @returns Objeto com URLs para diferentes resoluções
   */
  generateImageUrls(publicId: string, options: {
    sizes?: { width: number, height: number }[],
    format?: 'auto' | 'webp' | 'jpg' | 'png',
    quality?: 'auto' | number
  } = {}) {
    const defaultSizes = [
      { width: 150, height: 150 },
      { width: 300, height: 300 },
      { width: 600, height: 600 }
    ];
    
    const sizes = options.sizes || defaultSizes;
    const format = options.format || 'auto';
    const quality = options.quality || 'auto';
    
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const urls: Record<string, string> = {};
    
    sizes.forEach(size => {
      const transformation = `c_fill,w_${size.width},h_${size.height},q_${quality},f_${format}`;
      urls[`${size.width}x${size.height}`] = `${baseUrl}/${transformation}/${publicId}`;
    });
    
    // URL original
    urls.original = `${baseUrl}/${publicId}`;
    
    return urls;
  },
  
  /**
   * Gera URLs com transformações para vídeos
   * @param publicId - ID público do vídeo no Cloudinary
   * @param options - Opções de transformação
   * @returns Objeto com URLs para diferentes configurações
   */
  generateVideoUrls(publicId: string, options: {
    formats?: ('mp4' | 'webm' | 'ogg')[],
    qualities?: ('auto' | 'low' | 'medium' | 'high')[],
    thumbnail?: boolean
  } = {}) {
    const formats = options.formats || ['mp4'];
    const qualities = options.qualities || ['auto'];
    const includeThumbnail = options.thumbnail !== false;
    
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`;
    const imageBaseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const urls: Record<string, string> = {};
    
    // Gerar URLs para cada formato e qualidade
    formats.forEach(format => {
      qualities.forEach(quality => {
        let qualityValue = 'auto';
        if (quality === 'low') qualityValue = '40';
        else if (quality === 'medium') qualityValue = '70';
        else if (quality === 'high') qualityValue = '90';
        
        const transformation = `q_${qualityValue},f_${format}`;
        urls[`${format}_${quality}`] = `${baseUrl}/${transformation}/${publicId}`;
      });
    });
    
    // URL original
    urls.original = `${baseUrl}/${publicId}`;
    
    // Adicionar thumbnails em diferentes momentos do vídeo
    if (includeThumbnail) {
      [0, 25, 50, 75].forEach(percent => {
        urls[`thumbnail_${percent}`] = `${imageBaseUrl}/so_${percent},w_640,h_360,c_fill,q_auto/${publicId}.jpg`;
      });
    }
    
    return urls;
  },
  
  /**
   * Buscar todos os assets de um artista organizados por tipo
   * @param artistId - ID do artista
   * @returns Objetos organizados com todos os assets do artista
   */
  async getArtistAssets(artistId: string) {
    try {
      // Implementação depende da API Admin do Cloudinary
      // Esta é uma versão simplificada usando busca por tags
      
      const searchUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/resources/search`;
      
      // Autenticação básica para API Admin
      const auth = btoa(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`);
      
      const response = await fetch(`${searchUrl}?expression=tags=artist_${artistId}`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao buscar assets do artista');
      }
      
      const result = await response.json();
      
      // Organizar assets por tipo
      const organized = {
        audio: [] as any[],
        video: [] as any[],
        images: {
          profile: {} as any,
          coverArt: [] as any[]
        }
      };
      
      result.resources.forEach((resource: any) => {
        const path = resource.public_id.split('/');
        
        // Classificar baseado no caminho
        if (resource.public_id.includes('/audio/')) {
          organized.audio.push(resource);
        } else if (resource.public_id.includes('/video/')) {
          organized.video.push(resource);
        } else if (resource.public_id.includes('/profile/')) {
          const type = path[path.length - 1];
          organized.images.profile[type] = resource;
        } else if (resource.public_id.includes('/cover-art/')) {
          organized.images.coverArt.push(resource);
        }
      });
      
      return organized;
    } catch (error) {
      console.error('Erro ao buscar assets do artista:', error);
      throw error;
    }
  },
  
  /**
   * Remove um asset do Cloudinary
   * @param publicId - ID público do recurso
   * @returns Resultado da operação
   */
  async deleteAsset(publicId: string) {
    try {
      // Esta implementação requer API Admin do Cloudinary
      const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/resources/image/upload/${publicId}`;
      
      // Autenticação básica para API Admin
      const auth = btoa(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`);
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Falha ao excluir asset');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao excluir asset:', error);
      throw error;
    }
  }
};

export default cloudinaryService; 