import { createFolderStructure, generateCloudinaryPublicId } from '@/utils/cloudinary/folderStructure';
import { CloudinaryUploadResult } from './cloudinaryService';
import { v4 as uuidv4 } from 'uuid';

export interface AlbumMetadata {
  title: string;
  description?: string;
  genre?: string;
  releaseDate?: string;
  visibility: 'public' | 'private' | 'followers';
  isExplicit: boolean;
  tags?: string[];
  artistId: string;
  artistName: string;
  tracks: Array<{
    title: string;
    duration?: number;
    order: number;
  }>;
}

interface TrackUploadResult extends CloudinaryUploadResult {
  order: number;
  title: string;
}

export interface AlbumUploadResult {
  albumId: string;
  coverArt?: CloudinaryUploadResult;
  tracks: TrackUploadResult[];
  metadata: AlbumMetadata;
}

class AlbumUploadService {
  private async uploadToCloudinary(
    file: File,
    publicId: string,
    resourceType: 'image' | 'video' | 'auto',
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
    formData.append('public_id', publicId);
    formData.append('resource_type', resourceType);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            publicId: response.public_id,
            url: response.url,
            secureUrl: response.secure_url,
            format: response.format,
            resourceType: response.resource_type
          });
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`);
      xhr.send(formData);
    });
  }

  async uploadAlbum(
    artistId: string,
    artistName: string,
    coverArt: File | null,
    tracks: File[],
    metadata: Omit<AlbumMetadata, 'artistId' | 'artistName' | 'tracks'>,
    onProgress?: (progress: number) => void
  ): Promise<AlbumUploadResult> {
    // Create album ID and folder structure
    const albumId = uuidv4();
    const folderStructure = createFolderStructure(artistName, 'album', metadata.title);
    
    let totalProgress = 0;
    const updateProgress = (progress: number) => {
      if (onProgress) {
        // Distribute progress across all files (cover + tracks)
        const fileWeight = 100 / (tracks.length + (coverArt ? 1 : 0));
        totalProgress = Math.min(100, totalProgress + (progress * fileWeight / 100));
        onProgress(totalProgress);
      }
    };

    try {
      const results: AlbumUploadResult = {
        albumId,
        tracks: [],
        metadata: {
          ...metadata,
          artistId,
          artistName,
          tracks: []
        }
      };

      // Upload cover art if provided
      if (coverArt) {
        const coverArtPublicId = generateCloudinaryPublicId(
          folderStructure,
          'cover_art'
        );
        
        results.coverArt = await this.uploadToCloudinary(
          coverArt,
          coverArtPublicId,
          'image',
          updateProgress
        );
      }

      // Upload tracks
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const trackPublicId = generateCloudinaryPublicId(
          folderStructure,
          `track_${i + 1}`
        );
        
        const uploadResult = await this.uploadToCloudinary(
          track,
          trackPublicId,
          'auto',
          updateProgress
        );

        const trackResult: TrackUploadResult = {
          ...uploadResult,
          order: i + 1,
          title: track.name.replace(/\.[^/.]+$/, "") // Remove extension
        };

        results.tracks.push(trackResult);
        results.metadata.tracks.push({
          title: trackResult.title,
          duration: 0, // Will be updated after processing
          order: i + 1
        });
      }

      // Upload metadata JSON
      const metadataPublicId = generateCloudinaryPublicId(
        folderStructure,
        'metadata'
      );
      
      const metadataBlob = new Blob([JSON.stringify(results.metadata)], { type: 'application/json' });
      const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });
      
      await this.uploadToCloudinary(
        metadataFile,
        metadataPublicId,
        'auto'
      );

      return results;
    } catch (error) {
      console.error('Error uploading album:', error);
      throw error;
    }
  }
}

export default new AlbumUploadService();
