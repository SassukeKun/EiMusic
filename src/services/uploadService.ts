import { v4 as uuidv4 } from 'uuid';
import { createFolderStructure, getUploadPath } from '@/utils/cloudinary/folderStructure';
import { uploadSignedFile, uploadMetadata, CloudinaryUploadResponse } from '@/utils/cloudinary/signedUpload';
import { VideoMetadata, AudioMetadata } from '@/models/cloudinary/mediaTypes';
import { CLOUDINARY_FOLDERS, getArtistMediaPath } from '@/utils/cloudinary/config';

// Tipos de mídia para classificação no Cloudinary
const MEDIA_TYPES = {
  SINGLE: 'single' as const,
  ALBUM: 'album' as const,
  VIDEO: 'video' as const,
  PROFILE: 'profile' as const,
  COVER: 'cover' as const
};

type ArtistMediaType = 'single' | 'album' | 'video' | 'profile';
type UserProfileType = 'avatar' | 'banner';

const uploadService = {
  /**
   * Upload de uma música para o Cloudinary com organização de diretórios
   * @param artistId - ID do artista fazendo upload da música
   * @param artistName - Nome do artista (para estrutura de pastas)
   * @param file - Arquivo de música a ser subido
   * @param metadata - Metadados opcionais da música
   * @param coverArt - Arquivo opcional de capa da música
   * @returns Objeto com URLs e informações do arquivo subido
   */
  async uploadSong(
    artistId: string,
    artistName: string, 
    file: File, 
    metadata?: {
      title?: string;
      genre?: string;
      tags?: string[];
      isExplicit?: boolean;
      visibility?: 'public' | 'private' | 'followers';
      description?: string;
    },
    coverArt?: File
  ) {
    try {
      // Obter o título da música
      const songTitle = metadata?.title || file.name.split('.')[0];
      const folders = createFolderStructure(artistName, 'single', songTitle);
      
      // Gerar ID único para a faixa
      const trackId = uuidv4();
      
      // Upload do arquivo de áudio
      const audioResult = await uploadSignedFile(
        file, 
        getUploadPath(folders, `track_${trackId}`, 'main'),
        {
          resourceType: 'auto',
          tags: [`artist_${artistId}`, `track_${trackId}`, 'single'],
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          context: {
            alt: metadata?.title,
            caption: metadata?.description || '',
            custom: {
              title: metadata?.title,
              genre: metadata?.genre,
              tags: metadata?.tags,
              visibility: metadata?.visibility || 'public',
              uploadDate: new Date().toISOString(),
              isOriginal: true,
              isExplicit: metadata?.isExplicit || false,
              description: metadata?.description,
              artist_id: artistId,
              track_id: trackId,
              media_type: 'single'
            }
          }
        }
      );

      // Se houver uma imagem de capa, fazer upload também
      let coverArtResult = null;
      if (coverArt) {
        coverArtResult = await uploadSignedFile(
          coverArt,
          getUploadPath(folders, `cover_${trackId}`, 'cover'),
          {
            resourceType: 'image',
            tags: [`artist_${artistId}`, `track_${trackId}`, 'cover'],
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          }
        );
      }

      // Upload de metadados como JSON
      await uploadMetadata(
        {
          artistId,
          trackId,
          coverArt: coverArtResult ? coverArtResult.public_id : null,
          audio: audioResult.public_id
        },
        getUploadPath(folders, `metadata_${trackId}`, 'metadata'),
        `artist_${artistId},track_${trackId},single` // Fix: Convert array to comma-separated string
      );

      return {
        trackId,
        url: audioResult.secure_url,
        publicId: audioResult.public_id,
        format: audioResult.format,
        duration: audioResult.duration,
        coverArt: coverArtResult ? {
          url: coverArtResult.secure_url,
          publicId: coverArtResult.public_id
        } : undefined
      };
    } catch (error) {
      console.error('Erro ao fazer upload de música:', error);
      throw error;
    }
  },

  /**
   * Upload de um arquivo de vídeo para o Cloudinary
   * @param artistId - ID do artista fazendo upload do vídeo
   * @param file - Arquivo de vídeo a ser subido
   * @param metadata - Metadados opcionais do vídeo
   * @param thumbnail - Arquivo opcional de thumbnail
   * @returns Objeto com URLs e informações do arquivo subido
   */
  async uploadVideo(
    artistId: string, 
    file: File,
    metadata?: {
      title?: string;
      isVideoClip?: boolean;
      genre?: string;
      tags?: string[];
      visibility?: 'public' | 'private' | 'followers';
      description?: string;
      director?: string;
    },
    thumbnail?: File
  ) {
    try {
      // Obter o título do vídeo
      const videoTitle = metadata?.title || file.name.split('.')[0];
      const folders = createFolderStructure(artistId, 'video', videoTitle);
      
      // Gerar ID único para o vídeo
      const videoId = uuidv4();
      
      // Metadados do vídeo
      const videoMetadata: Partial<VideoMetadata> = {
        title: videoTitle,
        genre: metadata?.genre,
        tags: metadata?.tags,
        visibility: metadata?.visibility || 'public',
        uploadDate: new Date().toISOString(),
        isVideoClip: metadata?.isVideoClip ?? true,
        description: metadata?.description,
        director: metadata?.director
      };
      
      // Tags para categorização no Cloudinary
      const tags = [
        `artist_${artistId}`,
        `video_${videoId}`,
        ...(videoMetadata.isVideoClip ? ['video_clip'] : ['video'])
      ];
      
      if (metadata?.genre) {
        tags.push(`genre_${metadata.genre.toLowerCase()}`);
      }
      
      if (metadata?.tags) {
        tags.push(...metadata.tags);
      }
      
      // Configurações de transformação para vídeo
      const eager = [
        { width: 1280, height: 720, crop: 'scale' },
        { width: 854, height: 480, crop: 'scale' },
        { width: 640, height: 360, crop: 'scale' }
      ];
      
      // Upload do arquivo de vídeo
      const videoResult = await uploadSignedFile(file, getUploadPath(folders, `video_${videoId}`, 'main'), {
        resourceType: 'video',
        tags,
        eager,
        eager_async: true,
        context: {
          alt: videoMetadata.title,
          caption: videoMetadata.description || '',
          custom: {
            ...videoMetadata,
            artist_id: artistId,
            video_id: videoId,
            media_type: 'video'
          }
        }
      });
      
      // Se houver um thumbnail personalizado, fazer upload também
      let thumbnailResult = null;
      if (thumbnail) {
        thumbnailResult = await uploadSignedFile(
          thumbnail,
          getUploadPath(folders, `thumbnail_${videoId}`, 'thumbnail'),
          {
            resourceType: 'image',
            tags: [...tags, 'thumbnail']
          }
        );
      }
      
      // Upload de metadados como JSON
      await uploadMetadata(
        {
          ...videoMetadata,
          artistId,
          videoId,
          thumbnail: thumbnailResult ? thumbnailResult.public_id : null,
          video: videoResult.public_id
        },
        getUploadPath(folders, `metadata_${videoId}`, 'metadata'),
        tags.join(',') // Convert array to string
      );
      
      return {
        videoId,
        url: videoResult.secure_url,
        publicId: videoResult.public_id,
        format: videoResult.format,
        duration: videoResult.duration,
        thumbnail: thumbnailResult ? {
          url: thumbnailResult.secure_url,
          publicId: thumbnailResult.public_id
        } : undefined
      };
    } catch (error) {
      console.error('Erro ao fazer upload de vídeo:', error);
      throw error;
    }
  },

  /**
   * Upload de um arquivo de imagem (profile pictures, cover art, etc.)
   * @param userId - ID do usuário/artista
   * @param file - Arquivo de imagem a ser subido
   * @param type - Tipo de imagem (avatar, banner, etc.)
   * @param isArtist - Se o usuário é um artista
   * @returns Objeto com URLs e informações do arquivo subido
   */
  async uploadImage(
    userId: string, 
    file: File, 
    type: UserProfileType | 'cover',
    isArtist: boolean = false
  ) {
    try {
      // Determinar a pasta base para a imagem
      let imageFolder: string;
      
      if (isArtist) {
        // Para artistas usamos a estrutura eimusic/artistname/profile
        if (type === 'cover') {
          imageFolder = getArtistMediaPath(userId, MEDIA_TYPES.PROFILE, 'cover');
        } else {
          imageFolder = `${getArtistMediaPath(userId, MEDIA_TYPES.PROFILE)}/${type}`;
        }
      } else {
        // Para usuários regulares usamos eimusic/users/userid/profile
        if (type === 'cover') {
          imageFolder = `${CLOUDINARY_FOLDERS.USERS}/${userId}/${MEDIA_TYPES.COVER}`;
        } else {
          imageFolder = `${CLOUDINARY_FOLDERS.USERS}/${userId}/${MEDIA_TYPES.PROFILE}/${type}`;
        }
      }
      
      // Gerar ID único para a imagem
      const imageId = uuidv4();
      const publicId = `${type}_${imageId}`;
      
      // Tags para categorização
      const tags = [
        `user_${userId}`,
        isArtist ? 'artist' : 'user',
        type,
        type === 'cover' ? 'cover_art' : 'profile_picture'
      ];
      
      // Transformações para a imagem
      const transformation = type === 'avatar' 
        ? { width: 400, height: 400, crop: 'fill', gravity: 'face' } 
        : undefined;
      
      // Fazer upload da imagem
      const result = await uploadSignedFile(file, imageFolder, {
        resourceType: 'image',
        tags: tags,
        context: {
          alt: `${type} image for ${isArtist ? 'artist' : 'user'} ${userId}`,
          custom: {
            user_id: userId,
            is_artist: isArtist,
            image_type: type,
            upload_date: new Date().toISOString()
          }
        }
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      };
    } catch (error) {
      console.error('Erro ao fazer upload de imagem:', error);
      throw error;
    }
  },
  
  /**
   * Upload de um álbum completo para o Cloudinary
   * @param artistId - ID do artista fazendo upload do álbum
   * @param coverArtFile - Arquivo de capa do álbum
   * @param audioFiles - Array de arquivos de áudio
   * @param albumMetadata - Metadados do álbum
   * @returns Objeto com informações do álbum e faixas
   */
  async uploadAlbum(
    artistId: string,
    coverArtFile: File,
    audioFiles: File[],
    albumMetadata: {
      title: string;
      description?: string;
      genre?: string;
      releaseDate?: string;
      visibility?: 'public' | 'private' | 'followers';
      isExplicit?: boolean;
      tags?: string[];
    }
  ) {
    try {
      // Pasta para o álbum no Cloudinary (eimusic/artistname/album/album_name)
      const albumFolder = getArtistMediaPath(artistId, MEDIA_TYPES.ALBUM, albumMetadata.title);
      
      // Gerar ID único para o álbum
      const albumId = uuidv4();
      
      // Tags comuns para todos os arquivos do álbum
      const commonTags = [
        `artist_${artistId}`,
        `album_${albumId}`,
        'album'
      ];
      
      if (albumMetadata.genre) {
        commonTags.push(`genre_${albumMetadata.genre.toLowerCase()}`);
      }
      
      if (albumMetadata.tags) {
        commonTags.push(...albumMetadata.tags);
      }
      
      // Upload da capa do álbum
      const coverArtResult = await uploadSignedFile(coverArtFile, `${albumFolder}/${MEDIA_TYPES.COVER}`, {
        resourceType: 'image',
        tags: [...commonTags, 'cover-art'],
        context: {
          alt: `${albumMetadata.title} - Cover Art`,
          caption: albumMetadata.description || '',
          custom: {
            album_id: albumId,
            album_title: albumMetadata.title
          }
        }
      });
      
      // Upload de cada faixa do álbum
      const tracks = [];
      
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        const trackNumber = i + 1;
        const trackId = uuidv4();
        
        // Extrair nome da faixa do nome do arquivo
        const trackName = file.name.split('.')[0];
        
        // Metadados da faixa
        const trackMetadata = {
          title: trackName,
          trackNumber,
          isExplicit: albumMetadata.isExplicit || false,
          album: albumMetadata.title,
          albumId,
          genre: albumMetadata.genre,
          visibility: albumMetadata.visibility || 'public',
          uploadDate: new Date().toISOString()
        };
        
        // Upload da faixa
        const trackResult = await uploadSignedFile(file, `${albumFolder}/tracks`, {
          resourceType: 'auto',
          tags: [...commonTags, `track_${trackId}`, `track_number_${trackNumber}`],
          publicId: `track_${trackNumber}_${trackId}`,
          context: {
            alt: trackName,
            caption: `Track ${trackNumber} from ${albumMetadata.title}`,
            custom: {
              ...trackMetadata,
              artist_id: artistId,
              media_type: 'single'
            }
          }
        });
        
        tracks.push({
          trackId,
          trackNumber,
          title: trackName,
          url: trackResult.secure_url,
          publicId: trackResult.public_id,
          format: trackResult.format,
          duration: trackResult.duration
        });
      }
      
      // Upload de metadados do álbum como JSON
      await uploadMetadata(
        {
          ...albumMetadata,
          artistId,
          albumId,
          coverArt: coverArtResult.public_id,
          trackCount: audioFiles.length,
          tracks: tracks.map(track => ({
            trackId: track.trackId,
            trackNumber: track.trackNumber,
            title: track.title,
            publicId: track.publicId,
            duration: track.duration
          }))
        },
        `${albumFolder}/${CLOUDINARY_FOLDERS.METADATA}`,
        `metadata_${albumId}`,
        commonTags
      );
      
      return {
        albumId,
        title: albumMetadata.title,
        coverArt: {
          url: coverArtResult.secure_url,
          publicId: coverArtResult.public_id
        },
        tracks
      };
    } catch (error) {
      console.error('Erro ao fazer upload de álbum:', error);
      throw error;
    }
  }
};

export default uploadService;
