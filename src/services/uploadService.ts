import { v4 as uuidv4 } from 'uuid';
import { createFolderStructure, generateCloudinaryPublicId } from '@/utils/cloudinary/folderStructure';
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
      const songTitle = metadata?.title || file.name.split('.')[0];
      // 1. Create the folder structure object. This defines the base path to the 'ficheiros' directory.
      const structure = createFolderStructure(artistName, 'single', songTitle);
      
      const trackId = uuidv4();
      const commonTags = [`artist_${artistId}`, `track_${trackId}`, 'single'];
      if (metadata?.genre) commonTags.push(`genre_${metadata.genre.toLowerCase()}`);
      if (metadata?.tags) commonTags.push(...metadata.tags);

      // 2. Generate public_id for the main audio file.
      const audioPublicId = generateCloudinaryPublicId(structure, `track_main_${trackId}`);
      
      // Upload do arquivo de áudio
      const audioResult = await uploadSignedFile(
        file, 
        "", // Folder argument is empty as public_id dictates the path
        {
          publicId: audioPublicId,
          resourceType: 'auto',
          tags: commonTags,
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
              isOriginal: true, // Assuming it's original, adjust if needed
              isExplicit: metadata?.isExplicit || false,
              description: metadata?.description,
              artist_id: artistId,
              track_id: trackId,
              media_type: 'single'
            }
          }
        }
      );

      let coverArtResult = null;
      if (coverArt) {
        // Generate public_id for the cover art file.
        const coverArtPublicId = generateCloudinaryPublicId(structure, `cover_art_${trackId}`);
        coverArtResult = await uploadSignedFile(
          coverArt,
          "", // Folder argument is empty
          {
            publicId: coverArtPublicId,
            resourceType: 'image',
            tags: [...commonTags, 'cover_art'],
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          }
        );
      }

      // Generate public_id for the metadata JSON file.
      const metadataPublicId = generateCloudinaryPublicId(structure, `metadata_info_${trackId}`);
      await uploadMetadata(
        {
          artistId,
          artistName, // Storing artistName in metadata might be useful
          trackId,
          title: songTitle,
          ...metadata, // Spread other provided metadata
          audio_public_id: audioResult.public_id,
          cover_art_public_id: coverArtResult ? coverArtResult.public_id : null,
          uploadDate: new Date().toISOString(),
          // Add any other relevant metadata fields here
        },
        "", // Folder argument is empty for uploadMetadata as well
        metadataPublicId, 
        commonTags.join(',')
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
   * @param artistName - Nome do artista (para estrutura de pastas)
   * @param file - Arquivo de vídeo a ser subido
   * @param metadata - Metadados opcionais do vídeo
   * @param thumbnail - Arquivo opcional de thumbnail
   * @returns Objeto com URLs e informações do arquivo subido
   */
  async uploadVideo(
    artistId: string,
    artistName: string,
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
      const videoTitle = metadata?.title || file.name.split('.')[0];
      // 1. Create the folder structure object.
      const structure = createFolderStructure(artistName, 'video', videoTitle);
      
      const clipId = uuidv4();
      
      const commonTags = [`artist_${artistId}`, `clip_${clipId}`, 'video'];
      if (metadata?.genre) commonTags.push(`genre_${metadata.genre.toLowerCase()}`);
      if (metadata?.tags) commonTags.push(...metadata.tags);
      if (metadata?.isVideoClip) commonTags.push('video_clip');

      // 2. Generate public_id for the main video file.
      const videoPublicId = generateCloudinaryPublicId(structure, `video_main_${clipId}`);

      // Upload do arquivo de vídeo
      const videoResult = await uploadSignedFile(
        file,
        "", // Folder argument is empty as public_id dictates the path
        {
          publicId: videoPublicId,
          resourceType: 'video',
          tags: commonTags,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          context: {
            alt: metadata?.title || videoTitle,
            caption: metadata?.description || '',
            custom: {
              title: metadata?.title || videoTitle,
              genre: metadata?.genre,
              tags: metadata?.tags,
              visibility: metadata?.visibility || 'public',
              uploadDate: new Date().toISOString(),
              isVideoClip: metadata?.isVideoClip ?? true,
              description: metadata?.description,
              director: metadata?.director,
              artist_id: artistId,
              clip_id: clipId,
              media_type: 'video'
            }
          }
        }
      );

      let thumbnailResult = null;
      if (thumbnail) {
        // Generate public_id for the thumbnail file.
        const thumbnailPublicId = generateCloudinaryPublicId(structure, `thumbnail_main_${clipId}`);
        thumbnailResult = await uploadSignedFile(
          thumbnail,
          "", // Folder argument is empty
          {
            publicId: thumbnailPublicId,
            resourceType: 'image',
            tags: [...commonTags, 'thumbnail'],
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
          }
        );
      }

      // Generate public_id for the metadata JSON file.
      const metadataPublicId = generateCloudinaryPublicId(structure, `metadata_info_${clipId}`);
      
      // Metadados do vídeo para o arquivo JSON
      const videoMetadataToUpload: Partial<VideoMetadata> & { artistId: string; artistName: string; clipId: string; video_public_id: string; thumbnail_public_id: string | null; duration?: number; format: string; } = {
        artistId,
        artistName,
        clipId,
        title: videoTitle,
        genre: metadata?.genre,
        tags: metadata?.tags,
        visibility: metadata?.visibility || 'public',
        uploadDate: new Date().toISOString(),
        isVideoClip: metadata?.isVideoClip ?? true,
        description: metadata?.description,
        director: metadata?.director,
        video_public_id: videoResult.public_id,
        thumbnail_public_id: thumbnailResult ? thumbnailResult.public_id : null,
        duration: videoResult.duration,
        format: videoResult.format
      };
      
      await uploadMetadata(
        videoMetadataToUpload,
        "", // Folder argument is empty
        metadataPublicId,
        commonTags
      );

      return {
        clipId,
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
   * Upload de um álbum completo para o Cloudinary com organização de diretórios
   * @param artistId - ID do artista fazendo upload do álbum
   * @param artistName - Nome do artista (para estrutura de pastas)
   * @param coverArtFile - Arquivo de capa do álbum
   * @param audioFiles - Array de arquivos de áudio
   * @param albumMetadata - Metadados do álbum
   * @returns Objeto com informações do álbum e faixas
   */
  async uploadAlbum(
    artistId: string,
    artistName: string, 
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
      // 1. Criar a estrutura de pastas para o álbum
      const structure = createFolderStructure(artistName, 'album', albumMetadata.title);
      
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
      
      // 2. Gerar public_id para a capa do álbum
      const coverArtPublicId = generateCloudinaryPublicId(structure, `cover_art_${albumId}`);
      
      // Upload da capa do álbum
      const coverArtResult = await uploadSignedFile(
        coverArtFile, 
        "", // Folder argument is empty as public_id dictates the path
        {
          publicId: coverArtPublicId,
          resourceType: 'image',
          tags: [...commonTags, 'cover-art'],
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          context: {
            alt: `${albumMetadata.title} - Cover Art`,
            caption: albumMetadata.description || '',
            custom: {
              album_id: albumId,
              album_title: albumMetadata.title,
              artist_id: artistId,
              media_type: 'album'
            }
          }
        }
      );
      
      // Upload de cada faixa do álbum
      const tracks = [];
      
      for (let i = 0; i < audioFiles.length; i++) {
        const file = audioFiles[i];
        const trackNumber = i + 1;
        const trackId = uuidv4();
        
        // Extrair nome da faixa do nome do arquivo
        const trackName = file.name.split('.')[0];
        
        // 3. Gerar public_id para cada faixa do álbum
        const trackPublicId = generateCloudinaryPublicId(structure, `track_${trackNumber}_${trackId}`);
        
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
        const trackResult = await uploadSignedFile(
          file, 
          "", // Folder argument is empty as public_id dictates the path
          {
            publicId: trackPublicId,
            resourceType: 'auto',
            tags: [...commonTags, `track_${trackId}`, `track_number_${trackNumber}`],
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            context: {
              alt: trackName,
              caption: `Track ${trackNumber} from ${albumMetadata.title}`,
              custom: {
                ...trackMetadata,
                artist_id: artistId,
                artist_name: artistName,
                track_id: trackId,
                media_type: 'album_track'
              }
            }
          }
        );
        
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
      
      // 4. Gerar public_id para os metadados do álbum
      const metadataPublicId = generateCloudinaryPublicId(structure, `metadata_info_${albumId}`);
      
      // Upload de metadados do álbum como JSON
      await uploadMetadata(
        {
          ...albumMetadata,
          artistId,
          artistName, 
          albumId,
          coverArt: coverArtResult.public_id,
          trackCount: audioFiles.length,
          tracks: tracks.map(track => ({
            trackId: track.trackId,
            trackNumber: track.trackNumber,
            title: track.title,
            publicId: track.publicId,
            duration: track.duration
          })),
          uploadDate: new Date().toISOString()
        },
        "", // Folder argument is empty as public_id dictates the path
        metadataPublicId,
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
