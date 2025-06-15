'use client';

import React from 'react';
import { FaPlay } from 'react-icons/fa';
import { usePlayer, Track } from '@/context/PlayerContext';

interface SongControlsProps {
  single: Track;
}

export default function SongControls({ single }: SongControlsProps) {
  const { playTrack } = usePlayer();
  return (
    <div className="mt-6 flex justify-center">
      <button
        onClick={() => playTrack(single)}
        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-semibold transition"
      >
        <FaPlay />
        <span>Play</span>
      </button>
    </div>
  );
}
