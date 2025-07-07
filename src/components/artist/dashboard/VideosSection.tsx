import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Video, Eye, ThumbsUp, MessageSquare, Edit, Trash2 } from 'lucide-react';

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  status: 'publicado' | 'rascunho' | 'agendado';
  duration: string;
}

interface VideosSectionProps {
  videos: VideoData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedContent: (content: any) => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

const VideosSection: React.FC<VideosSectionProps> = ({ videos, searchTerm, setSearchTerm, setSelectedContent, setShowDeleteConfirm }) => {
  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestão de Vídeos</h2>
          <p className="text-gray-400 text-lg">Faça upload e gerencie seus vídeos</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vídeos..."
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
            <span className="font-medium">Novo Vídeo</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredVideos.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-16 border border-gray-700 text-center">
            <Video className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">
              {searchTerm ? 'Nenhum vídeo encontrado' : 'Nenhum vídeo ainda'}
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              {searchTerm ? 'Tente ajustar o termo de busca' : 'Comece fazendo upload do seu primeiro vídeo'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => (window.location.href = '/upload')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Upload Primeiro Vídeo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col"
              >
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-white font-semibold text-lg mb-3 flex-grow">{video.title}</h3>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span>{video.views.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{video.likes.toLocaleString()}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{video.comments.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        video.status === 'publicado'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                      {video.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 rounded-lg transition-all">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContent(video);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosSection;
