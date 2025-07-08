'use client'

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  AudioMetadata, 
  VideoMetadata, 
  CloudinaryUploadResult, 
  ImageMetadata 
} from '@/models/cloudinary/mediaTypes';

export interface UploadProgress {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface UseSecureCloudinaryUploadReturn {
  // Upload state
  uploadState: UploadProgress;
  
  // Upload functions
  uploadAudio: (file: File, metadata: Omit<AudioMetadata, 'uploadDate'>, coverArt?: File) => Promise<CloudinaryUploadResult | null>;
  uploadVideo: (file: File, metadata: Omit<VideoMetadata, 'uploadDate'>, thumbnail?: File) => Promise<CloudinaryUploadResult | null>;
  uploadProfileImage: (file: File, type: 'avatar' | 'banner') => Promise<CloudinaryUploadResult | null>;
  
  // Reset upload state
  resetUploadState: () => void;
}

/**
 * Custom hook for secure uploads to Cloudinary
 * Uses the server API to generate signed URLs and handles the direct upload
 */
export function useSecureCloudinaryUpload(): UseSecureCloudinaryUploadReturn {
  const { user, isArtist } = useAuth();
  const [uploadState, setUploadState] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    error: null
  });
  
  // Reset upload state
  const resetUploadState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null
    });
  }, []);
  
  // Get signed upload parameters from server
  const getSignedUploadParams = useCallback(async (
    mediaType: string,
    resourceType: string,
    isArtistUpload: boolean,
    filename: string,
    profileType?: 'avatar' | 'banner'
  ) => {
    try {
      const response = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType,
          resourceType,
          isArtistUpload,
          filename,
          profileType
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get upload signature');
      }
      
      return await response.json();
    } catch (error: any) {
      console.log('Error getting signed upload parameters:', error);
      throw error;
    }
  }, []);
  
  // Perform the actual upload to Cloudinary
  const uploadToCloudinary = useCallback(async (
    file: File,
    params: any,
    onProgress?: (progress: number) => void
  ): Promise<CloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      
      // Add all required parameters including upload preset
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'eimusic_upload_preset');
      formData.append('api_key', params.apiKey);
      formData.append('timestamp', params.timestamp);
      formData.append('signature', params.signature);
      formData.append('folder', params.folder);
      formData.append('public_id', params.publicId);
      formData.append('resource_type', params.resourceType);

      // Add context and tags if provided
      if (params.context) {
        formData.append('context', JSON.stringify(params.context));
      }
      if (params.tags) {
        formData.append('tags', params.tags.join(','));
      }
      
      // Setup progress monitoring
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            publicId: response.public_id,
            url: response.url,
            secureUrl: response.secure_url,
            format: response.format,
            width: response.width,
            height: response.height,
            duration: response.duration,
            resourceType: response.resource_type
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Upload failed due to network error'));
      };
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${params.cloudName}/upload`);
      xhr.send(formData);
    });
  }, []);
  
  // Upload audio with metadata
  const uploadAudio = useCallback(async (
    file: File,
    metadata: Omit<AudioMetadata, 'uploadDate'>,
    coverArt?: File
  ): Promise<CloudinaryUploadResult | null> => {
    if (!user || !isArtist) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Only artists can upload audio'
      });
      return null;
    }
    
    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null
      });
      
      // Get signed upload parameters for audio
      const signedParams = await getSignedUploadParams(
        'audio',
        'auto',
        true,
        file.name
      );
      
      // Upload the audio file
      const result = await uploadToCloudinary(
        file,
        signedParams,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress: coverArt ? Math.round(progress * 0.8) : progress
          }));
        }
      );
      
      // If we have cover art, upload it too
      if (coverArt) {
        // Extract the media ID from the path
        const pathParts = result.publicId.split('/');
        const mediaId = pathParts[pathParts.length - 2];
        
        // Get signed params for cover art
        const coverParams = await getSignedUploadParams(
          'cover-art',
          'image',
          true,
          coverArt.name
        );
        
        // Upload the cover art
        await uploadToCloudinary(
          coverArt,
          coverParams,
          (progress) => {
            setUploadState(prev => ({
              ...prev,
              progress: 80 + Math.round(progress * 0.2)
            }));
          }
        );
      }
      
      // Upload complete
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      });
      
      return result;
    } catch (error: any) {
      console.log('Error uploading audio:', error);
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || 'Failed to upload audio'
      });
      
      return null;
    }
  }, [user, isArtist, getSignedUploadParams, uploadToCloudinary]);
  
  // Upload video with metadata
  const uploadVideo = useCallback(async (
    file: File,
    metadata: Omit<VideoMetadata, 'uploadDate'>,
    thumbnail?: File
  ): Promise<CloudinaryUploadResult | null> => {
    if (!user || !isArtist) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Only artists can upload videos'
      });
      return null;
    }
    
    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null
      });
      
      // Get signed upload parameters for video
      const signedParams = await getSignedUploadParams(
        'video',
        'video',
        true,
        file.name
      );
      
      // Upload the video file
      const result = await uploadToCloudinary(
        file,
        signedParams,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress: thumbnail ? Math.round(progress * 0.8) : progress
          }));
        }
      );
      
      // If we have a thumbnail, upload it too
      if (thumbnail) {
        // Extract the media ID from the path
        const pathParts = result.publicId.split('/');
        const mediaId = pathParts[pathParts.length - 2];
        
        // Get signed params for thumbnail
        const thumbnailParams = await getSignedUploadParams(
          'thumbnails',
          'image',
          true,
          thumbnail.name
        );
        
        // Upload the thumbnail
        await uploadToCloudinary(
          thumbnail,
          thumbnailParams,
          (progress) => {
            setUploadState(prev => ({
              ...prev,
              progress: 80 + Math.round(progress * 0.2)
            }));
          }
        );
      }
      
      // Upload complete
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      });
      
      return result;
    } catch (error: any) {
      console.log('Error uploading video:', error);
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || 'Failed to upload video'
      });
      
      return null;
    }
  }, [user, isArtist, getSignedUploadParams, uploadToCloudinary]);
  
  // Upload profile image (avatar or banner)
  const uploadProfileImage = useCallback(async (
    file: File,
    type: 'avatar' | 'banner'
  ): Promise<CloudinaryUploadResult | null> => {
    if (!user) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'You must be logged in to upload profile images'
      });
      return null;
    }
    
    try {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null
      });
      
      // Get signed upload parameters for profile image
      const signedParams = await getSignedUploadParams(
        'profile',
        'image',
        isArtist,
        file.name,
        type
      );
      
      // Upload the image file
      const result = await uploadToCloudinary(
        file,
        signedParams,
        (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress
          }));
        }
      );
      
      // Upload complete
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      });
      
      return result;
    } catch (error: any) {
      console.log(`Error uploading ${type}:`, error);
      
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error.message || `Failed to upload ${type}`
      });
      
      return null;
    }
  }, [user, isArtist, getSignedUploadParams, uploadToCloudinary]);
  
  return {
    uploadState,
    uploadAudio,
    uploadVideo,
    uploadProfileImage,
    resetUploadState
  };
}