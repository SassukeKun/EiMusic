'use client'

import React from 'react'

interface Item {
  id: number
  title: string
  artist: string
  plays: number
  duration: string
}

export default function FeedList({ initialFeed }: { initialFeed: Item[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {initialFeed.map(item => (
        <div key={item.id} className="bg-white rounded-lg shadow p-4">
          <div className="h-40 bg-gray-200 rounded mb-4 flex items-center justify-center">
            <span className="text-gray-400">Artwork</span>
          </div>
          <h3 className="font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-4">{item.artist}</p>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{item.plays} plays</span>
            <span>{item.duration}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
