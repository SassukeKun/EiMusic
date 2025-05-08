'use client'

import React from 'react'
import Image from 'next/image'

export default function HomePage() {
  const featuredRelease = {
    title: "Futuro Brilhante",
    artist: "Lana Neto",
    tag: "NOVO LANÇAMENTO"
  }

  const weeklyHighlights = [
    { id: 1, title: "Liberdade",        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80" },
    { id: 2, title: "Cidade Quente",    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&h=300&q=80" },
    { id: 3, title: "Vibes Tranquilas", image: "https://images.unsplash.com/photo-1542327897-52198a75037b?auto=format&fit=crop&w=300&h=300&q=80" },
    { id: 4, title: "Energia Positiva", image: "https://images.unsplash.com/photo-1497032628192-86f99b0c8ec6?auto=format&fit=crop&w=300&h=300&q=80" },
    { id: 5, title: "Ao Vivo na Cidade",image: "https://images.unsplash.com/photo-1486189407619-2a90d28b5842?auto=format&fit=crop&w=300&h=300&q=80" },
    { id: 6, title: "Melodia Urbana",   image: "https://images.unsplash.com/photo-1464375117522-1311dd699451?auto=format&fit=crop&w=300&h=300&q=80" },
    { id: 7, title: "Sons do Verão",    image: "https://images.unsplash.com/photo-1470229722913-7cfd64a0600d?auto=format&fit=crop&w=300&h=300&q=80" },
  ]

  const risingArtists = [
    { id: 1, name: "Sofia Lima",    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80" },
    { id: 2, name: "Ricardo Luz",   image: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&h=200&q=80" },
    { id: 3, name: "Marina Sol",    image: "https://images.unsplash.com/photo-1502720705749-3c5204b2c3f0?auto=format&fit=crop&w=200&h=200&q=80" },
    { id: 4, name: "Bruno Dias",    image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80" },
    { id: 5, name: "Carla Rocha",   image: "https://images.unsplash.com/photo-1544725176-7c40e5a2c9f7?auto=format&fit=crop&w=200&h=200&q=80" },
    { id: 6, name: "Daniel Costa",  image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80" },
    { id: 7, name: "Juliana Melo",  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80" },
    { id: 8, name: "Fernando Cruz", image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&h=200&q=80" },
  ]

  const featuredPlaylists = [
    { id: 1, title: "Domingo Relax",     image: "https://images.unsplash.com/photo-1511974035430-5de47d3b95da?auto=format&fit=crop&w=300&h=300&q=80", color: "bg-yellow-400" },
    { id: 2, title: "Hits do Momento",   image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&h=300&q=80", color: "bg-green-600" },
    { id: 3, title: "Noite Eletrônica",  image: "https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=300&h=300&q=80", color: "bg-blue-500" },
    { id: 4, title: "Vibes Acústicas",   image: "https://images.unsplash.com/photo-1511376777868-611b54f68947?auto=format&fit=crop&w=300&h=300&q=80", color: "bg-amber-200" },
    { id: 5, title: "Inspiração Diária", image: "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=300&h=300&q=80", color: "bg-orange-300" },
  ]

  const upcomingEvents = [
    { id: 1, title: "Festival de Verão", date: "25 de Maio", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&h=200&q=80" },
    { id: 2, title: "Show na Praia",    date: "6 de Junho", image: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=400&h=200&q=80" },
    { id: 3, title: "Noite de Jazz",     date: "15 de Junho",image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=400&h=200&q=80" },
    { id: 4, title: "Festival Urbano",   date: "1 de Julho", image: "https://images.unsplash.com/photo-1519889013711-089f0e6237a3?auto=format&fit=crop&w=400&h=200&q=80" },
  ]

  return (
    <div className="py-6">
      {/* Hero Banner */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-72 rounded-xl overflow-hidden mb-6 sm:mb-8 lg:mb-12">
        <Image
          src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=1600&q=80"
          alt="Futuro Brilhante - Lana Neto"
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute top-0 left-0 px-4 sm:px-6 py-4 sm:py-6 z-10 max-w-lg text-white">
          <p className="uppercase text-xs font-semibold mb-1">{featuredRelease.tag}</p>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1 sm:mb-2">{featuredRelease.title}</h1>
          <p className="text-sm sm:text-base">{featuredRelease.artist}</p>
        </div>
      </div>

      {/* Novidades da Semana */}
      <section className="mb-8 sm:mb-10 lg:mb-12">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Novidades da Semana</h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide">
          {weeklyHighlights.map(item => (
            <a key={item.id} href={`/playlist/${item.id}`} className="flex flex-col items-center flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden mb-2 shadow-md">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={300}
                  height={300}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center max-w-[80px] sm:max-w-[96px] md:max-w-[112px] truncate">{item.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Artistas em Ascensão */}
      <section className="mb-8 sm:mb-10 lg:mb-12">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Artistas em Ascensão</h2>
        <div className="flex space-x-3 sm:space-x-4 overflow-x-auto pb-3 sm:pb-4 scrollbar-hide">
          {risingArtists.map(artist => (
            <a key={artist.id} href={`/artist/${artist.id}`} className="flex flex-col items-center flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-2 shadow-md">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  width={200}
                  height={200}
                  className="object-cover"
                  unoptimized
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-center max-w-[64px] sm:max-w-[80px] md:max-w-[96px] truncate">{artist.name}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Playlist Destaque */}
      <section className="mb-8 sm:mb-10 lg:mb-12">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Playlist Destaque</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {featuredPlaylists.map(pl => (
            <a key={pl.id} href={`/playlist/${pl.id}`} className="block">
              <div className={`w-full aspect-square rounded-lg mb-2 relative overflow-hidden shadow-lg ${pl.color}`}>
                <Image
                  src={pl.image}
                  alt={pl.title}
                  fill
                  className="object-cover rounded-lg"
                  unoptimized
                />
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">{pl.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Próximos Eventos */}
      <section className="mb-6 sm:mb-8 lg:mb-10">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Próximos Eventos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {upcomingEvents.map(ev => (
            <a key={ev.id} href={`/event/${ev.id}`} className="block">
              <div className="w-full h-20 sm:h-24 md:h-28 rounded-lg overflow-hidden mb-2 relative shadow-lg">
                <Image
                  src={ev.image}
                  alt={ev.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-white font-medium text-xs sm:text-sm">{ev.date}</span>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium">{ev.title}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
