/**
 * Cloudinary transformation utilities
 * Functions to generate transformation URLs for images and videos
 */

// Import types from Cloudinary config
import { getCloudinaryConfig } from './config';

// Image transformation options
export interface ImageTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'thumb' | 'crop';
  aspectRatio?: string;
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  quality?: 'auto' | number;
  format?: 'auto' | 'jpg' | 'png' | 'webp' | 'avif';
  effect?: string;
  blur?: number;
  border?: string;
  background?: string;
  radius?: number | string;
  dpr?: 'auto' | number;
}

// Video transformation options
export interface VideoTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'scale' | 'fit' | 'pad';
  quality?: 'auto:low' | 'auto:good' | 'auto:best' | number;
  format?: 'mp4' | 'webm' | 'ogv';
  duration?: number;
  startOffset?: number | string;
  endOffset?: number | string;
  bitRate?: string | number;
  audioCodec?: string;
  videoCodec?: string;
}

/**
 * Generate transformation URL for images
 * @param publicId Cloudinary public ID
 * @param options Transformation options
 * @returns Transformed image URL
 */
export function getImageUrl(publicId: string, options: ImageTransformationOptions = {}): string {
  const config = getCloudinaryConfig();
  const cloudName = config.cloudName;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is missing');
  }
  
  // Build transformation string
  const transformations: string[] = [];
  
  if (options.width || options.height) {
    const width = options.width ? `w_${options.width}` : '';
    const height = options.height ? `h_${options.height}` : '';
    const crop = options.crop ? `c_${options.crop}` : '';
    
    transformations.push([width, height, crop].filter(Boolean).join(','));
  }
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }
  
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }
  
  if (options.gravity) {
    transformations.push(`g_${options.gravity}`);
  }
  
  if (options.effect) {
    transformations.push(`e_${options.effect}`);
  }
  
  if (options.aspectRatio) {
    transformations.push(`ar_${options.aspectRatio}`);
  }
  
  if (options.blur) {
    transformations.push(`e_blur:${options.blur}`);
  }
  
  if (options.border) {
    transformations.push(`bo_${options.border}`);
  }
  
  if (options.background) {
    transformations.push(`b_${options.background}`);
  }
  
  if (options.radius) {
    transformations.push(`r_${options.radius}`);
  }
  
  if (options.dpr) {
    transformations.push(`dpr_${options.dpr}`);
  }
  
  // Build the full URL
  const transformationString = transformations.length > 0 
    ? transformations.join('/') + '/'
    : '';
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}${publicId}`;
}

/**
 * Generate transformation URL for videos
 * @param publicId Cloudinary public ID
 * @param options Transformation options
 * @returns Transformed video URL
 */
export function getVideoUrl(publicId: string, options: VideoTransformationOptions = {}): string {
  const config = getCloudinaryConfig();
  const cloudName = config.cloudName;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is missing');
  }
  
  // Build transformation string
  const transformations: string[] = [];
  
  if (options.width || options.height) {
    const width = options.width ? `w_${options.width}` : '';
    const height = options.height ? `h_${options.height}` : '';
    const crop = options.crop ? `c_${options.crop}` : '';
    
    transformations.push([width, height, crop].filter(Boolean).join(','));
  }
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }
  
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }
  
  if (options.duration) {
    transformations.push(`du_${options.duration}`);
  }
  
  if (options.startOffset) {
    transformations.push(`so_${options.startOffset}`);
  }
  
  if (options.endOffset) {
    transformations.push(`eo_${options.endOffset}`);
  }
  
  if (options.bitRate) {
    transformations.push(`br_${options.bitRate}`);
  }
  
  if (options.audioCodec) {
    transformations.push(`ac_${options.audioCodec}`);
  }
  
  if (options.videoCodec) {
    transformations.push(`vc_${options.videoCodec}`);
  }
  
  // Build the full URL
  const transformationString = transformations.length > 0 
    ? transformations.join('/') + '/'
    : '';
  
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}${publicId}`;
}

/**
 * Generate video thumbnail URL
 * @param publicId Cloudinary public ID
 * @param options Thumbnail options
 * @returns Thumbnail URL
 */
export function getVideoThumbnailUrl(
  publicId: string, 
  options: ImageTransformationOptions & { second?: number } = {}
): string {
  const second = options.second || 0;
  return getImageUrl(publicId, {
    ...options,
    effect: `video:${second}`
  });
}

/**
 * Generate multiple image variations with different sizes
 * @param publicId Cloudinary public ID
 * @param sizes Array of width/height pairs
 * @param baseOptions Base transformation options
 * @returns Object with different sized URLs
 */
export function getResponsiveImageUrls(
  publicId: string,
  sizes: { width: number; height?: number }[],
  baseOptions: Omit<ImageTransformationOptions, 'width' | 'height'> = {}
): Record<string, string> {
  return sizes.reduce((acc, { width, height }) => {
    const key = `w${width}${height ? `h${height}` : ''}`;
    acc[key] = getImageUrl(publicId, {
      ...baseOptions,
      width,
      height,
    });
    return acc;
  }, {} as Record<string, string>);
} 