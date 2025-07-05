import { getSafeSupabaseClient } from '../utils/supabaseClient';
import { z } from 'zod';

// Tipos para filtros de período
export type PeriodFilter = 'today' | 'week' | 'month' | 'year';

// Tipos para filtros de conteúdo
export type ContentFilter = 'all' | 'music' | 'video'

// Interface para itens trending
export interface TrendingItem {
  id: string;
  type: 'music' | 'video';
  title: string;
  artist: string;
  image: string;
  streams: number;
  views: number;
  duration: string;
  genre: string;
  created_at: string;
  trending_score: number;
}

// Schema para validação de filtros
const periodSchema = z.enum(['today', 'week', 'month', 'year']);
const contentSchema = z.enum(['all', 'music', 'video']);

export const trendingService = {
  /**
   * Calcula o score trending com base em streams/views e recência
   * @param streams - Número de streams (para músicas)
   * @param views - Número de views (para vídeos)
   * @param createdAt - Data de criação do conteúdo
   * @returns Score trending
   */
  calculateTrendingScore(
    streams: number,
    views: number = 0,
    createdAt: string
  ): number {
    // Calcula score baseado em streams/views
    const playScore = streams * 0.7 + views * 0.3;
    
    // Bônus por recência (conteúdos mais recentes têm score mais alto)
    const recencyBonus = new Date().getTime() - new Date(createdAt).getTime();
    const recencyMultiplier = 1 - (Math.min(recencyBonus, 2678400000) / 2678400000); // 31 dias em ms
    
    return playScore * recencyMultiplier;
  },

  /**
   * Obtém itens trending combinando dados de várias tabelas
   * @param period - Período para filtrar (today, week, month, year)
   * @param content - Tipo de conteúdo (all, music, video, artist, playlist)
   * @param search - Termo de busca
   * @param limit - Número máximo de itens
   * @param offset - Offset para paginação
   * @returns Lista de itens trending
   */
  async getTrendingItems(
    period: PeriodFilter,
    content: ContentFilter,
    search: string,
    limit: number,
    offset: number
  ): Promise<TrendingItem[]> {
    const supabase = getSafeSupabaseClient();
    const now = new Date();

    // Define o período de tempo baseado no filtro
    let startTime: Date;
    switch (period) {
      case 'today':
        startTime = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startTime = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startTime = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startTime = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    // Query base para todas as tabelas
    const baseQuery: Record<string, any> = {
      created_at: {
        gte: startTime.toISOString(),
        lte: now.toISOString()
      }
    };

    // Adiciona filtro de busca se houver
    if (search) {
      baseQuery.title = {
        ilike: `%${search}%`
      };
    }

    // Queries específicas para cada tipo de conteúdo
    const queries = {
      tracks: content === 'all' || content === 'music' ? 
        supabase
          .from('tracks')
          .select('id, title, cover_url, duration, streams, created_at, artist_id, artists(name, profile_image_url)')
          .eq('album_id', null) // Only standalone tracks
          .order('streams', { ascending: false })
          .range(offset, offset + limit - 1) : null,

      singles: content === 'all' || content === 'music' ? 
        supabase
          .from('singles')
          .select('id, title, cover_url, duration, streams, created_at, artist_id, artists(name, profile_image_url)')
          .order('streams', { ascending: false })
          .range(offset, offset + limit - 1) : null,

      videos: content === 'all' || content === 'video' ?
        supabase
          .from('videos')
          .select('id, title, thumbnail_url, duration, views, created_at, genre, artist_id, artists(name, profile_image_url)')
          .order('views', { ascending: false })
          .range(offset, offset + limit - 1) : null
    };

    // Execute queries in parallel
    const [tracksResult, singlesResult, videosResult] = await Promise.all([
      queries.tracks,
      queries.singles,
      queries.videos
    ]);

    // Combine and normalize results
    const normalizedResults: TrendingItem[] = [];

    // Process tracks
    if (tracksResult?.data) {
      normalizedResults.push(...tracksResult.data.map(track => {
        const artistObj = Array.isArray(track.artists) ? track.artists[0] : track.artists;
        return {
          id: track.id,
          type: 'music' as const,
          title: track.title,
          artist: artistObj?.name || '',
          image: track.cover_url || artistObj?.profile_image_url || '',
          streams: track.streams,
          views: 0,
          duration: track.duration?.toString() || '',
          genre: '',
          created_at: track.created_at,
          trending_score: this.calculateTrendingScore(track.streams, 0, track.created_at)
        };
      }));
    }

    // Process singles
    if (singlesResult?.data) {
      normalizedResults.push(...singlesResult.data.map(single => {
        const artistObj = Array.isArray(single.artists) ? single.artists[0] : single.artists;
        return {
          id: single.id,
          type: 'music' as const,
          title: single.title,
          artist: artistObj?.name || '',
          image: single.cover_url || artistObj?.profile_image_url || '',
          streams: single.streams,
          views: 0,
          duration: single.duration?.toString() || '',
          genre: '',
          created_at: single.created_at,
          trending_score: this.calculateTrendingScore(single.streams, 0, single.created_at)
        };
      }));
    }

    // Process videos
    if (videosResult?.data) {
      normalizedResults.push(...videosResult.data.map(video => {
        const artistObj = Array.isArray(video.artists) ? video.artists[0] : video.artists;
        return {
          id: video.id,
          type: 'video' as const,
          title: video.title,
          artist: artistObj?.name || '',
          image: video.thumbnail_url || artistObj?.profile_image_url || '',
          streams: 0,
          views: video.views,
          duration: video.duration?.toString() || '',
          genre: video.genre || '',
          created_at: video.created_at,
          trending_score: this.calculateTrendingScore(0, video.views, video.created_at)
        };
      }));
    }

    // Sort by trending score
    normalizedResults.sort((a, b) => b.trending_score - a.trending_score);

    return normalizedResults.slice(0, limit);
  }
};
