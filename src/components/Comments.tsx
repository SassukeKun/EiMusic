'use client'

import React, { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/utils/supabaseClient'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

export interface CommentRecord {
  id: string
  user_id: string
  content_id: string
  content_type: 'video' | 'music'
  parent_id: string | null
  text: string
  created_at: string
  updated_at: string
}

export interface CommentWithUser extends CommentRecord {
  users: {
    id: string
    name: string
    user_metadata?: {
      avatar_url?: string
      [key: string]: any
    }
  }
}


interface CommentsProps {
  contentId: string
  contentType?: 'video' | 'music'
}

interface CommentFormData {
  content: string
  parentId?: string
}

const CommentForm: React.FC<{
  onSubmit: (data: CommentFormData) => Promise<void>
  placeholder?: string
}> = ({ onSubmit, placeholder = 'Write a comment…' }) => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    await onSubmit({ content: text.trim() })
    setText('')
    setLoading(false)
  }

  return (
    <form onSubmit={handle} className="space-y-2">
      <textarea
        className="w-full p-2 bg-gray-800 rounded text-sm text-white"
        rows={2}
        placeholder={placeholder}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 rounded disabled:opacity-50"
      >
        {loading ? 'Posting…' : 'Post'}
      </button>
    </form>
  )
}

const Comments: React.FC<CommentsProps> = ({
  contentId,
  contentType = 'video',
}) => {
  const supabase = getSupabaseBrowserClient()
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [error, setError] = useState<string>('')

  const load = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, users(id, name, user_metadata)')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .order('created_at', { ascending: false })
    if (error) return setError(error.message)
    setComments(data || [])
  }

  useEffect(() => {
    load()
  }, [contentId])

  const post = async ({ content, parentId }: CommentFormData) => {
    if (!user) throw new Error('Not signed in')
    const { error } = await supabase.from('comments').insert([
      {
        user_id: user.id,
        content_id: contentId,
        content_type: contentType,
        parent_id: parentId || null,
        text: content,
      },
    ])
    if (error) throw error
    await load()
  }

  return (
    <div className="space-y-4 p-4 bg-gray-900 rounded-lg">
      <h4 className="text-lg font-semibold text-white">Comments</h4>
      <CommentForm onSubmit={post} />
      {error && <p className="text-red-400">{error}</p>}
      <div className="space-y-3 max-h-80 overflow-auto">
        {comments.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-3 rounded"
          >
            <div className="flex items-center mb-2">
  {c.users.user_metadata?.avatar_url ? (
    <img
      src={c.users.user_metadata.avatar_url}
      alt={c.users.name}
      className="w-6 h-6 rounded-full mr-2"
    />
  ) : (
    <div className="w-6 h-6 bg-gray-700 rounded-full mr-2" />
  )}
  <span className="text-white font-medium text-sm">{c.users.name}</span>
</div>
<p className="text-gray-200 text-sm">{c.text}</p>
            <span className="text-gray-500 text-xs">
              {new Date(c.created_at).toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Comments