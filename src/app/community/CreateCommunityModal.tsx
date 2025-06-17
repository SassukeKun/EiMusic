'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Users, 
  Globe, 
  Lock, 
  UserCheck,
  Music,
  Mic,
  MapPin,
  Calendar,
  Save,
  AlertCircle
} from 'lucide-react'

// Interface para dados da comunidade - Boa prática de tipagem forte
interface CommunityFormData {
  nome: string
  descricao: string
  categoria: string
  privacidade: 'public' | 'private' | 'invite_only'
  imagem: File | null
  tags: string[]
}

// Interface para props do modal
interface CreateCommunityModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CommunityFormData) => Promise<void>
}

// Componente do Modal de Criação de Comunidade
export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // Estados para gerenciamento do formulário
  const [formData, setFormData] = useState<CommunityFormData>({
    nome: '',
    descricao: '',
    categoria: '',
    privacidade: 'public',
    imagem: null,
    tags: []
  })
  
  // Estados de controle de UI
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  
  // Referências para elementos DOM
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Categorias disponíveis - Mock data moçambicano
  const categorias = [
    { value: 'musica', label: '🎵 Música', icon: Music },
    { value: 'artistas', label: '🎤 Artistas', icon: Mic },
    { value: 'generos', label: '🎼 Gêneros', icon: Music },
    { value: 'cidades', label: '🏙️ Cidades', icon: MapPin },
    { value: 'eventos', label: '📅 Eventos', icon: Calendar }
  ]
  
  // Opções de privacidade
  const privacidadeOptions = [
    {
      value: 'public' as const,
      label: 'Pública',
      description: 'Qualquer pessoa pode ver e participar',
      icon: Globe,
      color: 'text-green-400'
    },
    {
      value: 'private' as const,
      label: 'Privada',
      description: 'Apenas membros aprovados podem participar',
      icon: Lock,
      color: 'text-yellow-400'
    },
    {
      value: 'invite_only' as const,
      label: 'Apenas Convidados',
      description: 'Somente por convite direto',
      icon: UserCheck,
      color: 'text-purple-400'
    }
  ]

  // Função para validar formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    // Validação do nome (obrigatório, mínimo 3 caracteres)
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da comunidade é obrigatório'
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres'
    }
    
    // Validação da descrição (obrigatório, mínimo 10 caracteres)
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    } else if (formData.descricao.trim().length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres'
    }
    
    // Validação da categoria (obrigatório)
    if (!formData.categoria) {
      newErrors.categoria = 'Selecione uma categoria'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handler para upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validação do arquivo
      if (file.size > 5 * 1024 * 1024) { // 5MB máximo
        setErrors(prev => ({ ...prev, imagem: 'Imagem deve ter menos de 5MB' }))
        return
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imagem: 'Arquivo deve ser uma imagem' }))
        return
      }
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      // Atualizar form data
      setFormData(prev => ({ ...prev, imagem: file }))
      
      // Limpar erro de imagem se existir
      setErrors(prev => {
        const { imagem, ...rest } = prev
        return rest
      })
    }
  }

  // Handler para adicionar tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  // Handler para remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Handler para submissão do formulário
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsLoading(true)
    try {
      await onSubmit(formData)
      // Reset form após sucesso
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        privacidade: 'public',
        imagem: null,
        tags: []
      })
      setImagePreview(null)
      setTagInput('')
      setErrors({})
      onClose()
    } catch (error) {
      console.error('Erro ao criar comunidade:', error)
      setErrors({ submit: 'Erro ao criar comunidade. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  // Handler para fechar modal
  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  // Handler para tecla ESC
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !isLoading) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
              onKeyDown={handleKeyDown}
              tabIndex={-1}
            >
              {/* Card principal com gradiente */}
              <div className="bg-gradient-to-br from-gray-800/95 via-purple-900/30 to-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700 shadow-2xl">
                
                {/* Header do modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      Criar Nova Comunidade
                    </h2>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClose}
                    disabled={isLoading}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </motion.button>
                </div>

                {/* Conteúdo do formulário */}
                <div className="p-6 space-y-6">
                  
                  {/* Upload de imagem */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Imagem da Comunidade
                    </label>
                    
                    <div className="flex items-center space-x-4">
                      {/* Preview da imagem */}
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-600 hover:border-purple-500 transition-colors duration-200"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-white" />
                          )}
                        </motion.div>
                        
                        {imagePreview && (
                          <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.1 }}
                            onClick={() => {
                              setImagePreview(null)
                              setFormData(prev => ({ ...prev, imagem: null }))
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4 text-white" />
                          </motion.button>
                        )}
                      </div>
                      
                      {/* Botão de upload */}
                      <div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Escolher Imagem</span>
                        </motion.button>
                        <p className="text-xs text-gray-400 mt-1">
                          PNG, JPG até 5MB
                        </p>
                      </div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    {errors.imagem && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center space-x-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.imagem}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Nome da comunidade */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Nome da Comunidade *
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Marrabenta Moderna"
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        errors.nome 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:ring-purple-500 hover:border-purple-500/50'
                      }`}
                    />
                    {errors.nome && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center space-x-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.nome}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Descrição *
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o propósito e objetivo da sua comunidade..."
                      rows={4}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 resize-none ${
                        errors.descricao 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:ring-purple-500 hover:border-purple-500/50'
                      }`}
                    />
                    {errors.descricao && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center space-x-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.descricao}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Categoria */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Categoria *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {categorias.map((categoria) => {
                        const Icon = categoria.icon
                        return (
                          <motion.button
                            key={categoria.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, categoria: categoria.value }))}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                              formData.categoria === categoria.value
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-600 hover:border-purple-500/50 bg-gray-800/30'
                            }`}
                          >
                            <Icon className="w-5 h-5 text-purple-400" />
                            <span className="text-white font-medium">{categoria.label}</span>
                          </motion.button>
                        )
                      })}
                    </div>
                    {errors.categoria && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm flex items-center space-x-1"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.categoria}</span>
                      </motion.p>
                    )}
                  </div>

                  {/* Tipo de Privacidade */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Tipo de Privacidade
                    </label>
                    <div className="space-y-3">
                      {privacidadeOptions.map((option) => {
                        const Icon = option.icon
                        return (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.01 }}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, privacidade: option.value }))}
                            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                              formData.privacidade === option.value
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-gray-600 hover:border-purple-500/50 bg-gray-800/30'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-5 h-5 ${option.color}`} />
                              <div className="text-left">
                                <p className="text-white font-medium">{option.label}</p>
                                <p className="text-gray-400 text-sm">{option.description}</p>
                              </div>
                            </div>
                            
                            {formData.privacidade === option.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.1 }}
                                  className="w-2 h-2 bg-white rounded-full"
                                />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Tags (máximo 5)
                    </label>
                    
                    {/* Input para adicionar tags */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddTag()
                          }
                        }}
                        placeholder="Digite uma tag e pressione Enter"
                        className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-500/50 transition-all duration-200"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleAddTag}
                        disabled={!tagInput.trim() || formData.tags.length >= 5}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
                      >
                        Adicionar
                      </motion.button>
                    </div>
                    
                    {/* Tags adicionadas */}
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {formData.tags.map((tag, index) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center space-x-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg px-3 py-1"
                          >
                            <span className="text-white text-sm">#{tag}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveTag(tag)}
                              className="text-gray-400 hover:text-red-400 transition-colors duration-200"
                            >
                              <X className="w-3 h-3" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Erro geral */}
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                    >
                      <p className="text-red-400 text-sm flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.submit}</span>
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Footer com botões */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-2 border border-gray-600 hover:border-gray-500 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancelar
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>Criando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Criar Comunidade</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}