// src/app/page.tsx
import React from 'react'
import { FaSearch, FaUsers } from 'react-icons/fa'
import FeedList from '@/components/FeedList'

interface Item {
  id: number
  title: string
  artist: string
  plays: number
  duration: string
}

export default function HomePage() {
  const mockFeed: Item[] = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    title: `Sample Song ${i + 1}`,
    artist: `Artist ${i + 1}`,
    plays: Math.floor(Math.random() * 500) + 50,
    duration:
      `${Math.floor(Math.random() * 3) + 2}:` +
      `${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
  }))

  return (
    <>
      <header className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 bg-gray-50">
        {/* Search */}
        <div className="relative w-full sm:w-1/3 mb-4 sm:mb-0">
          <input
            type="text"
            placeholder="Search"
            className="
              w-full pl-10 pr-4 py-2
              rounded-lg bg-white shadow
              focus:outline-none focus:ring-2 focus:ring-purple-600
            "
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Title */}
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <FaUsers className="text-purple-600 text-2xl" />
          <h2 className="text-2xl font-bold text-purple-600">Your Feed</h2>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-full">
            All Posts
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full">
            Original Posts
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-full">
            Reposts
          </button>
        </div>
      </header>

      {/* Feed */}
      <section className="px-8 pb-8 bg-gray-50">
        <FeedList initialFeed={mockFeed} />
      </section>
    </>
  )
}
