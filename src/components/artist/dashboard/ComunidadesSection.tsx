import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Users, MessageSquare, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import { Community } from '@/models/community';

interface ComunidadesSectionProps {
  comunidades: Community[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedContent: (content: any) => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

const ComunidadesSection: React.FC<ComunidadesSectionProps> = ({ comunidades, searchTerm, setSearchTerm, setSelectedContent, setShowDeleteConfirm }) => {
  const filteredComunidades = comunidades.filter((community) =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestão de Comunidades</h2>
          <p className="text-gray-400 text-lg">Crie e gerencie comunidades para seus fãs</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar comunidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
            />
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Comunidade</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredComunidades.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-16 border border-gray-700 text-center">
            <Users className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">
              {searchTerm ? 'Nenhuma comunidade encontrada' : 'Nenhuma comunidade ainda'}
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              {searchTerm ? 'Tente ajustar o termo de busca' : 'Crie sua primeira comunidade e interaja com seus fãs'}
            </p>
            {!searchTerm && (
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl">
                Criar Primeira Comunidade
              </button>
            )}
          </div>
        ) : (
          filteredComunidades.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-start space-x-6">
                <img
                  src={community.banner}
                  alt={community.name}
                  className="w-24 h-24 rounded-xl object-cover shadow-lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-2xl">{community.name}</h3>
                    <span
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                        community.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                      {community.is_active ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{community.is_active ? 'Ativa' : 'Inativa'}</span>
                    </span>
                  </div>
                  <p className="text-gray-400 mb-4 text-sm leading-relaxed">{community.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-300">
                    <span className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>{(community.members_count ?? 0).toLocaleString()} membros</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                      <span>{(community.posts_count ?? 0).toLocaleString()} posts hoje</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <button className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 rounded-xl transition-all">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContent(community);
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

export default ComunidadesSection;
