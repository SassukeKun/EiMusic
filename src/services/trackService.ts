'use client'
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseBrowserClient } from '@/utils/supabaseClient'

export interface Artist {
  id: string
  name: string
  profile_image_url: string | null
}

export interface DisplayTrack {
  id: string
  title: string
  audio_url: string
  cover_image: string | null
  duration: number
  streams: number
  plays_count: number
  album?: string | null
  description?: string | null
  tags?: string[]
  lyrics?: string | null
  audio_quality?: string | null
  is_premium?: boolean
  likes_count?: number
  download_count?: number
  release_date?: string | null
  artist: {
    id: string
    name: string
    avatar: string | null
    verified?: boolean
  }
  genre?: string | null
}

/**
 * Fetches a record from `tracks` or `singles` (fallback) by ID and normalizes the
 * fields so the UI can consume them in a unified shape.
 */
export async function fetchTrackOrSingle(id: string): Promise<DisplayTrack | null> {
  const supabase = getSupabaseBrowserClient()

  // 1. Try the `tracks` table first
  const { data: track, error: trackError } = await supabase
    .from('tracks')
    .select(
      `id, title, file_url, cover_url, duration, streams, release_date, genre, artist:artists (id, name, profile_image_url)`
    )
    .eq('id', id)
    .single()

  if (track && !trackError) {
    return normalize(track)
  }

  // 2. Fallback to `singles`
  const { data: single, error: singleError } = await supabase
    .from('singles')
    .select(
      `id, title, file_url, cover_url, duration, streams, created_at, genre, artist:artists (id, name, profile_image_url)`
    )
    .eq('id', id)
    .single()

  if (single && !singleError) {
    return normalize(single)
  }

  console.error('fetchTrackOrSingle error', trackError ?? singleError)
  return null
}

function normalize(raw: Record<string, any>): DisplayTrack {
  return {
    id: raw.id,
    title: raw.title,
    audio_url: raw.file_url,
    cover_image: raw.cover_url ?? null,
    duration: raw.duration ?? 0,
    streams: raw.streams ?? 0,
    plays_count: raw.streams ?? 0,
    likes_count: raw.likes_count ?? 0,
    download_count: raw.download_count ?? 0,
    release_date: raw.release_date ?? raw.created_at ?? null,
    artist: {
      id: raw.artist?.id ?? '',
      name: raw.artist?.name ?? 'Desconhecido',
      avatar: raw.artist?.profile_image_url ?? null,
      verified: false
    },
    genre: raw.genre ?? null
  }
}

export async function getArtistTracks(artistId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getArtistTracks error', error)
  }
  return data ?? []
}

export async function getArtistSingles(artistId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('getArtistSingles error', error)
  }
  return data ?? []
}

const trackService = { fetchTrackOrSingle, getArtistTracks, getArtistSingles }
export default trackService