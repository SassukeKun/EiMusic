/**
 * Cloudinary configuration file
 * Contains all the configuration for Cloudinary uploads and media management
 */

// Cloudinary configuration types
export interface CloudinaryConfig {
  cloudName: string
  apiKey: string
  uploadPreset: string
  folder: string
}

// Folder structure for organizing assets in Cloudinary
export const CLOUDINARY_FOLDERS = {
  ROOT: 'eimusic',
  ARTISTS: 'eimusic',
  USERS: 'eimusic/users',
  SINGLE: 'single',
  ALBUM: 'album',
  VIDEO: 'video',
  IMAGES: 'images',
  PROFILE: 'profile',
  COVER_ART: 'cover',
  THUMBNAILS: 'thumbnails',
  METADATA: 'metadata',
  COMMUNITIES: 'communities',
}

// Get Cloudinary configuration from environment variables
export function getCloudinaryConfig(): CloudinaryConfig {
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
    uploadPreset:
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
    folder: 'eimusic/temp/uploads', // Default folder for temp uploads
  }
}

/**
 * Generate folder path for artist media
 * @param artistId Artist unique ID or artist name
 * @param mediaType Type of media (single, album, video, profile)
 * @param title Title of the media item (song name, album name, video name)
 */
export function getArtistMediaPath(
  artistId: string,
  mediaType: 'single' | 'album' | 'video' | 'profile',
  title?: string
): string {
  const safeArtistId = artistId
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
  const basePath = `${CLOUDINARY_FOLDERS.ROOT}/${safeArtistId}`
  if (!title) return `${basePath}/${mediaType}`

  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
  return `${basePath}/${mediaType}/${safeTitle}`
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
  return `${CLOUDINARY_FOLDERS.USERS}/${userId}/profile/${mediaType}`
}

/**
 * Generate folder path for community media
 * @param communityId Community unique ID
 * @param mediaType Type of media (image, video, other)
 * @param title Optional title for the media (for subfolder)
 */
export function getCommunityMediaPath(
  communityId: string,
  mediaType: 'image' | 'video' | 'other',
  title?: string
): string {
  const safeId = communityId
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
  const base = `${CLOUDINARY_FOLDERS.ROOT}/${CLOUDINARY_FOLDERS.COMMUNITIES}/${safeId}`
  if (!title) return `${base}/${mediaType}`

  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
  return `${base}/${mediaType}/${safeTitle}`
}

/**
 * Get public URL for an asset in Cloudinary 
 * @param publicId Public ID of the Cloudinary asset
 */
export function getCloudinaryUrl(publicId: string): string {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`
}