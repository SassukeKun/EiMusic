'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/utils/supabaseClient';
import { FaPlay, FaTimes } from 'react-icons/fa';

export default function AlbumPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [album, setAlbum] = useState<{
    id: string;
    title: string;
    description: string | null;
    cover_url: string | null;
  } | null>(null);

  const [tracks, setTracks] = useState<
    Array<{ id: string; title: string; file_url: string; duration: number; created_at: string }>
  >([]);

  const [selectedTrack, setSelectedTrack] = useState<{
    id: string;
    title: string;
    file_url: string;
    duration: number;
  } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    (async () => {
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .select('id,title,description,cover_url')
        .eq('id', id)
        .single();
      if (albumError) console.error('Album fetch error:', albumError);
      else setAlbum(albumData);

      const { data: tracksData, error: tracksError } = await supabase
        .from('tracks')
        .select('*')
        .eq('album_id', id)
        .order('created_at', { ascending: true });
      if (tracksError) console.error('Tracks fetch error:', JSON.stringify(tracksError, null, 2));
      else setTracks(tracksData || []);
    })();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <button
        onClick={() => router.back()}
        className="text-indigo-400 hover:text-indigo-300 mb-6"
      >
        &larr; Voltar
      </button>

      {album && (
        <div className="flex flex-col md:flex-row items-center mb-8">
          {album.cover_url ? (
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
              <Image
                src={album.cover_url}
                alt={album.title}
                fill
                className="object-cover rounded-md"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-700 rounded-md" />
          )}

          <div className="md:ml-8 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
            {album.description && <p className="text-gray-400">{album.description}</p>}
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Faixas</h2>
      <div className="space-y-2">
        {tracks.map(track => (
          <div
            key={track.id}
            className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedTrack(track)}
                className="text-indigo-400 hover:text-indigo-300 p-1"
              >
                <FaPlay />
              </button>
              <span>{track.title}</span>
            </div>
            <span className="text-gray-400">
              {Math.floor(track.duration / 60)}:
              {String(track.duration % 60).padStart(2, '0')}
            </span>
          </div>
        ))}
      </div>

      {selectedTrack && (
        <div className="fixed bottom-4 left-4 right-4 bg-gray-900 p-4 rounded shadow-lg flex items-center justify-between border border-gray-700">
          <div className="flex items-center space-x-4">
            <FaPlay />
            <span>{selectedTrack.title}</span>
          </div>
          <audio
            src={selectedTrack.file_url}
            controls
            autoPlay
            className="flex-1 mx-4"
          />
          <button
            onClick={() => setSelectedTrack(null)}
            className="text-gray-400 hover:text-white p-1"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
}
