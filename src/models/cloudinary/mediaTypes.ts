/**
 * Media types for Cloudinary uploads
 * Define types and interfaces for various media types
 */

// Base metadata interface for all media types
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

// Audio-specific metadata
export interface AudioMetadata extends MediaMetadata {
  bpm?: number; // Beats per minute
  key?: string; // Musical key
  lyrics?: string;
  isOriginal: boolean;
  isExplicit: boolean;
  featuredArtists?: string[];
}

// Video-specific metadata
export interface VideoMetadata extends MediaMetadata {
  isVideoClip?: boolean;
  director?: string;
  featuredArtists?: string[];
}

// Image metadata
export interface ImageMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  uploadDate: string;
  width?: number;
  height?: number;
  usage: 'avatar' | 'banner' | 'cover' | 'thumbnail' | 'other';
}

// Result from a successful Cloudinary upload
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

// Audio track model (for database)
export interface Track {
  id: string;
  artistId: string;
  title: string;
  description?: string;
  coverArtUrl?: string;
  audioUrl: string;
  genre?: string;
  mood?: string;
  duration?: number;
  playCount: number;
  likeCount: number;
  isExplicit: boolean;
  releaseDate?: string;
  uploadDate: string;
  visibility: 'public' | 'private' | 'followers';
  cloudinaryPublicId: string;
  featuredArtists?: string[];
  tags?: string[];
}

// Video clip model (for database)
export interface VideoClip {
  id: string;
  artistId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  duration?: number;
  viewCount: number;
  likeCount: number;
  genre?: string;
  releaseDate?: string;
  uploadDate: string;
  visibility: 'public' | 'private' | 'followers';
  cloudinaryPublicId: string;
  isVideoClip: boolean;
  director?: string;
  featuredArtists?: string[];
  tags?: string[];
}

// Profile image model
export interface ProfileImage {
  userId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  type: 'avatar' | 'banner';
  uploadDate: string;
  cloudinaryPublicId: string;
}

// Media asset with transformed URLs
export interface MediaAsset {
  id: string;
  originalUrl: string;
  transformedUrls: Record<string, string>;
  metadata: MediaMetadata | AudioMetadata | VideoMetadata | ImageMetadata;
  type: 'audio' | 'video' | 'image';
}