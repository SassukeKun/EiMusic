import supabase from '../utils/supabaseClient';
import { Artist, CreateArtistInput } from '../models/artist';
import { Track } from '../models/track';

/**
 * Servico para lidar com as operacoes relacionadas a artistas
 */
export const artistService = {
  /**
   * Obter um artista pelo ID
   * @param id - ID do artista
   * @returns Dados do artista ou null se nao encontrado
   */
  async getArtistById(id: string): Promise<Artist | null> {
    // Obter artista do Supabase 
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Artist;
  },
  
  /**
   * Obter as musicas de um artista
   * @param artistId - ID do artista
   * @returns Lista de musicas do artista
   */
  async getArtistTracks(artistId: string): Promise<Track[]> {
    // Obter musicas de um artista especifico
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as Track[];
  },
  
  /**
   * Criar um novo artista
   * @param artistData - Dados do artista para criacao
   * @returns Dados do artista criado
   */
  async createArtist(artistData: CreateArtistInput): Promise<Artist> {
    // Criar novo artista no Supabase
    const { data, error } = await supabase
      .from('artists')
      .insert(artistData)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Artist;
  },
  
  /**
   * Atualizar um artista existente
   * @param id - ID do artista
   * @param artistData - Dados do artista atualizados
   * @returns Dados do artista atualizados
   */
  async updateArtist(id: string, artistData: Partial<Artist>): Promise<Artist> {
    // Atualizar artista no Supabase
    const { data, error } = await supabase
      .from('artists')
      .update(artistData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as Artist;
  },
  
  /**
   * Obter artistas em alta
   * @param limit - Numero de artistas a retornar
   * @returns Lista de artistas em alta
   */
  async getTrendingArtists(limit: number = 10): Promise<Artist[]> {
    // Obter artistas em alta do Supabase
    // Este teria um criterio mais complexo em um app real
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('followers_count', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return data as Artist[];
  }
};

export default artistService; 