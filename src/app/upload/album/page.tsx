'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { FaUpload, FaImage, FaTimes, FaMusic, FaPlus, FaMinus, FaGlobe, FaLock, FaUsers, FaSave, FaCloudUploadAlt } from 'react-icons/fa'
import FileUploader from '@/components/upload/FileUploader'
import uploadService from '@/services/uploadService'

// Componente principal para upload de álbum
export default function AlbumUploadPage() {
  const { isArtist, loading, user } = useAuth();
  
  // Estado para gerenciar upload de álbum
  const [uploadStep, setUploadStep] = useState<'initial' | 'tracks' | 'details' | 'uploading' | 'success' | 'error'>('initial');
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtPreview, setCoverArtPreview] = useState<string | undefined>(undefined);
  const [trackFiles, setTrackFiles] = useState<File[]>([]);
  const [trackFileNames, setTrackFileNames] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para metadados do álbum
  const [albumTitle, setAlbumTitle] = useState<string>('');
  const [albumDescription, setAlbumDescription] = useState<string>('');
  const [albumGenre, setAlbumGenre] = useState<string>('');
  const [albumVisibility, setAlbumVisibility] = useState<'public' | 'private' | 'followers'>('public');
  const [isExplicit, setIsExplicit] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  
  // Refs
  const audioInputRef = useRef<HTMLInputElement>(null);
  
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
            Esta página é exclusiva para artistas. Registre-se como artista para fazer upload de álbuns.
          </p>
          <Link href="/artist/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
            Registrar como Artista
          </Link>
        </div>
      </div>
    );
  }
  
  // Manipulador para seleção de capa do álbum
  const handleCoverArtSelect = (file: File) => {
    setCoverArtFile(file);
    const objectUrl = URL.createObjectURL(file);
    setCoverArtPreview(objectUrl);
    
    // Se for o primeiro passo, avançar para a seleção de faixas
    if (uploadStep === 'initial') {
      setUploadStep('tracks');
    }
    
    return () => URL.revokeObjectURL(objectUrl);
  };
  
  // Manipulador para limpar a capa
  const handleClearCoverArt = () => {
    setCoverArtFile(null);
    setCoverArtPreview(undefined);
  };
  
  // Manipulador para adicionar faixas
  const handleAddTrack = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Verificar tipos de arquivo
      const validFiles = newFiles.filter(file => file.type.startsWith('audio/'));
      if (validFiles.length !== newFiles.length) {
        setError('Alguns arquivos não são de áudio e foram ignorados');
      }
      
      // Verificar tamanho de arquivos (50MB máximo por arquivo)
      const validSizeFiles = validFiles.filter(file => file.size <= 50 * 1024 * 1024);
      if (validSizeFiles.length !== validFiles.length) {
        setError('Alguns arquivos são maiores que 50MB e foram ignorados');
      }
      
      // Adicionar ao estado
      setTrackFiles(prev => [...prev, ...validSizeFiles]);
      setTrackFileNames(prev => [...prev, ...validSizeFiles.map(file => file.name)]);
      
      // Limpar input
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };
  
  // Manipulador para remover uma faixa
  const handleRemoveTrack = (index: number) => {
    setTrackFiles(prev => prev.filter((_, i) => i !== index));
    setTrackFileNames(prev => prev.filter((_, i) => i !== index));
  };
  
  // Manipulador para adicionar tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  // Manipulador para remover tag
  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };
  
  // Manipulador para enviar para detalhes
  const handleProceedToDetails = () => {
    if (trackFiles.length === 0) {
      setError('Adicione pelo menos uma faixa ao álbum');
      return;
    }
    
    setError(null);
    setUploadStep('details');
  };
  
  // Manipulador para voltar para seleção de faixas
  const handleBackToTracks = () => {
    setUploadStep('tracks');
  };
  
  // Manipulador para iniciar upload
  const handleStartUpload = async () => {
    if (!albumTitle.trim()) {
      setError('O título do álbum é obrigatório');
      return;
    }
    
    if (!coverArtFile) {
      setError('A capa do álbum é obrigatória');
      return;
    }
    
    if (trackFiles.length === 0) {
      setError('Adicione pelo menos uma faixa ao álbum');
      return;
    }
    
    try {
      setError(null);
      setUploadStep('uploading');
      setUploadProgress(0);
      
      // Metadados do álbum
      const albumMetadata = {
        title: albumTitle,
        description: albumDescription,
        genre: albumGenre,
        visibility: albumVisibility,
        isExplicit,
        tags
      };
      
      // Simular progresso (em uma implementação real, usaríamos eventos de progresso)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 300);
      
      // Fazer upload do álbum
      const result = await uploadService.uploadAlbum(
        user?.id || '',
        coverArtFile,
        trackFiles,
        albumMetadata
      );
      
      // Limpar intervalo e definir progresso como 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Definir resultado e mudar para sucesso
      setUploadResult(result);
      setUploadStep('success');
    } catch (err: any) {
      console.error('Erro ao fazer upload do álbum:', err);
      setError(err.message || 'Ocorreu um erro ao fazer upload do álbum');
      setUploadStep('error');
    }
  };
  
  // Manipulador para reiniciar o processo
  const handleReset = () => {
    setCoverArtFile(null);
    setCoverArtPreview(undefined);
    setTrackFiles([]);
    setTrackFileNames([]);
    setAlbumTitle('');
    setAlbumDescription('');
    setAlbumGenre('');
    setAlbumVisibility('public');
    setIsExplicit(false);
    setTags([]);
    setTagInput('');
    setError(null);
    setUploadResult(null);
    setUploadProgress(0);
    setUploadStep('initial');
  };

  // Renderização do conteúdo com base na etapa atual
  const renderContent = () => {
    switch (uploadStep) {
      case 'initial':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Upload de Álbum</h1>
            <p className="text-gray-300 mb-8 text-center">
              Comece carregando a capa do seu álbum. Em seguida, você poderá adicionar as faixas e os detalhes.
            </p>
            
            <div className="w-64 h-64 mx-auto mb-8">
              <FileUploader
                type="image"
                accept="image/*"
                maxSize={5}
                label="Escolher capa do álbum"
                onFileSelect={handleCoverArtSelect}
                previewUrl={coverArtPreview}
                onClearFile={handleClearCoverArt}
              />
            </div>
          </div>
        );
      
      case 'tracks':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Adicionar Faixas</h1>
            
            <div className="flex mb-8">
              <div className="w-32 h-32 mr-6">
                {coverArtPreview && (
                  <div className="relative w-full h-full">
                    <Image
                      src={coverArtPreview}
                      alt="Capa do álbum"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-lg"
                    />
                    <button 
                      onClick={handleClearCoverArt}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-gray-300 mb-4">
                  Adicione as faixas do seu álbum. Você pode adicionar múltiplos arquivos de áudio.
                </p>
                
                <input
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleAddTrack}
                  ref={audioInputRef}
                  className="hidden"
                  id="audio-upload"
                />
                
                <label 
                  htmlFor="audio-upload"
                  className="flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer text-white transition-colors"
                >
                  <FaMusic className="mr-2" />
                  Adicionar faixas
                </label>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-500 p-3 rounded-lg mb-4 text-red-200">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">Faixas ({trackFiles.length})</h2>
              
              {trackFiles.length === 0 ? (
                <p className="text-gray-400 italic">Nenhuma faixa adicionada</p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {trackFileNames.map((name, index) => (
                    <li key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FaMusic className="text-indigo-400 mr-2" />
                        <span className="truncate max-w-xs">{name}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveTrack(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTimes />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setUploadStep('initial')}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                Voltar
              </button>
              
              <button
                onClick={handleProceedToDetails}
                disabled={trackFiles.length === 0}
                className={`py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors ${
                  trackFiles.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Próximo: Detalhes
              </button>
            </div>
          </div>
        );
      
      case 'details':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Detalhes do Álbum</h1>
            
            <div className="flex mb-8">
              <div className="w-32 h-32 mr-6">
                {coverArtPreview && (
                  <div className="relative w-full h-full">
                    <Image
                      src={coverArtPreview}
                      alt="Capa do álbum"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <p className="text-gray-300 mb-2">
                  {trackFiles.length} faixa{trackFiles.length !== 1 ? 's' : ''} selecionada{trackFiles.length !== 1 ? 's' : ''}
                </p>
                <p className="text-gray-400 text-sm">
                  Preencha os detalhes do seu álbum para concluir o upload.
                </p>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-500 p-3 rounded-lg mb-4 text-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-300 mb-1">Título do Álbum *</label>
                <input
                  type="text"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Digite o título do álbum"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Descrição</label>
                <textarea
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Adicione uma descrição para o álbum"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Gênero</label>
                <select
                  value={albumGenre}
                  onChange={(e) => setAlbumGenre(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione um gênero</option>
                  <option value="pop">Pop</option>
                  <option value="rock">Rock</option>
                  <option value="hiphop">Hip Hop</option>
                  <option value="rnb">R&B</option>
                  <option value="jazz">Jazz</option>
                  <option value="electronic">Eletrônica</option>
                  <option value="classical">Clássica</option>
                  <option value="country">Country</option>
                  <option value="reggae">Reggae</option>
                  <option value="blues">Blues</option>
                  <option value="folk">Folk</option>
                  <option value="metal">Metal</option>
                  <option value="punk">Punk</option>
                  <option value="indie">Indie</option>
                  <option value="latin">Latina</option>
                  <option value="funk">Funk</option>
                  <option value="soul">Soul</option>
                  <option value="alternative">Alternativa</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Visibilidade</label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={albumVisibility === 'public'}
                      onChange={() => setAlbumVisibility('public')}
                      className="mr-2"
                    />
                    <FaGlobe className="mr-1 text-gray-400" />
                    Público
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="followers"
                      checked={albumVisibility === 'followers'}
                      onChange={() => setAlbumVisibility('followers')}
                      className="mr-2"
                    />
                    <FaUsers className="mr-1 text-gray-400" />
                    Seguidores
                  </label>
                  
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={albumVisibility === 'private'}
                      onChange={() => setAlbumVisibility('private')}
                      className="mr-2"
                    />
                    <FaLock className="mr-1 text-gray-400" />
                    Privado
                  </label>
                </div>
              </div>
              
              <div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isExplicit}
                    onChange={(e) => setIsExplicit(e.target.checked)}
                    className="mr-2"
                  />
                  Conteúdo explícito
                </label>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-1">Tags</label>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    className="flex-1 bg-gray-700 text-white rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Adicionar tag"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-lg px-3 py-2"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <div key={tag} className="bg-indigo-600/30 text-indigo-200 rounded-full px-3 py-1 text-sm flex items-center">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-indigo-300 hover:text-white"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleBackToTracks}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                Voltar
              </button>
              
              <button
                onClick={handleStartUpload}
                disabled={!albumTitle.trim()}
                className={`py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors ${
                  !albumTitle.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Iniciar Upload
              </button>
            </div>
          </div>
        );
      
      case 'uploading':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center">Enviando Álbum</h1>
            
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <FaCloudUploadAlt className="text-5xl text-indigo-400 animate-pulse" />
              </div>
              <p className="text-gray-300 mb-2">
                Enviando "{albumTitle}"
              </p>
              <p className="text-gray-400 text-sm">
                Isso pode levar alguns minutos, dependendo do tamanho dos arquivos.
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
              <div className="w-32 h-32 mx-auto mb-4">
                {coverArtPreview && (
                  <div className="relative w-full h-full">
                    <Image
                      src={coverArtPreview}
                      alt="Capa do álbum"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">{albumTitle}</h2>
              <p className="text-gray-400">
                {trackFiles.length} faixa{trackFiles.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <Link 
                href={`/artist/albums/${uploadResult?.albumId}`}
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors text-center"
              >
                Ver Álbum
              </Link>
              
              <button
                onClick={handleReset}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                Enviar Outro Álbum
              </button>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-center text-red-500">Erro no Upload</h1>
            
            <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg mb-8 text-red-200">
              <p>{error || 'Ocorreu um erro ao fazer o upload do álbum. Por favor, tente novamente.'}</p>
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
  );
}
