'use client'

import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { FaPlay, FaHeart, FaShare, FaSpotify, FaYoutube, FaInstagram } from 'react-icons/fa'

import artistService from '@/services/artistService'
import { Artist } from '@/models/artist'
import { Track } from '@/models/track'

export default function ArtistPage() {
  const { id } = useParams() as { id: string }
  const [activeTab, setActiveTab] = useState<'tracks' | 'about'>('tracks')
  
  // Fetch artist data
  const { 
    data: artist,
    isLoading: artistLoading,
    error: artistError 
  } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => artistService.getArtistById(id),
  })
  
  // Fetch artist tracks
  const { 
    data: tracks,
    isLoading: tracksLoading,
    error: tracksError 
  } = useQuery({
    queryKey: ['artist-tracks', id],
    queryFn: () => artistService.getArtistTracks(id),
    enabled: !!id,
  })
  
  // Handle loading states
  if (artistLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
        <div className="container mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-700 rounded-lg mb-6"></div>
            <div className="h-10 bg-gray-700 w-1/3 rounded mb-4"></div>
            <div className="h-6 bg-gray-700 w-1/2 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Handle error states
  if (artistError || !artist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Artista não encontrado</h1>
          <p className="text-gray-400 mb-6">
            Não foi possível carregar os dados deste artista.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-green-600 rounded-full hover:bg-green-700 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Artist Header */}
      <div 
        className="h-80 bg-cover bg-center relative"
        style={{ 
          backgroundImage: artist.profile_image_url 
            ? `url(${artist.profile_image_url})` 
            : 'linear-gradient(to right, #1DB954, #191414)' 
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-6 relative h-full flex flex-col justify-end pb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{artist.name}</h1>
          <div className="flex items-center space-x-4 mt-4">
            <button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-2 flex items-center">
              <FaPlay className="mr-2" /> Reproduzir
            </button>
            <button className="bg-transparent border border-white hover:bg-white/10 rounded-full p-2">
              <FaHeart />
            </button>
            <button className="bg-transparent border border-white hover:bg-white/10 rounded-full p-2">
              <FaShare />
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="container mx-auto px-6 py-4 border-b border-gray-800">
        <div className="flex space-x-6">
          <button 
            onClick={() => setActiveTab('tracks')}
            className={`pb-2 font-medium ${activeTab === 'tracks' 
              ? 'text-white border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-white'}`}
          >
            Músicas
          </button>
          <button 
            onClick={() => setActiveTab('about')}
            className={`pb-2 font-medium ${activeTab === 'about' 
              ? 'text-white border-b-2 border-green-500' 
              : 'text-gray-400 hover:text-white'}`}
          >
            Sobre
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        {activeTab === 'tracks' ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Músicas populares</h2>
            
            {tracksLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-800 rounded"></div>
                ))}
              </div>
            ) : tracks && tracks.length > 0 ? (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <div 
                    key={track.id} 
                    className="flex items-center p-3 hover:bg-gray-800/50 rounded-md transition"
                  >
                    <div className="w-10 text-center text-gray-400 mr-4">
                      {track.plays_count > 0 ? track.plays_count.toLocaleString() : '-'}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{track.title}</h3>
                      <p className="text-sm text-gray-400">
                        {new Date(track.release_date || track.created_at).getFullYear()}
                      </p>
                    </div>
                    
                    <div className="text-gray-400">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Nenhuma música encontrada para este artista.</p>
            )}
          </div>
        ) : (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Biografia</h2>
            <p className="text-gray-300 mb-6 whitespace-pre-line">{artist.bio}</p>
            
            {artist.social_links && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Redes sociais</h3>
                <div className="flex space-x-4">
                  {artist.social_links.instagram && (
                    <a 
                      href={artist.social_links.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-2xl text-gray-400 hover:text-white transition"
                    >
                      <FaInstagram />
                    </a>
                  )}
                  {artist.social_links.twitter && (
                    <a 
                      href={artist.social_links.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-2xl text-gray-400 hover:text-white transition"
                    >
                      <FaYoutube />
                    </a>
                  )}
                  {artist.social_links.website && (
                    <a 
                      href={artist.social_links.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-2xl text-gray-400 hover:text-white transition"
                    >
                      <FaSpotify />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 