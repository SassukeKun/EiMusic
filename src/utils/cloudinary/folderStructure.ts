export const CLOUDINARY_ROOT = 'eimusic';

export type MediaType = 'single' | 'album' | 'video';

// Updated FolderStructure interface
// It now primarily stores the full path to the 'ficheiros' directory for a given piece of content.
export interface FolderStructure {
  // Example: eimusic/artist_name/media_type/content_name/ficheiros
  basePathToFicheiros: string;
}

export function createFolderStructure(
  artistName: string,
  mediaType: MediaType,
  contentName: string
): FolderStructure {
  // Sanitize names for URL safety: allow letters, numbers, underscore, hyphen, dot.
  // Replace other special characters with underscore and collapse multiple underscores.
  const safeArtistName = artistName.toLowerCase().replace(/[^a-z0-9_.-]/g, '_').replace(/_{2,}/g, '_');
  const safeContentName = contentName.toLowerCase().replace(/[^a-z0-9_.-]/g, '_').replace(/_{2,}/g, '_');

  // This path is the full path on Cloudinary including the root directory 'eimusic'
  const basePathToFicheiros = `${CLOUDINARY_ROOT}/${safeArtistName}/${mediaType}/${safeContentName}/ficheiros`;

  return {
    basePathToFicheiros,
  };
}

// Generates the public_id for Cloudinary.
// This public_id is the path relative to the 'eimusic/' asset folder defined in the upload preset.
// Example result: artist_name/media_type/content_name/ficheiros/desired_file_name_or_id
export function generateCloudinaryPublicId(
  structure: FolderStructure,
  fileNameIdentifier: string // e.g., 'track_main', 'cover_art', 'metadata_info'. No file extension needed here.
): string {
  // Remove 'eimusic/' from the beginning of basePathToFicheiros to get the path relative to the preset's asset_folder
  const relativePathToFicheiros = structure.basePathToFicheiros.startsWith(CLOUDINARY_ROOT + '/')
    ? structure.basePathToFicheiros.substring(CLOUDINARY_ROOT.length + 1)
    : structure.basePathToFicheiros; // This case should ideally not be hit if CLOUDINARY_ROOT is always prefixed

  return `${relativePathToFicheiros}/${fileNameIdentifier}`;
}
