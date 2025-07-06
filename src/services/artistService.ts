import { getSafeSupabaseClient } from '../utils/supabaseClient';
import { Artist, CreateArtistInput } from '../models/artist';
import { Track } from '../models/track';

/**
 * Servico para lidar com as operacoes relacionadas a artistas
 */
export const artistService = {
  /**
   * Contar apoios (doações) recebidos pelo artista nos últimos 30 dias
   */
  async getMonthlyDonationsCount(artistId: string): Promise<number> {
    const supabase = getSafeSupabaseClient();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // Fazemos head=True para reduzir payload, count exact
    const { count, error } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('artist_id', artistId)
      .gte('created_at', thirtyDaysAgo.toISOString());
    if (error && error.code !== 'PGRST116') {
      console.warn('getMonthlyDonationsCount error', error);
    }
    return count || 0;
  },
  /**
   * Obter um artista pelo ID
   * @param id - ID do artista
   * @returns Dados do artista ou null se nao encontrado
   */
  async getArtistById(id: string): Promise<Artist | null> {
    const supabase = getSafeSupabaseClient();

    // 1. Fetch base artist row
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (artistError) {
      throw artistError;
    }
    if (!artist) return null;

    // 2. Fetch monthly metrics (can fail independently without breaking the whole request)
    const { data: metrics, error: metricsError } = await supabase
      .from('artist_monthly_metrics')
      .select('monthly_listeners')
      .eq('artist_id', id)
      .maybeSingle();
    if (metricsError) {
      // Log but don't block – view may not exist or lack FK relationship
      console.warn('artist_monthly_metrics error', metricsError);
    }

    // 3. Fetch songs count view
    const { data: countData, error: countError } = await supabase
      .from('artist_songs_count')
      .select('total_songs_count')
      .eq('artist_id', id)
      .maybeSingle();
    if (countError) {
      console.warn('artist_songs_count error', countError);
    }

    const monthlyListeners = metrics?.monthly_listeners ?? 0;
    const songsCount = countData?.total_songs_count ?? 0;

    return {
      ...artist,
      monthlyListeners,
      songsCount,
    } as Artist;
  },
  
  /**
   * Obter as musicas de um artista
   * @param artistId - ID do artista
   * @returns Lista de musicas do artista
   */
  async getArtistTracks(artistId: string): Promise<Track[]> {
    const supabase = getSafeSupabaseClient();
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
   * Deletar uma música do artista
   * @param musicId - ID da música a ser deletada
   * @returns Promise<void>
   */
  async deleteMusic(musicId: string): Promise<void> {
    const supabase = getSafeSupabaseClient();
    const { error } = await supabase
      .from('tracks')
      .delete()
      .eq('id', musicId);
    
    if (error) {
      throw error;
    }
  },

  /**
   * Deletar um vídeo do artista
   * @param videoId - ID do vídeo a ser deletado
   * @returns Promise<void>
   */
  async deleteVideo(videoId: string): Promise<void> {
    const supabase = getSafeSupabaseClient();
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId);
    
    if (error) {
      throw error;
    }
  },

  /**
   * Criar um novo artista
   * @param artistData - Dados do artista para criacao
   * @returns Dados do artista criado
   */
  async createArtist(artistData: CreateArtistInput): Promise<Artist> {
    const supabase = getSafeSupabaseClient();
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
  async updateArtist(id: string, artistData: Partial<Artist>): Promise<Artist | null> {
    const supabase = getSafeSupabaseClient();
    // Atualizar artista no Supabase
    const { data, error } = await supabase
      .from('artists')
      .update(artistData)
      .eq('id', id)
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return (data ?? null) as Artist | null;
  },
  
  /**
   * Obter artistas em alta
   * @param limit - Numero de artistas a retornar
   * @returns Lista de artistas em alta
   */
  // FOLLOW helpers ----------------------------------------------------
  /**
   * Check if a user already follows an artist
   */
  async isUserFollowing(artistId: string, userId: string): Promise<boolean> {
    const supabase = getSafeSupabaseClient();
    const { data, error } = await supabase
      .from('artist_followers')
      .select('id')
      .eq('artist_id', artistId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') {
      console.warn('isUserFollowing error', error);
    }
    return !!data;
  },

  /** Follow artist (persist) */
  async followArtist(artistId: string, userId: string): Promise<void> {
    const supabase = getSafeSupabaseClient();
    await supabase.from('artist_followers').upsert({ artist_id: artistId, user_id: userId });
    await supabase
      .from('artists')
      .update({ subscribers: (await this.getArtistSubscribers(artistId)) + 1 })
      .eq('id', artistId);
  },

  /** Unfollow artist */
  async unfollowArtist(artistId: string, userId: string): Promise<void> {
    const supabase = getSafeSupabaseClient();
    await supabase
      .from('artist_followers')
      .delete()
      .eq('artist_id', artistId)
      .eq('user_id', userId);
    const current = await this.getArtistSubscribers(artistId);
    await supabase.from('artists').update({ subscribers: Math.max(current - 1, 0) }).eq('id', artistId);
  },

  /** helper to fetch subscribers */
  async getArtistSubscribers(artistId: string): Promise<number> {
    const supabase = getSafeSupabaseClient();
    const { data } = await supabase.from('artists').select('subscribers').eq('id', artistId).maybeSingle();
    return data?.subscribers ?? 0;
  },

  async getTrendingArtists(limit: number = 10): Promise<Artist[]> {
    const supabase = getSafeSupabaseClient();
    // Obter artistas em alta do Supabase
    // Este teria um criterio mais complexo em um app real
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('subscribers', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    
    return data as Artist[];
  }
};

export default artistService; 