'use client'
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRedo, FaVolumeUp } from 'react-icons/fa'
import React, { useState } from 'react'

export default function PlayerBar() {
  const [playing, setPlaying] = useState(false)
  
  return (
    <div className="
      fixed bottom-0 left-0 w-full bg-white shadow-inner
      flex items-center justify-between px-2 py-1
      border-t border-gray-200 text-sm h-14
      z-50
    ">
      {/* Controles de Reprodução */}
      <div className="flex items-center space-x-1 sm:space-x-2 w-1/4 justify-start">
        <FaRandom className="hidden sm:block text-gray-600 hover:text-gray-800 cursor-pointer text-xs" />
        <FaStepBackward className="text-gray-600 hover:text-gray-800 cursor-pointer text-xs" />
        <div
          className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded-full cursor-pointer"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <FaPause size={10} /> : <FaPlay size={10} />}
        </div>
        <FaStepForward className="text-gray-600 hover:text-gray-800 cursor-pointer text-xs" />
        <FaRedo className="hidden sm:block text-gray-600 hover:text-gray-800 cursor-pointer text-xs" />
      </div>

      {/* Barra de Progresso Central */}
      <div className="flex flex-col w-2/4 px-2">
        <div className="flex justify-center">
          <input
            type="range"
            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>1:23</span>
          <span>3:45</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center space-x-2 w-1/4 justify-end">
        <FaVolumeUp className="text-gray-600 text-xs" />
        <input
          type="range"
          className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer hidden sm:block"
        />
      </div>
    </div>
  )
}