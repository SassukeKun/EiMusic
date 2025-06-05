// src/app/artist/dashboard/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaUpload, FaChartLine, FaEye, FaHeadphones, FaUsers, FaMusic, FaEllipsisH, FaCog } from 'react-icons/fa'
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'

export default function ArtistDashboardPage() {
  const { user, isArtist, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracks' | 'stats'>('overview');
  
  // Estatísticas simuladas (seriam obtidas de uma API real)
  const stats = {
    totalPlays: 12450,
    montlyPlays: 1240,
    followers: 328,
    recentUploads: 24
  };
  
  // Músicas simuladas do artista (seriam obtidas de uma API real)
  const artistTracks = [
    { id: 1, title: 'Distância', plays: 4321, uploadDate: '2025-01-15', coverUrl: '/images/covers/distancia.jpg' },
    { id: 2, title: 'Veraneio', plays: 1250, uploadDate: '2025-03-20', coverUrl: '/images/covers/veraneio.jpg' },
    { id: 3, title: 'Rivais', plays: 3768, uploadDate: '2024-12-05', coverUrl: '/images/covers/rivais.jpg' },
    { id: 4, title: 'Não voltar atrás', plays: 2142, uploadDate: '2025-04-10', coverUrl: '/images/covers/nao-voltar.jpg' },
  ];
  
  // Verificar se o usuário está autenticado e é artista
  React.useEffect(() => {
    if (!loading && (!user || !isArtist)) {
      router.push('/login');
    }
  }, [user, isArtist, loading, router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pb-24">
      {/* Cabeçalho do Dashboard */}
      <div className="bg-gradient-to-r from-purple-900/80 to-indigo-900/50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard do Artista</h1>
          <p className="text-gray-300">Gerencie sua música e acompanhe seu desempenho</p>
        </div>
      </div>
      
      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Cartões de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            className="bg-gradient-to-br from-purple-900/80 to-purple-800/40 backdrop-blur-lg rounded-xl p-4 border border-purple-700/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-3">
              <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
                <FaHeadphones className="text-xl text-purple-400" />
              </div>
              <h3 className="text-lg font-medium">Total de Plays</h3>
            </div>
            <p className="text-3xl font-bold">{stats.totalPlays.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">Desde o início</p>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-blue-900/80 to-blue-800/40 backdrop-blur-lg rounded-xl p-4 border border-blue-700/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                <FaChartLine className="text-xl text-blue-400" />
              </div>
              <h3 className="text-lg font-medium">Plays Mensais</h3>
            </div>
            <p className="text-3xl font-bold">{stats.montlyPlays.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">Último mês</p>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-green-900/80 to-green-800/40 backdrop-blur-lg rounded-xl p-4 border border-green-700/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-3">
              <div className="bg-green-500/20 p-2 rounded-lg mr-3">
                <FaUsers className="text-xl text-green-400" />
              </div>
              <h3 className="text-lg font-medium">Seguidores</h3>
            </div>
            <p className="text-3xl font-bold">{stats.followers.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">+12 nesta semana</p>
          </motion.div>
          
          <motion.div 
            className="bg-gradient-to-br from-amber-900/80 to-amber-800/40 backdrop-blur-lg rounded-xl p-4 border border-amber-700/50"
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="flex items-center mb-3">
              <div className="bg-amber-500/20 p-2 rounded-lg mr-3">
                <FaMusic className="text-xl text-amber-400" />
              </div>
              <h3 className="text-lg font-medium">Uploads</h3>
            </div>
            <p className="text-3xl font-bold">{stats.recentUploads}</p>
            <p className="text-sm text-gray-400 mt-1">Faixas publicadas</p>
          </motion.div>
        </div>
        
        {/* Botões de Ação Rápida */}
        <div className="flex flex-wrap gap-4 mb-10">
          <motion.button
            onClick={() => router.push('/upload')}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg hover:from-purple-700 hover:to-purple-900 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaUpload className="mr-2" /> Fazer Upload
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/artist/profile/edit')}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 rounded-lg hover:from-gray-600 hover:to-gray-800 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaCog className="mr-2" /> Configurações
          </motion.button>
        </div>
        
        {/* Tabs de Navegação */}
        <div className="border-b border-gray-800 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'overview' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('tracks')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'tracks' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
              Minhas Faixas
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'stats' 
                ? 'border-purple-500 text-purple-400' 
                : 'border-transparent text-gray-400 hover:text-gray-300'}`}
            >
              Estatísticas
            </button>
          </nav>
        </div>
        
        {/* Conteúdo baseado na Tab ativa */}
        {activeTab === 'overview' && (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Faixas Recentes</h2>
                <button 
                  onClick={() => setActiveTab('tracks')}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Ver todas
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Título</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plays</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                      <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {artistTracks.slice(0, 3).map((track) => (
                      <tr key={track.id} className="hover:bg-gray-700/20">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded bg-gray-700 mr-3 flex-shrink-0 overflow-hidden">
                              {track.coverUrl ? (
                                <Image src={track.coverUrl} alt={track.title} width={40} height={40} className="object-cover" unoptimized />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <FaMusic />
                                </div>
                              )}
                            </div>
                            <div className="font-medium">{track.title}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-300">
                          {track.plays.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-gray-300">
                          {new Date(track.uploadDate).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-right">
                          <button className="text-gray-400 hover:text-white">
                            <FaEllipsisH />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Atividade Recente</h2>
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-green-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaUsers className="text-sm text-green-400" />
                      </div>
                      <div>
                        <p className="text-gray-300">Você ganhou 5 novos seguidores</p>
                        <p className="text-xs text-gray-500">Há 2 dias</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-blue-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaHeadphones className="text-sm text-blue-400" />
                      </div>
                      <div>
                        <p className="text-gray-300">Sua faixa "Distância" atingiu 4.000 plays</p>
                        <p className="text-xs text-gray-500">Há 1 semana</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-purple-500/20 p-2 rounded-lg mr-3 mt-1">
                        <FaMusic className="text-sm text-purple-400" />
                      </div>
                      <div>
                        <p className="text-gray-300">Você fez upload de uma nova faixa</p>
                        <p className="text-xs text-gray-500">Há 2 semanas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Tendências</h2>
                <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 h-full">
                  <div className="flex flex-col h-full justify-center items-center text-center p-4">
                    <div className="bg-purple-500/20 p-4 rounded-full mb-4">
                      <FaChartLine className="text-2xl text-purple-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Visualize tendências detalhadas</h3>
                    <p className="text-gray-400 mb-4">Acesse estatísticas avançadas e veja como suas faixas estão performando</p>
                    <button 
                      onClick={() => setActiveTab('stats')}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition"
                    >
                      Ver estatísticas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'tracks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Todas as Minhas Faixas</h2>
              <button 
                onClick={() => router.push('/upload')}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition flex items-center"
              >
                <FaUpload className="mr-2" /> Upload
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Título</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plays</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="py-3 px-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {artistTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-gray-700/20">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded bg-gray-700 mr-3 flex-shrink-0 overflow-hidden">
                            {track.coverUrl ? (
                              <Image src={track.coverUrl} alt={track.title} width={40} height={40} className="object-cover" unoptimized />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <FaMusic />
                              </div>
                            )}
                          </div>
                          <div className="font-medium">{track.title}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-300">
                        {track.plays.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-gray-300">
                        {new Date(track.uploadDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button className="text-gray-400 hover:text-white p-1">
                            <FaEye />
                          </button>
                          <button className="text-gray-400 hover:text-white p-1">
                            <FaChartLine />
                          </button>
                          <button className="text-gray-400 hover:text-white p-1">
                            <FaEllipsisH />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Estatísticas Detalhadas</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-medium mb-4">Desempenho por Faixa</h3>
                <div className="space-y-4">
                  {artistTracks.map((track) => (
                    <div key={track.id} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{track.title}</span>
                        <span className="text-sm text-gray-400">{track.plays} plays</span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                          style={{ width: `${(track.plays / stats.totalPlays) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-medium mb-4">Crescimento de Seguidores</h3>
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-400 text-center">
                    Gráfico de crescimento de seguidores será exibido aqui.<br />
                    <span className="text-sm">Dados de acompanhamento nos últimos 90 dias</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-medium mb-4">Distribuição Geográfica</h3>
              <div className="h-80 flex items-center justify-center">
                <p className="text-gray-400 text-center">
                  Mapa de distribuição geográfica dos seus ouvintes será exibido aqui.<br />
                  <span className="text-sm">Visualize de onde vêm seus fãs</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}