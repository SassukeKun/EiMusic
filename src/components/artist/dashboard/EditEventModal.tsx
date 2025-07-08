import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Music, Mic, Disc, Heart, Globe, Crown, Gem, Save, AlertCircle, ExternalLink, Tag } from 'lucide-react';
import { Event as EventModel } from '@/models/event';

// Interface para dados do formulário (compatível com o modelo Event)
interface EventFormData {
  id?: string;
  artist_id: string;
  title: string;
  event_type: string;
  price_min: number;
  price_max: number;
  description?: string;
  start_time: string; // ISO timestamp
  location?: string;
  capacity?: number;
  event_status?: 'confirmado' | 'agendado' | 'cancelado';
}

interface EditEventModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (event: EventFormData) => void;
  event: EventModel | null;
  artistId: string; // Adicionar artistId como prop
}

const EditEventModal: React.FC<EditEventModalProps> = ({ 
  show, 
  onClose, 
  onSave, 
  event, 
  artistId 
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    artist_id: artistId,
    title: '',
    event_type: 'show',
    price_min: 0,
    price_max: 0,
    description: '',
    start_time: '',
    location: '',
    capacity: 0,
    event_status: 'agendado',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        id: event.id,
        artist_id: event.artist_id,
        title: event.title,
        event_type: event.event_type,
        price_min: event.price_min,
        price_max: event.price_max,
        description: event.description || '',
        start_time: event.start_time ? new Date(event.start_time).toISOString().substring(0, 16) : '',
        location: event.location || '',
        capacity: event.capacity || 0,
        event_status: event.event_status || 'agendado',
      });
    } else {
      setFormData({
        artist_id: artistId,
        title: '',
        event_type: 'show',
        price_min: 0,
        price_max: 0,
        description: '',
        start_time: '',
        location: '',
        capacity: 0,
        event_status: 'agendado',
      });
    }
  }, [event, show, artistId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price_min' || name === 'price_max' || name === 'capacity' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl p-8 m-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold text-white mb-6">
              {event ? 'Editar Evento' : 'Criar Novo Evento'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="title"
                  placeholder="Nome do Evento"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    placeholder="Local do Evento"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="show">Show</option>
                    <option value="concerto">Concerto</option>
                    <option value="festival">Festival</option>
                    <option value="workshop">Workshop</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    name="price_min"
                    placeholder="Preço Mín. (MT)"
                    value={formData.price_min}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    name="capacity"
                    placeholder="Capacidade"
                    value={formData.capacity || ''}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <textarea
                  name="description"
                  placeholder="Descrição do Evento"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-6 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="py-2 px-8 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-600/40"
                >
                  Salvar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditEventModal;