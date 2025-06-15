'use client';

import React from 'react';
import Image from 'next/image';
import { FaPlay, FaPause, FaStepBackward, FaStepForward } from 'react-icons/fa';
import { usePlayer } from '@/context/PlayerContext';

export default function GlobalPlayerBar() {
  const { track, playing, progress, togglePlay } = usePlayer();
  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white py-2 px-4 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {track.cover_url && (
            <Image
              src={track.cover_url}
              alt={track.title}
              width={48}
              height={48}
              className="rounded"
              unoptimized
            />
          )}
          <div className="flex flex-col">
            <p className="font-medium truncate">{track.title}</p>
          </div>
        </div>
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-center space-x-4">
            <button onClick={() => {}} className="text-white text-xl p-2"><FaStepBackward /></button>
            <button onClick={togglePlay} className="text-white text-2xl p-2">{playing ? <FaPause /> : <FaPlay />}</button>
            <button onClick={() => {}} className="text-white text-xl p-2"><FaStepForward /></button>
          </div>
          <div className="w-96 h-1 bg-gray-700 rounded overflow-hidden">
            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {/* Additional controls can go here */}
      </div>
    </div>
  );
}
