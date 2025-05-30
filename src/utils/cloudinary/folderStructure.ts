export const CLOUDINARY_ROOT = 'eimusic';

export type MediaType = 'single' | 'album' | 'video';

export interface FolderStructure {
  baseFolder: string;
  mediaFolder: string;
  contentFolder: string;
  metadataFolder: string;
  assetsFolder: string;
  thumbnails?: string; // Add thumbnails property
}

export function createFolderStructure(
  artistName: string, 
  mediaType: MediaType, 
  contentName: string
): FolderStructure {
  // Sanitize names for URL safety
  const safeArtistName = artistName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeContentName = contentName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  const baseFolder = `${CLOUDINARY_ROOT}/${safeArtistName}`;
  const mediaFolder = `${baseFolder}/${mediaType}`;
  const contentFolder = `${mediaFolder}/${safeContentName}`;
  
  return {
    baseFolder,
    mediaFolder,
    contentFolder,
    metadataFolder: `${contentFolder}/metadata`,
    assetsFolder: `${contentFolder}/assets`,
    thumbnails: `${contentFolder}/thumbnails` // Add thumbnails path
  };
}

export function getUploadPath(
  structure: FolderStructure,
  fileName: string,
  type: 'main' | 'cover' | 'thumbnail' | 'metadata'
): string {
  switch (type) {
    case 'main':
      return `${structure.assetsFolder}/${fileName}`;
    case 'cover':
      return `${structure.assetsFolder}/cover/${fileName}`;
    case 'thumbnail':
      return `${structure.assetsFolder}/thumbnail/${fileName}`;
    case 'metadata':
      return `${structure.metadataFolder}/${fileName}`;
  }
}
