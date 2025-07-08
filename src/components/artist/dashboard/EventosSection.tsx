import React from 'react';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from 'framer-motion';
import { Search, Plus, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { Event } from '@/models/event';

interface EventosSectionProps {
  eventos: Event[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setSelectedContent: (content: any) => void;
  setShowEditModal: (show: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
}

const EventosSection: React.FC<EventosSectionProps> = ({ 
  eventos, 
  searchTerm, 
  setSearchTerm, 
  setSelectedContent, 
  setShowEditModal,
  setShowCreateModal,
  setShowDeleteConfirm 
}) => {
  const filteredEventos = eventos.filter((event) =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Gestão de Eventos</h2>
          <p className="text-gray-400 text-lg">Crie e gerencie seus shows e eventos</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-80"
            />
          </div>
          <button
            onClick={() => {
              setSelectedContent(null);
              setShowCreateModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Novo Evento</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredEventos.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-16 border border-gray-700 text-center">
            <Calendar className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-400 mb-4">
              {searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento agendado'}
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              {searchTerm ? 'Tente ajustar o termo de busca' : 'Crie seu primeiro evento para seus fãs'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setSelectedContent(null);
                  setShowCreateModal(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Criar Primeiro Evento
              </button>
            )}
          </div>
        ) : (
          filteredEventos.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="flex items-start space-x-6">
                <div className="flex flex-col items-center justify-center bg-gray-700/50 rounded-xl p-4 w-24 text-center">
                  <p className="text-white font-bold text-3xl">{new Date(event.start_time).getDate()}</p>
                  <p className="text-purple-400 font-semibold text-sm">{new Date(event.start_time).toLocaleString('pt-MZ', { month: 'short' })}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-xl">{event.title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.event_type === 'show'
                          ? 'bg-green-500/20 text-green-400'
                          : event.event_type === 'tour'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                      {event.event_type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location || 'Local não informado'}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{event.capacity?.toLocaleString() || 'Sem limite'} participantes</span>
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {event.description || 'Sem descrição'}
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <button
                    onClick={() => {
                      setSelectedContent(event);
                      setShowEditModal(true);
                    }}
                    className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-400/20 rounded-xl transition-all">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedContent(event);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-400/20 rounded-xl transition-all">
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

export default EventosSection;