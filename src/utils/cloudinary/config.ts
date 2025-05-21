/**
 * Cloudinary configuration file
 * Contains all the configuration for Cloudinary uploads and media management
 */

// Cloudinary configuration types
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  folder: string;
}

// Folder structure for organizing assets in Cloudinary
export const CLOUDINARY_FOLDERS = {
  ARTISTS: 'eimusic/artists',
  USERS: 'eimusic/users',
  AUDIO: 'audio',
  VIDEO: 'video',
  IMAGES: 'images',
  PROFILE: 'profile',
  COVER_ART: 'cover-art',
  THUMBNAILS: 'thumbnails',
};

/**
 * Get Cloudinary configuration from environment variables
 */
export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
    folder: 'eimusic/temp/uploads', // Default folder for temp uploads
  };
}

/**
 * Generate folder path for artist media
 * @param artistId Artist unique ID
 * @param mediaType Type of media (audio, video)
 * @param mediaId Unique ID for the media item
 */
export function getArtistMediaPath(
  artistId: string,
  mediaType: 'audio' | 'video' | 'cover-art' | 'profile',
  mediaId?: string
): string {
  const basePath = `${CLOUDINARY_FOLDERS.ARTISTS}/${artistId}`;
  
  if (!mediaId) {
    return `${basePath}/${mediaType}`;
  }
  
  return `${basePath}/${mediaType}/${mediaId}`;
}

/**
 * Generate folder path for user profile media
 * @param userId User unique ID
 * @param mediaType Type of media (avatar, banner)
 */
export function getUserMediaPath(
  userId: string,
  mediaType: 'avatar' | 'banner'
): string {
  return `${CLOUDINARY_FOLDERS.USERS}/${userId}/profile/${mediaType}`;
}

/**
 * Get public URL for an asset in Cloudinary 
 * @param publicId Public ID of the Cloudinary asset
 */
export function getCloudinaryUrl(publicId: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
} 