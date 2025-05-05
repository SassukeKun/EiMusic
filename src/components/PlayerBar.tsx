'use client'
import { FaPlay, FaPause, FaStepBackward, FaStepForward, FaRandom, FaRedo } from 'react-icons/fa'
import React, { useState } from 'react'

export default function PlayerBar() {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="
      fixed bottom-0 left-0 w-full bg-white shadow-inner
      flex items-center justify-between px-6 py-3
      border-t border-gray-200
    ">
      <div className="flex items-center space-x-4">
        <FaRandom className="text-gray-600 hover:text-gray-800 cursor-pointer" />
        <FaStepBackward className="text-gray-600 hover:text-gray-800 cursor-pointer" />
        <div
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full cursor-pointer"
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <FaPause /> : <FaPlay />}
        </div>
        <FaStepForward className="text-gray-600 hover:text-gray-800 cursor-pointer" />
        <FaRedo className="text-gray-600 hover:text-gray-800 cursor-pointer" />
      </div>
      <div className="text-sm text-gray-700">
        1:23 / 3:45
      </div>
      <div className="flex-1 mx-6">
        <input
          type="range"
          className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      <div className="text-sm text-gray-700">
        Volume
      </div>
    </div>
  )
}
