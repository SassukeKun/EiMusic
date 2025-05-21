// src/app/upload/page.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useAnimation } from 'framer-motion'
import { 
  FaUpload, 
  FaImage, 
  FaTimes, 
  FaMusic, 
  FaInfoCircle, 
  FaChevronDown,
  FaGlobe,
  FaLock,
  FaUsers,
  FaSave,
  FaCloudUploadAlt,
  FaHeadphones,
  FaQuestion,
  FaSearch
} from 'react-icons/fa'

export default function UploadPage() {
  // Simulação para demonstrar o front-end (seria substituído pela verificação real do backend)
  const isArtist = true;

  // Estados para gerenciar o upload e formulário
  const [uploadStep, setUploadStep] = useState<'initial' | 'details'>('initial')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioName, setAudioName] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [dragOver, setDragOver] = useState<boolean>(false)
  const [showTooltip, setShowTooltip] = useState<boolean>(false)
  const [activeTip, setActiveTip] = useState<number>(0)
  
  // Estados do formulário de detalhes
  const [title, setTitle] = useState<string>('')
  const [genre, setGenre] = useState<string>('')
  const [mood, setMood] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState<'public' | 'private' | 'followers'>('public')
  const [tagInput, setTagInput] = useState<string>('')
  
  // Refs para os inputs de arquivo
  const audioInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  
  // Dicas úteis para artistas
  const tips = [
    "Adicione uma imagem de capa atraente para destacar sua música.",
    "Use tags relevantes para ajudar na descoberta de suas faixas.",
    "Escolha o gênero correto para alcançar o público certo.",
    "Uma boa descrição ajuda a conectar-se com seus ouvintes.",
    "Compartilhe sua música nas redes sociais para aumentar o alcance."
  ];
  
  // Animações para o cabeçalho
  const iconControls = useAnimation();
  
  useEffect(() => {
    iconControls.start({
      y: [0, -10, 0],
      transition: { 
        repeat: Infinity,
        repeatType: "reverse",
        duration: 3
      }
    });
    
    // Rotacionar as dicas a cada 5 segundos
    const tipInterval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    
    return () => clearInterval(tipInterval);
  }, []);
  
  // Simular upload de progresso
  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadStep('details')
          return 100
        }
        return prev + 5
      })
    }, 200)
  }
  
  // Manipuladores de arquivo de áudio
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAudioFile(file)
      setAudioName(file.name)
      simulateUpload()
    }
  }
  
  const handleAudioDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('audio/')) {
        setAudioFile(file)
        setAudioName(file.name)
        simulateUpload()
      }
    }
  }
  
  // Manipuladores de imagem de capa
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setCoverImage(event.target.result)
        }
      }
      
      reader.readAsDataURL(file)
    }
  }
  
  // Manipulador de tags
  const handleAddTag = () => {
    if (tagInput.trim() !== '' && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }
  
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }
  
  // Manipulador de envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulação de envio para o backend
    alert('Música enviada com sucesso!')
    handleCancelUpload()
  }
  
  // Cancelar upload e voltar ao início
  const handleCancelUpload = () => {
    setAudioFile(null)
    setAudioName('')
    setUploadStep('initial')
    setCoverImage(null)
    setTitle('')
    setGenre('')
    setMood('')
    setDescription('')
    setTags([])
    setVisibility('public')
  }

  // Verificação de artista (apenas para demonstração do UI)
  if (!isArtist) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-xl">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-gray-400 mb-6">
            Esta página é exclusiva para artistas. Registre-se como artista para fazer upload de músicas.
          </p>
          <Link href="/artist/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
            Registrar como Artista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Cabeçalho atrativo */}
      <div className="w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 border-b border-indigo-800/50">
        <div className="max-w-5xl mx-auto px-4 py-6 relative overflow-hidden">
          {/* Elementos decorativos de fundo */}
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl"></div>
          <div className="absolute bottom-2 left-1/4 w-32 h-32 rounded-full bg-purple-500/10 blur-xl"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-indigo-400/10 blur-lg"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <motion.div animate={iconControls}>
                  <FaCloudUploadAlt className="text-4xl md:text-5xl text-indigo-400" />
                </motion.div>
                <h1 className="text-3xl md:text-4xl font-bold ml-4 text-white">Publique sua arte</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center">
              {/* Barra de busca para referência */}
              <div className="relative mr-6">
                <input 
                  type="text" 
                  placeholder="Pesquisar uploads anteriores..."
                  className="bg-gray-800/60 border border-gray-700 rounded-full px-4 py-2 pl-10 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-56"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
              
              {/* Botão de ajuda */}
              <div className="relative">
                <button 
                  className="p-2 rounded-full bg-indigo-800/50 hover:bg-indigo-700/60 text-white transition-colors"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <FaQuestion />
                </button>
                
                {showTooltip && (
                  <div className="absolute right-0 mt-2 w-64 p-3 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                    <p className="text-sm text-gray-300">{tips[activeTip]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Barra de progresso de upload */}
          {isUploading && (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Dica rotativa em dispositivos móveis */}
      <div className="md:hidden bg-indigo-900/30 border-b border-indigo-800/20">
        <div className="max-w-5xl mx-auto px-4 py-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={activeTip}
            transition={{ duration: 0.5 }}
            className="flex items-center text-sm text-gray-300"
          >
            <FaInfoCircle className="text-indigo-400 mr-2 flex-shrink-0" />
            <p>{tips[activeTip]}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Compartilhe seu som</h1>
        <p className="text-gray-400 mb-8">Transforme sua música em uma experiência para o mundo</p>
        
        {uploadStep === 'initial' ? (
          <motion.div 
            className={`
              border-2 border-dashed rounded-xl p-10 text-center
              ${dragOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/30'} 
              transition-colors cursor-pointer
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleAudioDrop}
            onClick={() => audioInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={audioInputRef} 
              className="hidden" 
              accept="audio/*" 
              onChange={handleAudioSelect}
            />
            
            <div className="flex flex-col items-center justify-center py-10">
              <motion.div 
                className="bg-indigo-700/30 p-4 rounded-full mb-4"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ['0px 0px 0px rgba(99, 102, 241, 0.2)', '0px 0px 20px rgba(99, 102, 241, 0.4)', '0px 0px 0px rgba(99, 102, 241, 0.2)'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FaMusic className="text-4xl text-indigo-400" />
              </motion.div>
              <h2 className="text-xl font-semibold mb-2">Arraste e solte seu arquivo de áudio aqui</h2>
              <p className="text-gray-400 mb-6">ou clique para selecionar um arquivo</p>
              <motion.button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaUpload className="mr-2" /> Escolher Arquivo
              </motion.button>
              <p className="text-gray-500 mt-6 text-sm">
                Formatos suportados: MP3, WAV, OGG, FLAC (até 50MB)
              </p>
              
              {/* Estatísticas de upload decorativas */}
              <div className="mt-10 grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="text-center p-3 bg-gray-800/40 rounded-lg">
                  <div className="text-indigo-400 mb-1">
                    <FaHeadphones className="mx-auto text-xl" />
                  </div>
                  <p className="text-xl font-semibold text-gray-200">1.4k</p>
                  <p className="text-xs text-gray-500">Ouvintes</p>
                </div>
                <div className="text-center p-3 bg-gray-800/40 rounded-lg">
                  <div className="text-indigo-400 mb-1">
                    <FaMusic className="mx-auto text-xl" />
                  </div>
                  <p className="text-xl font-semibold text-gray-200">24</p>
                  <p className="text-xs text-gray-500">Seus uploads</p>
                </div>
                <div className="text-center p-3 bg-gray-800/40 rounded-lg">
                  <div className="text-indigo-400 mb-1">
                    <FaUsers className="mx-auto text-xl" />
                  </div>
                  <p className="text-xl font-semibold text-gray-200">328</p>
                  <p className="text-xs text-gray-500">Seguidores</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="bg-gray-800 rounded-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Informações da Faixa</h2>
                <button 
                  onClick={handleCancelUpload} 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
              
              {isUploading ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">{audioName}</span>
                    <span className="text-gray-400 text-sm">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex items-center">
                  <FaMusic className="text-indigo-400 mr-2" />
                  <span className="text-gray-300 text-sm">{audioName}</span>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div 
                    className="bg-gray-700 rounded-lg overflow-hidden relative aspect-square cursor-pointer"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={imageInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleCoverSelect}
                    />
                    
                    {coverImage ? (
                      <Image 
                        src={coverImage} 
                        alt="Cover art" 
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <FaImage className="text-4xl text-gray-500 mb-2" />
                        <span className="text-gray-500 text-sm">Adicionar capa</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="text-gray-300 flex items-center text-sm mb-2">
                      <FaGlobe className="mr-2 text-gray-400" /> Visibilidade
                    </label>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setVisibility('public')}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors
                          ${visibility === 'public' 
                            ? 'bg-indigo-800/50 border border-indigo-700' 
                            : 'bg-gray-700 hover:bg-gray-700/80'}`}
                      >
                        <div className="flex items-center">
                          <FaGlobe className="mr-2 text-sm" /> 
                          <span>Público</span>
                        </div>
                        {visibility === 'public' && (
                          <div className="bg-indigo-500 w-3 h-3 rounded-full"></div>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setVisibility('followers')}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors
                          ${visibility === 'followers' 
                            ? 'bg-indigo-800/50 border border-indigo-700' 
                            : 'bg-gray-700 hover:bg-gray-700/80'}`}
                      >
                        <div className="flex items-center">
                          <FaUsers className="mr-2 text-sm" /> 
                          <span>Seguidores</span>
                        </div>
                        {visibility === 'followers' && (
                          <div className="bg-indigo-500 w-3 h-3 rounded-full"></div>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setVisibility('private')}
                        className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors
                          ${visibility === 'private' 
                            ? 'bg-indigo-800/50 border border-indigo-700' 
                            : 'bg-gray-700 hover:bg-gray-700/80'}`}
                      >
                        <div className="flex items-center">
                          <FaLock className="mr-2 text-sm" /> 
                          <span>Privado</span>
                        </div>
                        {visibility === 'private' && (
                          <div className="bg-indigo-500 w-3 h-3 rounded-full"></div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-gray-300 mb-1 text-sm">
                      Título*
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                      placeholder="Adicione um título"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="genre" className="block text-gray-300 mb-1 text-sm">
                        Gênero
                      </label>
                      <div className="relative">
                        <select
                          id="genre"
                          value={genre}
                          onChange={e => setGenre(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                        >
                          <option value="">Selecione um gênero</option>
                          <option value="afrobeat">Afrobeat</option>
                          <option value="hip-hop">Hip Hop</option>
                          <option value="r-b">R&B</option>
                          <option value="kizomba">Kizomba</option>
                          <option value="afro-house">Afro House</option>
                          <option value="pop">Pop</option>
                          <option value="dancehall">Dancehall</option>
                          <option value="reggae">Reggae</option>
                          <option value="amapiano">Amapiano</option>
                          <option value="rap">Rap</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <FaChevronDown className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="mood" className="block text-gray-300 mb-1 text-sm">
                        Mood
                      </label>
                      <div className="relative">
                        <select
                          id="mood"
                          value={mood}
                          onChange={e => setMood(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
                        >
                          <option value="">Selecione um mood</option>
                          <option value="danceable">Dançante</option>
                          <option value="energetic">Energético</option>
                          <option value="chill">Tranquilo</option>
                          <option value="romantic">Romântico</option>
                          <option value="happy">Feliz</option>
                          <option value="sad">Triste</option>
                          <option value="party">Festa</option>
                          <option value="focus">Concentração</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <FaChevronDown className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-gray-300 mb-1 text-sm">
                      Descrição
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent min-h-[100px]"
                      placeholder="Adicione uma descrição para sua faixa"
                    ></textarea>
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
                        className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
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
                      As tags ajudam a tornar sua música mais fácil de encontrar
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <motion.button
                  type="button"
                  onClick={handleCancelUpload}
                  className="bg-transparent hover:bg-gray-700 text-gray-300 font-medium py-2 px-6 rounded-lg transition-colors mr-3"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <FaSave className="mr-2" /> Publicar Faixa
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}