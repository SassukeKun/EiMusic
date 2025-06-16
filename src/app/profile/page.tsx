'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import {
  FaUser,
  FaMusic,
  FaHeart,
  FaHistory,
  FaCrown,
  FaCog,
  FaEdit,
  FaCamera,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaSave,
  FaTimes,
  FaPlus,
  FaPlay,
  FaEllipsisV,
  FaTrash,
  FaShare,
  FaClock,
  FaRandom,
  FaUserCircle,
  FaPlayCircle,
  FaVideoSlash,
  FaFilter,
  FaSort,
  FaSearch,
  FaChartBar,
  FaTrashAlt,
  FaDownload as FaExport,
  FaCheckCircle,
  FaTimesCircle,
  FaCreditCard,
  FaUpload as FaUpgrade,
  FaBell,
  FaLock,
  FaVolumeUp,
  FaMoon,
  FaWifi,
  FaSignOutAlt,
  FaListUl,
  FaGlobe,
  FaLanguage
} from 'react-icons/fa'

// Interfaces baseadas na documentação do Capítulo V
interface UserData {
  id: string;
  nome_usuario: string;
  email: string;
  foto_perfil_url: string;
  localizacao: string;
  idioma_preferido: string;
  data_registro: string;
  metodo_pagamento_preferido: string;
  assinatura_ativa: boolean;
}

export default function UserProfilePage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)

  // Estados baseados nos atributos da documentação (Tabela 13)
  const [userData, setUserData] = useState<UserData>({
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome_usuario: 'Maria Fernandes',
    email: 'maria.fernandes@gmail.com',
    foto_perfil_url: '/api/placeholder/120/120',
    localizacao: 'Maputo, Moçambique', 
    idioma_preferido: 'pt-MZ',
    data_registro: '2024-01-15T10:00:00Z',
    metodo_pagamento_preferido: 'M-Pesa',
    assinatura_ativa: true
  })

  // Abas de navegação simplificadas
  const tabs = [
    { id: 'overview', label: 'Perfil', icon: <FaUser /> },
    { id: 'playlists', label: 'Playlists', icon: <FaMusic /> },
    { id: 'favorites', label: 'Favoritos', icon: <FaHeart /> },
    { id: 'subscription', label: 'Plano', icon: <FaCrown /> },
    { id: 'settings', label: 'Configurações', icon: <FaCog /> }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Compacto do Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            {/* Foto e Info Principal */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              
              {/* Avatar com botão de edição */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 group-hover:border-purple-500/60 transition-colors">
                  <Image
                    src={userData.foto_perfil_url}
                    alt="Foto de perfil"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <FaCamera className="text-white text-xl" />
                </button>
              </div>

              {/* Informações do usuário */}
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{userData.nome_usuario}</h1>
                  {userData.assinatura_ativa && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <FaCrown size={10} className="mr-1" />
                      Premium
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 text-gray-400 text-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <FaEnvelope size={12} />
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <FaMapMarkerAlt size={12} />
                    <span>{userData.localizacao}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <FaCalendarAlt size={12} />
                    <span>Membro desde {new Date(userData.data_registro).toLocaleDateString('pt-MZ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Editar Perfil */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <FaEdit size={16} />
              <span>{isEditing ? 'Cancelar Edição' : 'Editar Perfil'}</span>
            </button>
          </div>
        </motion.div>

        {/* Estatísticas Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {[
            { label: 'Músicas Ouvidas', value: '1,247', icon: <FaMusic />, color: 'from-blue-500 to-purple-600' },
            { label: 'Playlists', value: '8', icon: <FaListUl />, color: 'from-pink-500 to-rose-600' },
            { label: 'Artistas Seguidos', value: '23', icon: <FaUserCircle />, color: 'from-green-500 to-emerald-600' },
            { label: 'Horas de Áudio', value: '156h', icon: <FaClock />, color: 'from-yellow-500 to-orange-600' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <div className="text-white">{stat.icon}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navegação por Abas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-2 mb-6"
        >
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Conteúdo das Abas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <ProfileOverviewSection userData={userData} setUserData={setUserData} isEditing={isEditing} />}
            {activeTab === 'playlists' && <PlaylistsSection />}
            {activeTab === 'favorites' && <FavoritesSection />}
            {activeTab === 'subscription' && <SubscriptionSection />}
            {activeTab === 'settings' && <SettingsSection />}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// Seção Overview melhorada baseada nos atributos da documentação
function ProfileOverviewSection({ userData, setUserData, isEditing }: { userData: UserData, setUserData: any, isEditing: boolean }) {
  const [tempData, setTempData] = useState(userData)

  const handleSave = () => {
    setUserData(tempData)
    // Aqui chamaria a API para salvar
  }

  const handleCancel = () => {
    setTempData(userData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* Informações Pessoais */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Informações Pessoais</h3>
          {isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <FaSave size={12} />
                <span>Salvar</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <FaTimes size={12} />
                <span>Cancelar</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Nome do usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Nome Completo</label>
            {isEditing ? (
              <input
                type="text"
                value={tempData.nome_usuario}
                onChange={(e) => setTempData({...tempData, nome_usuario: e.target.value})}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <p className="text-white text-lg">{userData.nome_usuario}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="flex items-center space-x-3 text-white text-lg">
              <FaEnvelope className="text-gray-400" size={16} />
              <span>{userData.email}</span>
            </div>
          </div>

          {/* Localização */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Localização</label>
            {isEditing ? (
              <input
                type="text"
                value={tempData.localizacao}
                onChange={(e) => setTempData({...tempData, localizacao: e.target.value})}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center space-x-3 text-white text-lg">
                <FaMapMarkerAlt className="text-gray-400" size={16} />
                <span>{userData.localizacao}</span>
              </div>
            )}
          </div>

          {/* Idioma Preferido */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Idioma Preferido</label>
            {isEditing ? (
              <select
                value={tempData.idioma_preferido}
                onChange={(e) => setTempData({...tempData, idioma_preferido: e.target.value})}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="pt-MZ">🇲🇿 Português (Moçambique)</option>
                <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                <option value="en">🇺🇸 English</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            ) : (
              <div className="flex items-center space-x-3 text-white text-lg">
                <FaLanguage className="text-gray-400" size={16} />
                <span>
                  {userData.idioma_preferido === 'pt-MZ' && '🇲🇿 Português (Moçambique)'}
                  {userData.idioma_preferido === 'pt-BR' && '🇧🇷 Português (Brasil)'}
                  {userData.idioma_preferido === 'en' && '🇺🇸 English'}
                  {userData.idioma_preferido === 'fr' && '🇫🇷 Français'}
                </span>
              </div>
            )}
          </div>

          {/* Método de Pagamento Preferido */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Método de Pagamento Preferido</label>
            {isEditing ? (
              <select
                value={tempData.metodo_pagamento_preferido}
                onChange={(e) => setTempData({...tempData, metodo_pagamento_preferido: e.target.value})}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="M-Pesa">📱 M-Pesa</option>
                <option value="e-Mola">💳 e-Mola</option>
                <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                <option value="Transferência Bancária">🏦 Transferência Bancária</option>
              </select>
            ) : (
              <div className="flex items-center space-x-3 text-white text-lg">
                <FaCreditCard className="text-gray-400" size={16} />
                <span>
                  {userData.metodo_pagamento_preferido === 'M-Pesa' && '📱 M-Pesa'}
                  {userData.metodo_pagamento_preferido === 'e-Mola' && '💳 e-Mola'}
                  {userData.metodo_pagamento_preferido === 'Cartão de Crédito' && '💳 Cartão de Crédito'}
                  {userData.metodo_pagamento_preferido === 'Transferência Bancária' && '🏦 Transferência Bancária'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Playlists Recentes - substituindo Atividade Recente */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Playlists Recentes</h3>
          <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
            Ver todas
          </button>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Moçambique Vibes', tracks: 24, image: '/api/placeholder/60/60', updated: 'Há 2 dias' },
            { name: 'Afrobeats Mix', tracks: 18, image: '/api/placeholder/60/60', updated: 'Há 5 dias' },
            { name: 'Workout Energy', tracks: 12, image: '/api/placeholder/60/60', updated: 'Há 1 semana' },
            { name: 'Jazz Relax', tracks: 30, image: '/api/placeholder/60/60', updated: 'Há 2 semanas' }
          ].map((playlist, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer group"
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={playlist.image}
                  alt={playlist.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <FaPlay className="text-white" size={16} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{playlist.name}</h4>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>{playlist.tracks} músicas</span>
                  <span>•</span>
                  <span>{playlist.updated}</span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-white transition-all">
                <FaEllipsisV size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Placeholders para outras seções (implementação simplificada)
function PlaylistsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center"
    >
      <FaMusic className="text-purple-500 text-4xl mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Suas Playlists</h3>
      <p className="text-gray-400">Organize sua música favorita em coleções personalizadas</p>
    </motion.div>
  )
}

function FavoritesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center"
    >
      <FaHeart className="text-pink-500 text-4xl mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Seus Favoritos</h3>
      <p className="text-gray-400">Músicas, artistas e vídeos que você mais ama</p>
    </motion.div>
  )
}

function SubscriptionSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center"
    >
      <FaCrown className="text-yellow-500 text-4xl mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Seu Plano Premium</h3>
      <p className="text-gray-400">Gerencie sua assinatura e métodos de pagamento</p>
    </motion.div>
  )
}

function SettingsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-8 text-center"
    >
      <FaCog className="text-gray-500 text-4xl mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Configurações</h3>
      <p className="text-gray-400">Personalize sua experiência na plataforma</p>
    </motion.div>
  )
}