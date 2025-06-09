export const CLOUDINARY_ROOT = 'eimusic';

export type MediaType = 'single' | 'album' | 'video';

export interface FolderPaths {
  root: string;           // eimusic/artist_name
  mediaFolder: string;    // eimusic/artist_name/media_type
  contentFolder: string;  // eimusic/artist_name/media_type/content_name
  ficheirosFolder: string; // eimusic/artist_name/media_type/content_name/ficheiros
}

export function createFolderStructure(
  artistName: string,
  mediaType: MediaType,
  contentName: string
): FolderPaths {
  // Sanitize names for URL safety
  const safeArtistName = artistName.toLowerCase().replace(/[^a-z0-9_.-]/g, '_').replace(/_{2,}/g, '_');
  const safeContentName = contentName.toLowerCase().replace(/[^a-z0-9_.-]/g, '_').replace(/_{2,}/g, '_');

  // Build folder structure
  const root = `${CLOUDINARY_ROOT}/${safeArtistName}`;
  const mediaFolder = `${root}/${mediaType}`;
  const contentFolder = `${mediaFolder}/${safeContentName}`;
  const ficheirosFolder = `${contentFolder}/ficheiros`;

  return {
    root,
    mediaFolder,
    contentFolder,
    ficheirosFolder
  };
}

export function generateCloudinaryPublicId(
  folderPaths: FolderPaths,
  fileName: string, // e.g., 'track_1', 'cover_art', 'metadata'
  fileType: 'track' | 'cover' | 'metadata' = 'track'
): string {
  return `${folderPaths.ficheirosFolder}/${fileType}_${fileName}`;
}
