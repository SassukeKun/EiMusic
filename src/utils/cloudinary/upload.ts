/**
 * Cloudinary upload utilities
 * Functions to simplify uploading different media types to Cloudinary
 */

import { v4 as uuidv4 } from 'uuid';
import { getCloudinaryConfig } from './config';

// Response type from Cloudinary upload
export interface CloudinaryResponse {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  [key: string]: any;
}

/**
 * Upload a file to Cloudinary
 * @param file File to upload
 * @param options Upload options
 */
export async function uploadToCloudinary(
  file: File,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: 'image' | 'video' | 'auto' | 'raw';
    tags?: string[];
    context?: Record<string, any>;
    transformation?: Record<string, any>;
    eager?: Array<Record<string, any>>;
  } = {}
): Promise<CloudinaryResponse> {
  const config = getCloudinaryConfig();
  
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('Cloudinary configuration is missing');
  }
  
  // Create form data for the upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.uploadPreset);
  
  // Add folder if specified
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  
  // Add public ID if specified or generate one
  if (options.publicId) {
    formData.append('public_id', options.publicId);
  }
  
  // Add resource type (defaults to 'auto')
  formData.append('resource_type', options.resourceType || 'auto');
  
  // Add tags if specified
  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','));
  }
  
  // Add context if specified
  if (options.context) {
    formData.append('context', JSON.stringify(options.context));
  }
  
  // Add eager transformations if specified
  if (options.eager && options.eager.length > 0) {
    formData.append('eager', JSON.stringify(options.eager));
  }
  
  // Upload to Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText}${
        errorData ? ` - ${JSON.stringify(errorData)}` : ''
      }`
    );
  }
  
  return response.json();
}

/**
 * Generate a unique ID for a media item
 */
export function generateMediaId(): string {
  return uuidv4();
}

/**
 * Create a file from JSON data for metadata uploads
 * @param data JSON data to convert to file
 * @param filename Filename for the created file
 */
export function createJsonFile(
  data: any,
  filename = 'metadata.json'
): File {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  return new File([blob], filename, { type: 'application/json' });
}

/**
 * Upload JSON metadata file to Cloudinary
 * @param data JSON data to upload
 * @param folder Cloudinary folder to store the file
 * @param publicId Public ID for the file
 * @param tags Tags to apply to the file
 */
export async function uploadJsonMetadata(
  data: any,
  folder: string,
  publicId: string,
  tags: string[] = []
): Promise<CloudinaryResponse> {
  const file = createJsonFile(data);
  
  return uploadToCloudinary(file, {
    folder,
    publicId,
    resourceType: 'raw',
    tags,
  });
} 