'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/utils/supabaseClient';

export interface Track {
  streams: number;
  id: string;
  title: string;
  cover_url: string | null;
  file_url: string;
}

interface PlayerContextType {
  track: Track | null;
  playing: boolean;
  progress: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8); // 0 to 1
  const audioRef = useRef<HTMLAudioElement>(null);

  // When track changes, load and play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.src = track.file_url;
    audio.play();
    setPlaying(true);

    // increment streams count
    getSupabaseBrowserClient()
      .from('singles')
      .update({ streams: track.streams! + 1 })
      .eq('id', track.id)
      .then(({ error }) => {
        if (error) console.error('Error incrementing streams:', error);
      });
  }, [track]);

  // Volume control effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Track progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => setProgress((audio.currentTime / audio.duration) * 100);
    const onEnd = () => setPlaying(false);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const playTrack = (t: Track) => {
    setTrack(t);
  };
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause(); else audio.play();
    setPlaying(!playing);
  };

  const seek = (time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  return (
    <PlayerContext.Provider value={{ track, playing, progress, duration, volume, setVolume, seek, playTrack, togglePlay }}>
      {children}
      <audio ref={audioRef} hidden />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
