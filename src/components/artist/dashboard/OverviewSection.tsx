import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Users, DollarSign, Music, Upload, Calendar } from 'lucide-react';
import StatsCard from './StatsCard';

// Define interfaces based on the mock data structure in page.tsx
import type { Track } from '@/models/track';
import type { Event as EventModel } from '@/models/event';



interface OverviewSectionProps {
  mockArtist: {
    total_streams: number;
    total_seguidores: number;
    receita_mensal: number;
  };
  musicas: Track[];
  videos: { id: string; title: string; thumbnail: string; views: number; likes: number; comments: number; status: 'publicado' | 'rascunho' | 'agendado'; duration: string }[];
  eventos: EventModel[];
  setActiveSection: (section: string) => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ mockArtist, musicas, videos, eventos, setActiveSection }) => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatsCard
        title="Total de Streams"
        value={mockArtist.total_streams.toLocaleString()}
        icon={Play}
        color="from-blue-500 to-purple-500"
        trend="+12.5%"
      />
      <StatsCard
        title="Seguidores"
        value={mockArtist.total_seguidores.toLocaleString()}
        icon={Users}
        color="from-green-500 to-blue-500"
        trend="+8.3%"
      />
      <StatsCard
        title="Receita Mensal"
        value={`${mockArtist.receita_mensal} MT`}
        icon={DollarSign}
        color="from-green-500 to-emerald-500"
        trend="+15.7%"
      />
      <StatsCard
        title="Conteúdos"
        value={musicas.length + videos.length}
        icon={Music}
        color="from-purple-500 to-pink-500"
      />
    </div>

    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 shadow-lg">
      <h3 className="text-white font-semibold text-xl mb-6">Ações Rápidas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          onClick={() => (window.location.href = '/upload')}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-xl transition-all flex items-center space-x-4 shadow-lg hover:shadow-xl"
        >
          <div className="p-3 bg-white/20 rounded-lg">
            <Upload className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg">Upload Conteúdo</p>
            <p className="text-sm opacity-90">Música ou vídeo</p>
          </div>
        </motion.button>
        <motion.button
          onClick={() => setActiveSection('eventos')}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white p-6 rounded-xl transition-all flex items-center space-x-4 shadow-lg hover:shadow-xl"
        >
          <div className="p-3 bg-white/20 rounded-lg">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg">Criar Evento</p>
            <p className="text-sm opacity-90">Shows e lançamentos</p>
          </div>
        </motion.button>
        <motion.button
          onClick={() => setActiveSection('comunidades')}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-6 rounded-xl transition-all flex items-center space-x-4 shadow-lg hover:shadow-xl"
        >
          <div className="p-3 bg-white/20 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-lg">Gerir Comunidades</p>
            <p className="text-sm opacity-90">Interação com fãs</p>
          </div>
        </motion.button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
      >
        <h3 className="text-white font-semibold text-lg mb-6">Top Músicas</h3>
        <div className="space-y-4">
          {musicas.slice(0, 3).map((music, index) => (
            <motion.div
              key={music.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-yellow-500 text-black'
                    : index === 1
                    ? 'bg-gray-400 text-black'
                    : 'bg-orange-600 text-white'
                }`}>
                {index + 1}
              </div>
              <Image
                src={music.cover_url ?? '/placeholder.png'}
                alt={music.title}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-white font-medium">{music.title}</p>
                <p className="text-gray-400 text-sm">
                  {music.plays_count?.toLocaleString() ?? 0} streams
                </p>
              </div>
              <div className="text-right">
                
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-lg"
      >
        <h3 className="text-white font-semibold text-lg mb-6">Próximos Eventos</h3>
        <div className="space-y-4">
          {eventos.slice(0, 2).map((evento) => (
            <motion.div
              key={evento.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-colors"
            >
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{evento.title}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(evento.start_time).toLocaleDateString('pt-MZ')} •{' '}
                  {evento.location}
                </p>
                <p className="text-yellow-400 text-xs mt-1">
                  {evento.capacity} participantes
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  evento.event_status === 'agendado'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                {evento.event_type}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default OverviewSection;
