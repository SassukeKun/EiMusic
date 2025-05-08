import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Inicializacao do cliente do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Buckets disponiveis para uploads
const BUCKETS = {
  SONGS: 'songs',
  VIDEOS: 'videos',
  IMAGES: 'images'
};

/**
 * Servico para lidar com uploads de arquivos para o Supabase storage
 */
export const uploadService = {
  /**
   * Upload de uma musica para o bucket de musicas
   * @param artistId - ID do artista fazendo upload da musica 
   * @param file - Arquivo de musica a ser subido
   * @returns URL do arquivo subido
   */
  async uploadSong(artistId: string, file: File) {
    // Criar um nome de arquivo unico com o prefixo do artista para organizacao
    const fileExt = file.name.split('.').pop();
    const fileName = `${artistId}/${uuidv4()}.${fileExt}`;
    
    // Upload do arquivo para o bucket de musicas
    const { error } = await supabase.storage
      .from(BUCKETS.SONGS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw error;
    }
    
    // Obter a URL publica do arquivo subido
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS.SONGS)
      .getPublicUrl(fileName);
    
    return publicUrl;
  },
  
  /**
   * Upload de um arquivo de video para o bucket de videos
   * @param artistId - ID do artista fazendo upload do video
   * @param file - Arquivo de video a ser subido
   * @returns URL do arquivo subido
   */
  async uploadVideo(artistId: string, file: File) {
    // Criar um nome de arquivo unico com o prefixo do artista para organizacao
    const fileExt = file.name.split('.').pop();
    const fileName = `${artistId}/${uuidv4()}.${fileExt}`;
    
    // Upload do arquivo para o bucket de videos
    const { error } = await supabase.storage
      .from(BUCKETS.VIDEOS)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw error;
    }
    
    // Obter a URL publica do arquivo subido
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS.VIDEOS)
      .getPublicUrl(fileName);
    
    return publicUrl;
  },
  
  /**
   * Upload de um arquivo de imagem (profile pictures, cover art, etc.)
   * @param folder - Subfolder dentro do bucket de imagens (e.g., 'profiles', 'covers')
   * @param file - Arquivo de imagem a ser subido
   * @returns URL do arquivo subido
   */
  async uploadImage(folder: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExt}`;
    
    // Upload do arquivo para o bucket de imagens
    const {  error } = await supabase.storage
      .from(BUCKETS.IMAGES)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      throw error;
    }
    
    // Obter a URL publica do arquivo subido
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKETS.IMAGES)
      .getPublicUrl(fileName);
    
    return publicUrl;
  }
};

export default uploadService; 