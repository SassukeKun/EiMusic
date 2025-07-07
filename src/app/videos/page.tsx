// src/app/videos/page.tsx
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabaseBrowserClient } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { 
  FaPlay, 
  FaShare,
  FaTimes,
  FaEye, 
  FaSearch, 
  FaVideo,
  FaCheckCircle, 
  FaBars, 
  FaList, 
  FaDownload, 
  FaFlag, 
  FaChartLine, 
  FaArrowUp,
  FaClock,
  FaChevronDown,
  FaEllipsisV,
  FaThumbsUp,
  FaThumbsDown,
  FaBookmark
} from "react-icons/fa";
import { VideoPlayer } from '@/components/VideoPlayer';

// ===== TIPOS TYPESCRIPT =====

// Database types
interface DatabaseVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  views: number;
  likes: number;
  dislikes: number;
  created_at: string;
  artist_id: string;
  genre: string;
}

interface DatabaseArtist {
  id: string;
  name: string;
  profile_image_url: string;
  verified: boolean;
  subscribers: number;
}
interface CommentUser {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
}

interface CommentBase {
  id: string;
  userId: string;
  videoId: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  user: CommentUser;
  isEdited?: boolean;
  isPinned?: boolean;
}

interface Comment extends CommentBase {
  replies?: CommentBase[];
}

interface Video {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    subscribers?: number;
  };
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: number;
  likes: number;
  dislikes: number;
  uploadDate: string;
  description: string;
  genre: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  isBookmarked?: boolean;
}

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  fallbackText?: string;
  style?: React.CSSProperties;
}

// ===== COMPONENTE SAFE IMAGE =====
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  fallbackText,
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    setError(true);
    setImgSrc(null);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (error || !imgSrc) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-800 text-gray-500 ${
          className || ""
        }`}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100%",
          ...(fill && { width: "100%", height: "100%" }),
        }}
      >
        {fallbackText || "Imagem não disponível"}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        onError={handleError}
        onLoad={handleLoad}
        className={`${isLoading ? "opacity-0" : "opacity-100"} ${
          fill ? "w-full h-full object-cover" : ""
        }`}
        style={{
          transition: "opacity 0.2s ease-in-out",
          ...(fill && { objectFit: 'cover' })
        }}
        loading="lazy"
        unoptimized={imgSrc.startsWith('data:')}
      />
    </div>
  );
};

// Comment form data type
interface CommentFormData {
  content: string;
  parentId?: string;
}

// ===== COMPONENTE FORMULÁRIO DE COMENTÁRIO =====
const CommentForm: React.FC<{
  onSubmit: (data: CommentFormData) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  parentId?: string;
  isReply?: boolean;
  isSubmitting?: boolean;
}> = ({
  onSubmit,
  onCancel,
  placeholder = "Adicione um comentário...",
  initialValue = "",
  autoFocus = false,
  parentId,
  isReply = false,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<{ content: string }>({
    content: initialValue || "",
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea conforme o conteúdo cresce
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData.content]);

  // Foco automático quando necessário
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      content: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.content.trim()) {
      onSubmit({
        content: formData.content.trim(),
        parentId,
      });
      setFormData({ content: "" });
    }
  };

  // Atalhos de teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }

    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${isReply ? "ml-4 md:ml-12" : ""}`}
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-start space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              name="content"
              value={formData.content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none overflow-hidden"
              rows={1}
              autoFocus={autoFocus}
              disabled={isSubmitting}
            />
            <div className="absolute right-3 bottom-3 flex items-center space-x-2">
              {formData.content && (
                <button
                  type="button"
                  onClick={() => setFormData({ content: '' })}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Limpar"
                  disabled={isSubmitting}
                >
                  <FaTimes />
                </button>
              )}
              <button
                type="submit"
                className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.content.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Enviando...
                  </span>
                ) : isReply ? (
                  "Responder"
                ) : (
                  "Comentar"
                )}
              </button>
            </div>
          </div>
        </div>
        {onCancel && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-gray-400 hover:text-white px-3 py-1 rounded disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          </div>
        )}
      </form>
    </motion.div>
  );
};

// ===== COMPONENTE ITEM DE COMENTÁRIO =====
const CommentItem: React.FC<{
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  depth?: number;
  maxDepth?: number;
}> = ({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  onPin,
  depth = 0,
  maxDepth = 3,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Calcular tempo relativo de forma mais legível
  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "agora mesmo";
    if (diffInMinutes < 60) return `há ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `há ${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `há ${Math.floor(diffInMinutes / 1440)}d`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  const handleReplySubmit = async (data: CommentFormData) => {
    await onReply(comment.id, data.content);
    setShowReplyForm(false);
  };

  const handleEditSubmit = async (data: CommentFormData) => {
    await onEdit(comment.id, data.content);
    setIsEditing(false);
  };

  // Determinar se pode ter mais respostas (evitar aninhamento muito profundo)
  const canReply = depth < maxDepth;
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${depth > 0 ? "ml-4 md:ml-8 lg:ml-12" : ""}
        ${
          comment.isPinned
            ? "bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-3"
            : ""
        }
      `}
    >
      {/* Indicador de comentário fixado */}
      {comment.isPinned && (
        <div className="flex items-center space-x-2 mb-3 text-indigo-400 text-xs">
          <FaThumbsUp className="rotate-180" />
          <span>Comentário fixado</span>
        </div>
      )}

      <div className="flex space-x-3">
        {/* Avatar do usuário */}
        <div className="flex-shrink-0">
          <div className="relative">
            <SafeImage
              src={comment.user.avatar}
              alt={comment.user.name}
              width={depth > 0 ? 32 : 40}
              height={depth > 0 ? 32 : 40}
              className="rounded-full"
              fallbackText={comment.user.name[0]}
            />
            {comment.user.verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-gray-900">
                <FaCheckCircle className="text-white text-xs" />
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo do comentário */}
        <div className="flex-1 min-w-0">
          {/* Header do comentário */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-semibold text-white text-sm">
                {comment.user.name}
              </span>
              <span className="text-gray-400 text-xs">
                {getTimeAgo(comment.timestamp)}
              </span>
              {comment.isEdited && (
                <span className="text-gray-500 text-xs">(editado)</span>
              )}
            </div>

            {/* Menu de opções */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FaEllipsisV size={12} />
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10"
                  >
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      >
                        Editar
                      </button>
                      {onPin && (
                        <button
                          onClick={() => {
                            onPin(comment.id);
                            setShowOptions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          {comment.isPinned ? "Desfixar" : "Fixar"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onDelete(comment.id);
                          setShowOptions(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Conteúdo do comentário */}
          <div className="group">
            {isEditing ? (
              <CommentForm
                onSubmit={handleEditSubmit}
                onCancel={() => setIsEditing(false)}
                placeholder="Editar comentário..."
                initialValue={comment.content}
                autoFocus
                isReply={depth > 0}
              />
            ) : (
              <div className="mb-3">
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            )}

            {/* Ações do comentário */}
            {!isEditing && (
              <div className="flex items-center space-x-4">
                {/* Botão de like */}
                <button
                  onClick={() => onLike(comment.id)}
                  className={`
                    flex items-center space-x-1 px-2 py-1 rounded-full text-xs
                    transition-colors ${
                      comment.isLiked
                        ? "text-indigo-500 bg-indigo-500/20"
                        : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-500/20"
                    }
                  `}
                >
                  <FaThumbsUp size={10} />
                  {comment.likes > 0 && (
                    <span>
                      {comment.likes >= 1000
                        ? `${(comment.likes / 1000).toFixed(1)}K`
                        : comment.likes}
                    </span>
                  )}
                </button>

                {/* Botão de responder */}
                {canReply && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-gray-400 hover:text-white text-xs transition-colors px-2 py-1 hover:bg-gray-700 rounded-full"
                  >
                    Responder
                  </button>
                )}

                {/* Mostrar/ocultar respostas */}
                {hasReplies && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>
                      {showReplies ? "Ocultar" : "Ver"}{" "}
                      {comment.replies!.length} resposta
                      {comment.replies!.length !== 1 ? "s" : ""}
                    </span>
                    <motion.div
                      animate={{ rotate: showReplies ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown size={10} />
                    </motion.div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Formulário de resposta */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <CommentForm
                  onSubmit={handleReplySubmit}
                  onCancel={() => setShowReplyForm(false)}
                  placeholder={`Responder a ${comment.user.name}...`}
                  autoFocus
                  parentId={comment.id}
                  isReply
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Respostas aninhadas */}
          <AnimatePresence>
            {showReplies && hasReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                {comment.replies!.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onLike={onLike}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

// ===== COMPONENTE VIDEO CARD MELHORADO =====
const VideoCard: React.FC<{
  video: Video;
  onVideoSelect: (video: Video) => void;
  onLike: (videoId: string) => void;
  onDislike: (videoId: string) => void;
  onBookmark: (videoId: string) => void;
  onShare: (video: Video) => void;
}> = ({ video, onVideoSelect, onLike, onDislike, onBookmark, onShare }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowOptions(false);
      }}
    >
      {/* Thumbnail Container */}
      <div className="relative mb-3">
        <div
          className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden cursor-pointer shadow-lg group-hover:shadow-xl transition-all duration-300"
          onClick={() => onVideoSelect(video)}
        >
          <SafeImage
            src={video.thumbnail}
            alt={video.title}
            fill
            className="group-hover:scale-105 transition-transform duration-500"
            fallbackText={video.title}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div
              className="bg-indigo-600 hover:bg-indigo-500 rounded-full p-4 shadow-2xl backdrop-blur-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlay className="text-white text-xl ml-1" />
            </motion.div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium backdrop-blur-sm">
            {video.duration}
          </div>

          {/* Quick Actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-2 right-2 flex flex-col space-y-2"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark(video.id);
                  }}
                  className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                    video.isBookmarked
                      ? "bg-blue-600 text-white"
                      : "bg-black/50 text-white hover:bg-black/70"
                  }`}
                  title="Salvar para mais tarde"
                >
                  <FaBookmark size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Video Info */}
      <div className="flex space-x-3">
        {/* Artist Avatar */}
        <Link href={`/artist/${video.artist.id}`}>
          <div className="relative flex-shrink-0 group/avatar">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover/avatar:ring-indigo-500 transition-all">
              <SafeImage
                src={video.artist.avatar}
                alt={video.artist.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                fallbackText={video.artist.name[0]}
              />
            </div>
            {video.artist.verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-gray-900">
                <FaCheckCircle className="text-white text-xs" />
              </div>
            )}
          </div>
        </Link>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors cursor-pointer"
            onClick={() => onVideoSelect(video)}
            title={video.title}
          >
            {video.title}
          </h3>

          <Link href={`/artist/${video.artist.id}`}>
            <p className="text-gray-400 text-xs hover:text-white transition-colors mb-1">
              {video.artist.name}
              {video.artist.subscribers && (
                <span className="ml-2">
                  {video.artist.subscribers >= 1000000
                    ? `${(video.artist.subscribers / 1000000).toFixed(1)}M`
                    : video.artist.subscribers >= 1000
                    ? `${(video.artist.subscribers / 1000).toFixed(0)}K`
                    : video.artist.subscribers}{" "}
                  inscritos
                </span>
              )}
            </p>
          </Link>

          <div className="flex items-center text-gray-400 text-xs space-x-2">
            <span className="flex items-center">
              <FaEye className="mr-1" />
              {video.views >= 1000000
                ? `${(video.views / 1000000).toFixed(1)}M`
                : video.views >= 1000
                ? `${(video.views / 1000).toFixed(0)}K`
                : video.views}{" "}
              visualizações
            </span>
            <span>•</span>
            <span>
              {(() => {
                const date = new Date(video.uploadDate);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) return "há 1 dia";
                if (diffDays < 7) return `há ${diffDays} dias`;
                if (diffDays < 30)
                  return `há ${Math.floor(diffDays / 7)} semana${
                    Math.floor(diffDays / 7) > 1 ? "s" : ""
                  }`;
                if (diffDays < 365)
                  return `há ${Math.floor(diffDays / 30)} mês${
                    Math.floor(diffDays / 30) > 1 ? "es" : ""
                  }`;
                return `há ${Math.floor(diffDays / 365)} ano${
                  Math.floor(diffDays / 365) > 1 ? "s" : ""
                }`;
              })()}
            </span>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptions(!showOptions);
            }}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <FaEllipsisV size={14} />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50"
              >
                <div className="py-2">
                  <button
                    onClick={() => onShare(video)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                  >
                    <FaShare className="mr-3" /> Compartilhar
                  </button>
                  <button
                    onClick={() => onBookmark(video.id)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                  >
                    <FaBookmark className="mr-3" />
                    {video.isBookmarked
                      ? "Remover dos salvos"
                      : "Salvar para mais tarde"}
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center">
                    <FaDownload className="mr-3" /> Download
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center">
                    <FaFlag className="mr-3" /> Denunciar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Reaction Bar */}
      <div className="flex items-center justify-between mt-3 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onLike(video.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
              video.isLiked
                ? "text-indigo-500 bg-indigo-500/20"
                : "text-gray-400 hover:text-indigo-500 hover:bg-indigo-500/20"
            }`}
          >
            <FaThumbsUp size={12} />
            <span>
              {video.likes >= 1000
                ? `${(video.likes / 1000).toFixed(1)}K`
                : video.likes}
            </span>
          </button>

          <button
            onClick={() => onDislike(video.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
              video.isDisliked
                ? "text-gray-300 bg-gray-600"
                : "text-gray-400 hover:text-gray-300 hover:bg-gray-600"
            }`}
          >
            <FaThumbsDown size={12} />
          </button>
        </div>

        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <span className="bg-gray-700 px-2 py-1 rounded-full">
            {video.genre}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default function VideosPage() {
  // Helper to format duration in seconds to mm:ss
  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">(
    "recent"
  );

  const supabaseClient = getSupabaseBrowserClient();
  const { user } = useAuth();

  // Like/dislike handlers
  const handleLike = async (videoId: string) => {
    if (!user) return;
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              isLiked: !v.isLiked,
              likes: v.isLiked ? v.likes - 1 : v.likes + 1,
              // ensure you can't both like and dislike
              isDisliked: v.isLiked ? v.isDisliked : false,
              dislikes: v.isLiked ? v.dislikes : v.dislikes,
            }
          : v
      )
    );
    const updated = videos.find((v) => v.id === videoId);
    if (updated) {
      const { error } = await supabaseClient
        .from("videos")
        .update({ likes: updated.likes, dislikes: updated.dislikes })
        .eq("id", videoId);
      if (error) console.error("Like update error:", error);
    }
  };

  const handleDislike = async (videoId: string) => {
    if (!user) return;
    setVideos((prev) =>
      prev.map((v) =>
        v.id === videoId
          ? {
              ...v,
              isDisliked: !v.isDisliked,
              dislikes: v.isDisliked ? v.dislikes - 1 : v.dislikes + 1,
              isLiked: v.isDisliked ? v.isLiked : false,
              likes: v.isDisliked ? v.likes : v.likes,
            }
          : v
      )
    );
    const updated = videos.find((v) => v.id === videoId);
    if (updated) {
      const { error } = await supabaseClient
        .from("videos")
        .update({ likes: updated.likes, dislikes: updated.dislikes })
        .eq("id", videoId);
      if (error) console.error("Dislike update error:", error);
    }
  };

  // Event handlers
  // const handleVideoSelect = useCallback((video: Video) => {
  //   setSelectedVideo(video);
  //   setIsPlaying(true);
  // }, []);

  const handleBookmark = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? { ...video, isBookmarked: !video.isBookmarked }
          : video
      )
    );
  }, []);

  const handleShare = useCallback((video: Video) => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: `Confira este vídeo de ${video.artist.name}`,
        url: `${window.location.origin}/videos/${video.id}`,
      });
    } else {
      navigator.clipboard.writeText(
        `${window.location.origin}/videos/${video.id}`
      );
    }
  }, []);

  // Fetch videos from Supabase
  useEffect(() => {
    const loadVideos = async () => {
      const { data: videosData, error: videosError } = await supabaseClient
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<DatabaseVideo[]>();

      if (videosError) {
        console.error("Error fetching videos:", videosError);
        return;
      }

      const { data: artistsData, error: artistsError } = await supabaseClient
        .from("artists")
        .select("id,name,profile_image_url,verified,subscribers")
        .returns<DatabaseArtist[]>();

      if (artistsError) {
        console.error("Error fetching artists:", {
          code: artistsError.code,
          details: artistsError.details,
          hint: artistsError.hint,
          message: artistsError.message,
        });
        return;
      }

      const formatted: Video[] = (videosData || []).map((v) => {
        const art = artistsData?.find((a) => a.id === v.artist_id) || {
          id: "",
          name: "",
          profile_image_url: "",
          verified: false,
          subscribers: 0,
        };
        return {
          id: v.id,
          title: v.title,
          artist: {
            id: art.id,
            name: art.name,
            avatar: art.profile_image_url,
            verified: art.verified,
            subscribers: art.subscribers,
          },
          thumbnail: v.thumbnail_url,
          videoUrl: v.video_url,
          duration: formatDuration(v.duration),
          views: v.views,
          likes: v.likes,
          dislikes: v.dislikes,
          uploadDate: new Date(v.created_at).toISOString().split("T")[0],
          description: v.description,
          genre: v.genre,
          isLiked: false,
          isDisliked: false,
          isBookmarked: false,
        };
      });
      setVideos(formatted);
    };
    loadVideos();
  }, [supabaseClient]);

  // Filtered and sorted videos
  const filteredVideos = useMemo(() => {
    const filtered = videos.filter((video) => {
      const matchesSearch =
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.artist.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre =
        selectedGenre === "all" || video.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });

    // Sort videos
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
      case "trending":
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case "recent":
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
        );
        break;
    }

    return filtered;
  }, [videos, searchTerm, selectedGenre, sortBy]);

  const genres = useMemo(
    () => ["all", ...Array.from(new Set(videos.map((v) => v.genre)))],
    [videos]
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            {/* Title Section */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-600 rounded-xl">
                  <FaVideo className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Vídeos</h1>
                  <p className="text-gray-400 text-sm">
                    Descubra conteúdo exclusivo dos seus artistas favoritos
                  </p>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-none">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar vídeos, artistas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-full pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-80 transition-all"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <FaBars className="rotate-90" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center justify-between mt-4 space-x-4">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2">
              {/* Sort Options */}
              <div className="flex items-center space-x-2 mr-4">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    sortBy === "recent"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                  }`}
                >
                  <FaClock size={12} />
                  <span>Recentes</span>
                </button>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    sortBy === "popular"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                  }`}
                >
                  <FaEye size={12} />
                  <span>Populares</span>
                </button>
                <button
                  onClick={() => setSortBy("trending")}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    sortBy === "trending"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                  }`}
                >
                  <FaChartLine size={12} />
                  <span>Em Alta</span>
                </button>
              </div>

              {/* Genre Filters */}
              <div className="h-6 w-px bg-gray-600 mx-2"></div>
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedGenre === genre
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                  }`}
                >
                  {genre === "all" ? "Todos os Gêneros" : genre}
                </button>
              ))}
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-400 whitespace-nowrap">
              {filteredVideos.length} vídeo
              {filteredVideos.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <div
            className={`
            ${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                : "space-y-4"
            }
          `}
          >
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onVideoSelect={() => router.push(`/videos/${video.id}`)}
                onLike={handleLike}
                onDislike={handleDislike}
                onBookmark={handleBookmark}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
                <FaVideo className="text-4xl text-gray-600" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <FaSearch className="text-white text-sm" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              Nenhum vídeo encontrado
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Não encontramos vídeos que correspondam à sua pesquisa. Tente
              ajustar os filtros ou pesquisar por outros termos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedGenre("all");
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                Limpar Filtros
              </button>
              <Link
                href="/explore"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Explorar todos os vídeos
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <FaArrowUp className="text-white text-lg" />
      </motion.button>

      {/* Video Player */}

      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer
            video={selectedVideo}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onClose={() => {
              setSelectedVideo(null);
              setIsPlaying(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
