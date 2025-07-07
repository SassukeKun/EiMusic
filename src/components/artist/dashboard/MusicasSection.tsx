import React from 'react';
import type { Track } from '@/models/track';
import { motion } from 'framer-motion';
import { Search, Plus, Music, Play, Heart, Edit, Trash2 } from 'lucide-react';
import StatsCard from './StatsCard';

// Using Track model directly

interface MusicasSectionProps {
  musicas: Track[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedContent: (content: any) => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

const MusicasSection: React.FC<MusicasSectionProps> = ({ musicas, searchTerm, setSearchTerm, setSelectedContent, setShowDeleteConfirm }) => {
  // helper to convert seconds to mm:ss
  const formatDuration = (seconds: number | undefined) => {
    if (!seconds && seconds !== 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredMusicas = musicas.filter((music) =>
    music.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestão de Músicas</h2>
          <p className="text-gray-400 text-lg">Gere as tuas músicas e acompanha a performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar músicas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
            />
          </div>
          <button
            onClick={() => (window.location.href = '/upload')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Música</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Músicas"
          value={musicas.length}
          icon={Music}
          color="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="Publicadas"
          value={musicas.length}
          icon={Play} // Using Play as a substitute for Eye
          color="from-green-500 to-emerald-500"
        />
        <StatsCard
          title="Total de Streams"
          value={musicas.reduce((acc, m) => acc + (m.plays_count ?? 0), 0).toLocaleString()}
          icon={Play}
          color="from-blue-500 to-purple-500"
        />
      </div>

      <div className="space-y-6">
        {filteredMusicas.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-16 border border-gray-700 text-center">
            <Music className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">
              {searchTerm ? 'Nenhuma música encontrada' : 'Nenhuma música ainda'}
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              {searchTerm ? 'Tenta ajustar o termo de busca' : 'Comece fazendo upload da sua primeira música'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => (window.location.href = '/upload')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Upload Primeira Música
              </button>
            )}
          </div>
        ) : (
          filteredMusicas.map((music, index) => (
            <motion.div
              key={music.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center space-x-6">
                <img
                  src={music.cover_url ?? '/placeholder.png'}
                  alt={music.title}
                  className="w-20 h-20 rounded-xl object-cover shadow-lg"
                />
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-xl mb-2">{music.title}</h3>
                  <p className="text-gray-400 mb-3">{music.genre_ids?.[0] ?? '--'} • {formatDuration(music.duration)}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span className="flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>{music.plays_count?.toLocaleString() ?? 0}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>{music.likes_count?.toLocaleString() ?? 0}</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 rounded-xl transition-all">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContent(music);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MusicasSection;
