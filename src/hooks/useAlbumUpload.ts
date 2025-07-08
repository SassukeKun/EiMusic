import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import albumUploadService, { AlbumMetadata, AlbumUploadResult } from '@/services/albumUploadService';

interface AlbumUploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UseAlbumUploadReturn {
  uploadState: AlbumUploadProgress;
  uploadAlbum: (
    coverArt: File | null,
    tracks: File[],
    metadata: Omit<AlbumMetadata, 'artistId' | 'artistName' | 'tracks'>
  ) => Promise<AlbumUploadResult | null>;
  resetUploadState: () => void;
}

export function useAlbumUpload(): UseAlbumUploadReturn {
  const { user, isArtist } = useAuth();
  const [uploadState, setUploadState] = useState<AlbumUploadProgress>({
    isUploading: false,
    progress: 0,
    error: null
  });

  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null
    });
  }, []);

  const uploadAlbum = useCallback(async (
    coverArt: File | null,
    tracks: File[],
    metadata: Omit<AlbumMetadata, 'artistId' | 'artistName' | 'tracks'>
  ): Promise<AlbumUploadResult | null> => {
    if (!user || !isArtist) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Only artists can upload albums'
      });
      return null;
    }

    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null
      });

      // Get artist name from user metadata or email
      const artistName = (user.user_metadata?.artist_name as string) || 
                        (user.user_metadata?.full_name as string) ||
                        user.email?.split('@')[0] ||
                        'unknown_artist';

      const result = await albumUploadService.uploadAlbum(
        user.id,
        artistName,
        coverArt,
        tracks,
        metadata,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress
          }));
        }
      );

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      });

      return result;
    } catch (error: any) {
      console.log('Error uploading album:', error);
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || 'Failed to upload album'
      });

      return null;
    }
  }, [user, isArtist]);

  return {
    uploadState,
    uploadAlbum,
    resetUploadState
  };
}
