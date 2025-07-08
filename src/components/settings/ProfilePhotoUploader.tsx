"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import { FaCamera } from 'react-icons/fa'
import profileService from '@/services/profileService'

interface ProfilePhotoUploaderProps {
  /** 'user' updates table `users`, 'artist' updates table `artists` */
  mode: 'user' | 'artist'
  /** Primary key in the corresponding table */
  id: string
  /** Current profile image URL so we can show a preview */
  initialUrl: string
  /** Callback when upload is successful */
  onUploadSuccess?: (url: string) => void
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({ mode, id, initialUrl, onUploadSuccess }) => {
  const [preview, setPreview] = useState<string>(initialUrl)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setLoading(true)

    try {
      let uploadedUrl: string | undefined
      if (mode === 'user') {
        uploadedUrl = await profileService.updateUserAvatar(id, file)
      } else {
        uploadedUrl = await profileService.updateArtistAvatar(id, file)
      }
      // Caso o upload retorne uma URL válida, atualiza o preview para a URL definitiva
      if (uploadedUrl) {
        setPreview(uploadedUrl)
        if (onUploadSuccess) {
          onUploadSuccess(uploadedUrl)
        }
      }
    } catch (err) {
      console.log('Erro ao atualizar foto de perfil', err)
      alert('Falha ao atualizar imagem de perfil')
      // Se o upload falhar, reverte o preview para imagem inicial
      setPreview(initialUrl)
    } finally {
      setLoading(false)
    }
  }

  return (
    <label className="relative group cursor-pointer inline-block">
      <Image
        src={preview}
        alt="Foto de perfil"
        width={128}
        height={128}
        className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/30"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement
          target.onerror = null
          target.src = '/avatar.svg'
        }}
      />
      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
        {loading ? (
          <svg
            className="animate-spin h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l2-2-2-2v4a8 8 0 11-8 8h4l-2 2 2 2H4z"
            ></path>
          </svg>
        ) : (
          <FaCamera className="text-white text-xl" />
        )}
      </div>
    </label>
  )
}

export default ProfilePhotoUploader
