// src/components/PlayerBar.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaVolumeUp, FaVolumeMute, FaRandom, FaRedo, FaHeart, FaEllipsisH } from 'react-icons/fa'

// Podemos criar um contexto global para gerenciar o estado do player, 
// mas por enquanto criaremos um componente com estado local para demonstração

interface PlayerBarProps {
  // Você pode passar props como currentTrack do contexto global
  initiallyVisible?: boolean;
}

export default function PlayerBar({ initiallyVisible = false }: PlayerBarProps) {
  const [playing, setPlaying] = useState(false)
  const [visible, setVisible] = useState(initiallyVisible)
  const [volume, setVolume] = useState(80)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(217) // Duração em segundos
  const [currentTime, setCurrentTime] = useState(0)
  
  // Exemplo de track atual - você pode passar isso como prop ou de um contexto global
  const currentTrack = {
    id: '1',
    title: 'Nunca tou no Place',
    artist: 'Hernâni & Laylizzy',
    album: 'Singles',
    cover: 'https://xigubo.com/wp-content/uploads/2022/11/231FEECC-35CF-4DEB-ABC8-621482F88F92-e1669184204697.jpeg',
  }

  // Simulação de progresso do player quando estiver tocando
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (playing && visible) {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setPlaying(false);
            return 0;
          }
          return prev + 1;
        });
        
        setProgress(prev => {
          if (prev >= 100) {
            return 0;
          }
          return (currentTime / duration) * 100;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [playing, visible, currentTime, duration]);

  // Formatar o tempo no formato mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Manipulador para ajustar o progresso quando o usuário clica na barra
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    setCurrentTime((newProgress / 100) * duration);
  };

  // Manipulador para ajustar o volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setMuted(!muted);
  };

  // Para demonstração - também poderia vir de um contexto global
  const toggleVisibility = () => {
    setVisible(!visible);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-5xl px-4"
        >
          <div className="bg-gray-900/95 backdrop-blur-md rounded-xl border border-gray-700 shadow-xl overflow-hidden">
            <div className="flex items-center p-3 md:p-4">
              {/* Capa do álbum e informações */}
              <div className="flex items-center flex-1 min-w-0">
                <div className="relative h-12 w-12 md:h-14 md:w-14 flex-shrink-0 mr-3 rounded-md overflow-hidden">
                  <Image 
                    src={currentTrack.cover} 
                    alt={currentTrack.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="truncate pr-2">
                  <h4 className="font-medium text-white truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
                <button className="ml-2 text-gray-400 hover:text-indigo-400 transition-colors p-1.5">
                  <FaHeart />
                </button>
                <button className="text-gray-400 hover:text-indigo-400 transition-colors p-1.5 hidden sm:block">
                  <FaEllipsisH />
                </button>
              </div>
              
              {/* Controles do player - versão desktop */}
              <div className="hidden md:flex flex-col items-center justify-center flex-1">
                {/* Botões de controle */}
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400 hover:text-white transition-colors p-1.5">
                    <FaRandom size={14} />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors p-1.5">
                    <FaStepBackward size={14} />
                  </button>
                  <button 
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-full transition-colors"
                    onClick={() => setPlaying(!playing)}
                  >
                    {playing ? <FaPause size={16} /> : <FaPlay size={16} />}
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors p-1.5">
                    <FaStepForward size={14} />
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors p-1.5">
                    <FaRedo size={14} />
                  </button>
                </div>
                
                {/* Barra de progresso */}
                <div className="flex items-center w-full space-x-2 mt-1.5">
                  <span className="text-xs text-gray-400 w-8 text-right">{formatTime(currentTime)}</span>
                  <div className="relative flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={handleProgressChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Controles de volume e outros */}
              <div className="hidden md:flex items-center justify-end space-x-3 flex-1">
                <button 
                  className="text-gray-400 hover:text-white transition-colors p-1.5"
                  onClick={toggleMute}
                >
                  {muted || volume === 0 ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                </button>
                <div className="w-24 h-1 bg-gray-700 rounded-full relative hidden md:block">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={muted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="h-full bg-gray-400 rounded-full" 
                    style={{ width: `${muted ? 0 : volume}%` }} 
                  />
                </div>
              </div>
              
              {/* Controles do player - versão mobile */}
              <div className="md:hidden flex items-center space-x-3">
                <button 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-full transition-colors"
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? <FaPause size={12} /> : <FaPlay size={12} />}
                </button>
                <div className="relative w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            </div>
            
            {/* Barra de progresso para mobile (fora da linha principal) */}
            <div className="md:hidden px-4 pb-3">
              <div className="flex items-center w-full space-x-2">
                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                <div className="relative flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleProgressChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <span className="text-xs text-gray-400">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}