'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { 
  FaUpload, 
  FaImage, 
  FaTimes, 
  FaVideo, 
  FaInfoCircle,
  FaGlobe, 
  FaLock, 
  FaUsers, 
  FaSave, 
  FaCloudUploadAlt,
  FaArrowLeft
} from 'react-icons/fa'
import FileUploader from '@/components/upload/FileUploader'
import uploadService from '@/services/uploadService'

// Componente principal para upload de vídeo
export default function VideoUploadPage() {
  const { isArtist, loading, user } = useAuth();
  
  // Estado para gerenciar upload de vídeo
  const [uploadStep, setUploadStep] = useState<'initial' | 'details' | 'uploading' | 'success' | 'error'>('initial');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | undefined>(undefined);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para metadados do vídeo
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoDescription, setVideoDescription] = useState<string>('');
  const [videoGenre, setVideoGenre] = useState<string>('');
  const [videoVisibility, setVideoVisibility] = useState<'public' | 'private' | 'followers'>('public');
  const [isVideoClip, setIsVideoClip] = useState<boolean>(true);
  const [director, setDirector] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  
  // Refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  // Manipulador para seleção de vídeo
  const handleVideoSelect = (file: File) => {
    setVideoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
    
    // Se for o primeiro passo, avançar para a seleção de detalhes
    if (uploadStep === 'initial') {
      setUploadStep('details');
    }
    
    // Extraír título do nome do arquivo
    if (!videoTitle) {
      const nameWithoutExt = file.name.split('.')[0];
      setVideoTitle(nameWithoutExt);
    }
    
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Manipulador para limpar o vídeo
  const handleClearVideo = () => {
    setVideoFile(null);
    setVideoPreview(undefined);
  };
  
  // Manipulador para seleção de thumbnail
  const handleThumbnailSelect = (file: File) => {
    setThumbnailFile(file);
    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);
    
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Manipulador para limpar thumbnail
  const handleClearThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(undefined);
  };
  
  // Manipulador para adicionar tag
  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Manipulador para remover tag
  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  // Manipulador para adicionar tag com Enter
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && tags.length < 5) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Manipulador para voltar para seleção de vídeo
  const handleBackToVideo = () => {
    setUploadStep('initial');
  };
  
  // Manipulador para reiniciar o processo
  const handleReset = () => {
    setVideoFile(null);
    setVideoPreview(undefined);
    setThumbnailFile(null);
    setThumbnailPreview(undefined);
    setVideoTitle('');
    setVideoDescription('');
    setVideoGenre('');
    setVideoVisibility('public');
    setIsVideoClip(true);
    setDirector('');
    setTags([]);
    setTagInput('');
    setUploadProgress(0);
    setUploadResult(null);
    setError(null);
    setUploadStep('initial');
  };
  
  // Manipulador para iniciar upload
  const handleStartUpload = async () => {
    if (!videoFile || !videoTitle.trim()) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    setUploadStep('uploading');
    setUploadProgress(0);
    
    // Incrementar o progresso gradualmente para feedback visual
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        // Limitamos a 90% - os últimos 10% serão quando o upload for realmente concluído
        return prev < 90 ? prev + 1 : prev;
      });
    }, 500);
    
    // Metadados para o vídeo
    const videoMetadata = {
      title: videoTitle,
      description: videoDescription,
      genre: videoGenre,
      visibility: videoVisibility,
      isVideoClip,
      director: director || undefined,
      tags: tags.length > 0 ? tags : undefined
    };
    
    try {
      // Verificar se o usuário está autenticado
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Usar o nome do artista para a estrutura de pastas
      const artistName = 
        (user.user_metadata?.full_name as string) || 
        (user.user_metadata?.name as string) || 
        (user.email?.split('@')[0] as string) || 
        `artist_${user.id}_${Date.now()}`;
      
      const artistId = user.id;
      
      // Fazer upload do vídeo
      const result = await uploadService.uploadVideo(
        artistId,
        artistName,
        videoFile,
        videoMetadata,
        thumbnailFile || undefined
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadResult(result);
      setUploadStep('success');
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error('Erro ao fazer upload do vídeo:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao enviar o vídeo');
      setUploadStep('error');
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-400">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Verificação de artista
  if (!isArtist) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-xl">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">
            Esta página é exclusiva para artistas. Registre-se como artista para fazer upload de vídeos.
          </p>
          <Link href="/artist/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
            Registrar como Artista
          </Link>
        </div>
      </div>
    );
  }
  
  // Método para renderizar o conteúdo com base na etapa atual
  const renderContent = () => {
    switch (uploadStep) {
      case 'initial':
        return (
          <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Upload de Vídeo</h1>
            
            <div className="mb-8">
              <p className="text-gray-300 mb-4 text-center">
                Faça upload do seu videoclipe ou conteúdo visual
              </p>
              
              <div className="bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                {!videoFile ? (
                  <div>
                    <div className="flex justify-center mb-4">
                      <FaVideo className="text-5xl text-indigo-400" />
                    </div>
                    
                    <p className="text-gray-300 mb-4">
                      Arraste e solte seu arquivo de vídeo aqui ou clique para selecionar
                    </p>
                    
                    <button
                      onClick={() => videoInputRef.current?.click()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg inline-flex items-center transition-colors"
                    >
                      <FaUpload className="mr-2" />
                      Selecionar Vídeo
                    </button>
                    
                    <input
                      type="file"
                      ref={videoInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleVideoSelect(e.target.files[0]);
                        }
                      }}
                      accept="video/*"
                      className="hidden"
                    />
                    
                    <p className="text-gray-500 text-xs mt-3">
                      Formatos aceitos: MP4, MOV, AVI, WEBM (máx. 500MB)
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      {videoFile.name}
                    </h3>
                    
                    <div className="flex justify-center mb-4">
                      {videoPreview && (
                        <video 
                          src={videoPreview} 
                          controls 
                          className="max-h-40 rounded-lg shadow-lg mb-4" 
                        />
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-4">
                      {Math.round(videoFile.size / 1024 / 1024 * 10) / 10} MB
                    </div>
                    
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={handleClearVideo}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FaTimes className="mr-2 inline" />
                        Remover
                      </button>
                      
                      <button
                        onClick={() => setUploadStep('details')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Continuar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link 
                href="/upload" 
                className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Voltar para opções de upload
              </Link>
            </div>
          </div>
        );
        
      case 'details':
        return (
          <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Detalhes do Vídeo</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-1">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">Pré-visualização</h3>
                  
                  <div className="flex flex-col items-center">
                    {videoPreview && (
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full rounded-lg shadow-lg mb-4" 
                      />
                    )}
                    
                    <div className="w-full mt-4">
                      <h4 className="text-sm font-medium mb-2">Thumbnail</h4>
                      
                      {!thumbnailFile ? (
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm transition-colors w-full flex items-center justify-center"
                          >
                            <FaImage className="mr-2" />
                            Adicionar Thumbnail
                          </button>
                          
                          <input
                            type="file"
                            ref={thumbnailInputRef}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleThumbnailSelect(e.target.files[0]);
                              }
                            }}
                            accept="image/*"
                            className="hidden"
                          />
                          
                          <p className="text-gray-500 text-xs mt-2 text-center">
                            Recomendado: 1280x720 pixels
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="relative w-full h-32 mb-2">
                            <Image
                              src={thumbnailPreview || ''}
                              alt="Thumbnail"
                              fill
                              style={{ objectFit: 'cover' }}
                              className="rounded-lg"
                            />
                          </div>
                          
                          <button
                            onClick={handleClearThumbnail}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                          >
                            <FaTimes className="mr-1 inline" />
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <div className="bg-gray-700/50 rounded-lg p-6">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-gray-300 mb-1 text-sm">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={videoTitle}
                        onChange={e => setVideoTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                        placeholder="Adicione um título para seu vídeo"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-gray-300 mb-1 text-sm">
                        Descrição
                      </label>
                      <textarea
                        id="description"
                        value={videoDescription}
                        onChange={e => setVideoDescription(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent min-h-[100px]"
                        placeholder="Adicione uma descrição para seu vídeo"
                      ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="genre" className="block text-gray-300 mb-1 text-sm">
                          Gênero
                        </label>
                        <input
                          type="text"
                          id="genre"
                          value={videoGenre}
                          onChange={e => setVideoGenre(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                          placeholder="Ex: Pop, Rock, Hip Hop"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="director" className="block text-gray-300 mb-1 text-sm">
                          Diretor
                        </label>
                        <input
                          type="text"
                          id="director"
                          value={director}
                          onChange={e => setDirector(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                          placeholder="Nome do diretor do vídeo"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">
                        Tipo de Vídeo
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={isVideoClip}
                            onChange={e => setIsVideoClip(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 bg-gray-700 border-gray-500"
                          />
                          <span className="ml-2 text-gray-300">Videoclipe</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">
                        Visibilidade
                      </label>
                      <div className="flex flex-wrap gap-4">
                        <label className="inline-flex items-center bg-gray-700/50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                          <input
                            type="radio"
                            name="visibility"
                            value="public"
                            checked={videoVisibility === 'public'}
                            onChange={() => setVideoVisibility('public')}
                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 flex items-center">
                            <FaGlobe className="mr-1" /> Público
                          </span>
                        </label>
                        
                        <label className="inline-flex items-center bg-gray-700/50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                          <input
                            type="radio"
                            name="visibility"
                            value="followers"
                            checked={videoVisibility === 'followers'}
                            onChange={() => setVideoVisibility('followers')}
                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 flex items-center">
                            <FaUsers className="mr-1" /> Seguidores
                          </span>
                        </label>
                        
                        <label className="inline-flex items-center bg-gray-700/50 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                          <input
                            type="radio"
                            name="visibility"
                            value="private"
                            checked={videoVisibility === 'private'}
                            onChange={() => setVideoVisibility('private')}
                            className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500 bg-gray-700 border-gray-600"
                          />
                          <span className="ml-2 flex items-center">
                            <FaLock className="mr-1" /> Privado
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="tags" className="block text-gray-300 mb-1 text-sm">
                        Tags (máximo 5)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="tags"
                          value={tagInput}
                          onChange={e => setTagInput(e.target.value)}
                          onKeyDown={handleTagInputKeyDown}
                          className="w-full px-4 py-2 rounded-lg bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                          placeholder="Adicione tags e pressione Enter"
                          disabled={tags.length >= 5}
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          disabled={tags.length >= 5 || tagInput.trim() === ''}
                          className="absolute right-0 top-0 h-full px-4 text-gray-300 hover:text-white disabled:text-gray-500 transition-colors"
                        >
                          Adicionar
                        </button>
                      </div>
                      
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map(tag => (
                            <div 
                              key={tag} 
                              className="bg-indigo-900/50 border border-indigo-800 px-3 py-1 rounded-full text-sm flex items-center"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-2 text-gray-400 hover:text-white"
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        As tags ajudam a tornar seu vídeo mais fácil de encontrar
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBackToVideo}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Voltar
              </button>
              
              <button
                onClick={handleStartUpload}
                disabled={!videoTitle.trim()}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center ${!videoTitle.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaCloudUploadAlt className="mr-2" /> Publicar Vídeo
              </button>
            </div>
          </div>
        );
        
      case 'uploading':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Enviando Vídeo</h1>
            
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <FaCloudUploadAlt className="text-5xl text-indigo-400 animate-pulse" />
              </div>
              <p className="text-gray-300 mb-2">
                Enviando "{videoTitle}"
              </p>
              <p className="text-gray-400 text-sm">
                Isso pode levar alguns minutos, dependendo do tamanho do arquivo.
              </p>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            
            <p className="text-center text-gray-400">
              {uploadProgress}% concluído
            </p>
          </div>
        );
        
      case 'success':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center text-green-500">Upload Concluído!</h1>
            
            <div className="text-center mb-8">
              <div className="w-full max-h-40 mx-auto mb-4 relative overflow-hidden rounded-lg shadow-lg">
                {thumbnailPreview ? (
                  <div className="relative w-full h-40">
                    <Image
                      src={thumbnailPreview}
                      alt="Thumbnail do vídeo"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-700 flex items-center justify-center">
                    <FaVideo className="text-4xl text-indigo-400" />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">{videoTitle}</h2>
              <p className="text-gray-400">
                Seu vídeo foi enviado com sucesso!
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <Link 
                href={`/artist/videos/${uploadResult?.clipId}`}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors text-center"
              >
                Ver Vídeo
              </Link>
              
              <button
                onClick={handleReset}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                Enviar Outro Vídeo
              </button>
            </div>
          </div>
        );
        
      case 'error':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center text-red-500">Erro no Upload</h1>
            
            <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-8 text-red-200">
              <p>{error || 'Ocorreu um erro ao fazer o upload do vídeo. Por favor, tente novamente.'}</p>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8">
      {renderContent()}
    </div>
  )
}
