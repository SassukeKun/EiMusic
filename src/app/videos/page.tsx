// src/app/videos/page.tsx
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaStepBackward,
  FaStepForward,
  FaComments,
  FaChevronDown,
  FaChevronUp,
  FaPause,
  FaHeart,
  FaShare,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaEye,
  FaThumbsUp,
  FaThumbsDown,
  FaFilter,
  FaSearch,
  FaTimes,
  FaVideo,
  FaCalendarAlt,
  FaMusic,
  FaImage,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaBars,
  FaList,
  FaBookmark,
  FaEllipsisV,
  FaDownload,
  FaFlag,
  FaChartLine,
  FaArrowUp,
} from "react-icons/fa";

// ===== COMPONENTE VIDEO PLAYER COMPLETO =====
interface VideoPlayerProps {
  video: Video;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isPlaying,
  onPlayPause,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Estados existentes do player (mantidos iguais)
  const [volume, setVolume] = useState(80);
  const [previousVolume, setPreviousVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("auto");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // NOVOS ESTADOS PARA COMENTÁRIOS
  const [showComments, setShowComments] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [commentsPosition, setCommentsPosition] = useState<"bottom" | "side">(
    "bottom"
  );

  // Detectar tamanho da tela para responsividade
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setCommentsPosition(mobile ? "bottom" : "side");
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Auto-hide controls timer (mantido igual)
  const hideControlsTimer = useRef<NodeJS.Timeout>();

  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    setShowControls(true);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Funções do player (mantidas iguais)
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // NOVA FUNÇÃO: Toggle para comentários
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // NOVAS FUNÇÕES: Layout responsivo baseado na posição dos comentários
  const getLayoutClasses = () => {
    if (!showComments) {
      return "fixed inset-0 bg-black z-50 flex flex-col";
    }

    if (commentsPosition === "side") {
      // Desktop: vídeo à esquerda, comentários à direita
      return "fixed inset-0 bg-black z-50 flex";
    } else {
      // Mobile: vídeo em cima, comentários embaixo
      return "fixed inset-0 bg-black z-50 flex flex-col";
    }
  };

  const getVideoContainerClasses = () => {
    if (!showComments) {
      return "relative flex-1 bg-black";
    }

    if (commentsPosition === "side") {
      // Desktop: 70% da largura para o vídeo
      return "relative bg-black w-full lg:w-[70%] xl:w-[75%]";
    } else {
      // Mobile: altura flexível, mínimo para o vídeo
      return "relative bg-black flex-1 min-h-[40vh]";
    }
  };

  const getCommentsContainerClasses = () => {
    if (commentsPosition === "side") {
      // Desktop: 30% da largura, altura total
      return "w-full lg:w-[30%] xl:w-[25%] h-full overflow-hidden";
    } else {
      // Mobile: altura limitada com scroll
      return "h-[60vh] lg:h-[50vh] overflow-hidden";
    }
  };
  // useEffects do player (mantidos iguais, mas adicione este bloco após as funções da Parte 1)

  // Video event handlers (mantido igual)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        setBuffered((bufferedEnd / duration) * 100);
      }
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleLoadStart = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Play/Pause control (mantido igual)
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Volume control (mantido igual)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Playback rate control (mantido igual)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Keyboard shortcuts (ATUALIZADO para incluir comentários)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onPlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (e.shiftKey && hasPrevious && onPrevious) {
            // Shift + ← = vídeo anterior
            onPrevious();
          } else if (videoRef.current) {
            // ← = retroceder 10s
            videoRef.current.currentTime = Math.max(
              0,
              videoRef.current.currentTime - 10
            );
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (e.shiftKey && hasNext && onNext) {
            // Shift + → = próximo vídeo
            onNext();
          } else if (videoRef.current) {
            // → = avançar 10s
            videoRef.current.currentTime = Math.min(
              duration,
              videoRef.current.currentTime + 10
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((prev) => Math.min(100, prev + 10));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 10));
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyC":
          e.preventDefault();
          toggleComments();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "Escape":
          e.preventDefault();
          if (isFullscreen) {
            exitFullscreen();
          } else if (showComments) {
            setShowComments(false);
          } else {
            onClose();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [duration, isFullscreen, showComments, onPlayPause, onClose]);

  // Funções de fullscreen (mantidas iguais)
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  const qualities = ["auto", "1080p", "720p", "480p", "360p", "240p"];
  // RETURN DO COMPONENTE (adicione após os useEffects da Parte 2)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={getLayoutClasses()}
    >
      {/* Container do Vídeo */}
      <div className={getVideoContainerClasses()}>
        <div
          className="relative w-full h-full bg-black"
          onMouseMove={resetHideTimer}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={video.videoUrl}
            poster={video.thumbnail}
            preload="metadata"
            onClick={onPlayPause}
          />

          {/* Loading Spinner */}
          <AnimatePresence>
            {isBuffering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50"
              >
                {/* Top Controls */}
                <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <SafeImage
                      src={video.artist.avatar}
                      alt={video.artist.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="text-white font-semibold">
                        {video.title}
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {video.artist.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Botão de Comentários */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComments();
                      }}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors z-50 ${
                        showComments
                          ? "bg-indigo-600 text-white"
                          : "bg-black/50 hover:bg-black/70 text-white"
                      }`}
                      title="Comentários (C)"
                    >
                      <FaComments size={16} />
                    </button>

                    {/* Quality Menu (mantido igual) */}
                    <div className="relative">
                      <button
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                        className="px-3 py-1 bg-black/50 hover:bg-black/70 text-white rounded text-sm backdrop-blur-sm transition-colors"
                      >
                        {quality}
                      </button>
                      <AnimatePresence>
                        {showQualityMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 top-full mt-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-10"
                          >
                            {qualities.map((q) => (
                              <button
                                key={q}
                                onClick={() => {
                                  setQuality(q);
                                  setShowQualityMenu(false);
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                  quality === q
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800"
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                      }}
                      className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors z-50"
                      title="Fechar player (ESC)"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                </div>

                {/* Center Play Button + Navigation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center space-x-8">
                    {/* Previous Button */}
                    {hasPrevious && onPrevious && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrevious();
                        }}
                        className="bg-black/50 hover:bg-black/70 rounded-full p-3 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                        title="Vídeo anterior (←)"
                      >
                        <FaStepBackward className="text-white text-xl" />
                      </button>
                    )}

                    {/* Play/Pause Button */}
                    <button
                      onClick={onPlayPause}
                      className="bg-black/50 hover:bg-black/70 rounded-full p-4 backdrop-blur-sm transition-colors"
                    >
                      {isPlaying ? (
                        <FaPause className="text-white text-3xl" />
                      ) : (
                        <FaPlay className="text-white text-3xl ml-1" />
                      )}
                    </button>

                    {/* Next Button */}
                    {hasNext && onNext && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNext();
                        }}
                        className="bg-black/50 hover:bg-black/70 rounded-full p-3 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                        title="Próximo vídeo (→)"
                      >
                        <FaStepForward className="text-xl text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div
                      ref={progressRef}
                      className="relative h-1 bg-white/30 rounded-full cursor-pointer group hover:h-2 transition-all"
                      onClick={handleProgressClick}
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-white/50 rounded-full"
                        style={{ width: `${buffered}%` }}
                      />
                      <div
                        className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                      <div
                        className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          left: `${(currentTime / duration) * 100}%`,
                          marginLeft: "-6px",
                        }}
                      />
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={onPlayPause}
                        className="text-white hover:text-indigo-400 transition-colors"
                      >
                        {isPlaying ? (
                          <FaPause size={20} />
                        ) : (
                          <FaPlay size={20} />
                        )}
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:text-indigo-400 transition-colors"
                        >
                          {isMuted || volume === 0 ? (
                            <FaVolumeMute size={20} />
                          ) : (
                            <FaVolumeUp size={20} />
                          )}
                        </button>
                        <div className="w-20 h-1 bg-white/30 rounded-full relative group">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${isMuted ? 0 : volume}%` }}
                          />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                              const newVolume = parseInt(e.target.value);
                              setVolume(newVolume);
                              if (newVolume > 0 && isMuted) {
                                setIsMuted(false);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <span className="text-white text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="text-white hover:text-indigo-400 transition-colors text-sm"
                        >
                          {playbackRate}x
                        </button>
                        <AnimatePresence>
                          {showSpeedMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 bottom-full mb-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-10"
                            >
                              {playbackRates.map((rate) => (
                                <button
                                  key={rate}
                                  onClick={() => {
                                    setPlaybackRate(rate);
                                    setShowSpeedMenu(false);
                                  }}
                                  className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
                                    playbackRate === rate
                                      ? "bg-indigo-600 text-white"
                                      : "text-gray-300 hover:bg-gray-800"
                                  }`}
                                >
                                  {rate}x
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-indigo-400 transition-colors"
                      >
                        {isFullscreen ? (
                          <FaCompress size={20} />
                        ) : (
                          <FaExpand size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* NOVO: Container de Comentários */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{
              opacity: 0,
              ...(commentsPosition === "side" ? { x: 300 } : { y: 300 }),
            }}
            animate={{
              opacity: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              ...(commentsPosition === "side" ? { x: 300 } : { y: 300 }),
            }}
            transition={{ duration: 0.3 }}
            className={getCommentsContainerClasses()}
          >
            <CommentSection
              videoId={video.id}
              isVisible={showComments}
              onToggle={toggleComments}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help (ATUALIZADO) */}
      <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 backdrop-blur-sm rounded px-3 py-2 opacity-0 hover:opacity-100 transition-opacity max-w-xs">
        <p>
          Atalhos: Espaço (play/pause) • ← → (10s) • ↑ ↓ (volume) • M (mute) • C
          (comentários) • F (fullscreen)
        </p>
      </div>
    </motion.div>
  );
};

// ===== TIPOS TYPESCRIPT =====
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
}

// ===== TIPOS TYPESCRIPT PARA COMENTÁRIOS =====

interface Comment {
  id: string;
  userId: string;
  videoId: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  user: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  isEdited?: boolean;
  isPinned?: boolean;
}

interface CommentFormData {
  content: string;
  parentId?: string; // Para replies
}

interface CommentStats {
  total: number;
  sortBy: "newest" | "oldest" | "top" | "replies";
}

// Props para componentes de comentários
interface CommentSectionProps {
  videoId: string;
  isVisible: boolean;
  onToggle: () => void;
}

interface CommentItemProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => void;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  depth?: number;
  maxDepth?: number;
}

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => void;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  parentId?: string;
  isReply?: boolean;
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isValidUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch {
      return false;
    }
  };

  if (!isValidUrl(src) || hasError) {
    return (
      <div
        className={`
          bg-gradient-to-br from-gray-700 to-gray-800 
          flex flex-col items-center justify-center
          text-gray-300 relative
          ${fill ? "absolute inset-0" : ""}
          ${className}
        `}
        style={fill ? undefined : { width, height }}
      >
        <FaImage className="text-2xl mb-2 opacity-60" />
        <span className="text-xs text-center px-2 font-medium">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative ${fill ? "" : "inline-block"}`}>
      {isLoading && (
        <div
          className={`
            absolute inset-0 bg-gray-800 animate-pulse 
            flex items-center justify-center z-10
            ${className}
          `}
          style={fill ? undefined : { width, height }}
        >
          <div className="w-6 h-6 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin"></div>
        </div>
      )}

      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`
          ${
            fill
              ? "absolute inset-0 w-full h-full object-cover"
              : "object-cover"
          }
          ${className}
          ${isLoading ? "opacity-0" : "opacity-100"}
          transition-opacity duration-300
        `}
        style={fill ? undefined : { width, height }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
};

// ===== COMPONENTE FORMULÁRIO DE COMENTÁRIO =====
// Adicione APÓS os tipos TypeScript e ANTES do VideoPlayer existente

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  onCancel,
  placeholder = "Adicione um comentário...",
  initialValue = "",
  autoFocus = false,
  parentId,
  isReply = false,
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea conforme o conteúdo cresce
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Foco automático quando necessário
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      await onSubmit({
        content: content.trim(),
        parentId,
      });
      setContent("");

      // Reset textarea height após submit
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atalhos de teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }

    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  // Lista de emojis simples para reações rápidas
  const quickEmojis = ["😀", "😍", "🔥", "👏", "❤️", "😢", "😡", "🤔"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full ${isReply ? "ml-4 md:ml-12" : ""}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Área de texto principal */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`
              w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl 
              text-white placeholder-gray-400 resize-none
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              transition-all duration-200 min-h-[44px] max-h-40
              ${isReply ? "text-sm" : ""}
            `}
            rows={1}
            disabled={isSubmitting}
          />

          {/* Contador de caracteres */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {content.length}/500
          </div>
        </div>

        {/* Barra de ferramentas */}
        {content.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0"
          >
            {/* Emojis rápidos */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400 mr-2 hidden sm:block">
                Reações:
              </span>
              {quickEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setContent((prev) => prev + emoji)}
                  className="p-1 hover:bg-gray-700 rounded text-sm transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Botões de ação */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}

              <button
                type="submit"
                disabled={
                  !content.trim() || isSubmitting || content.length > 500
                }
                className={`
                  flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm
                  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isReply
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }
                  flex items-center justify-center space-x-2
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>{isReply ? "Responder" : "Comentar"}</span>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Dica de atalhos */}
        {!isReply && content.length === 0 && (
          <div className="text-xs text-gray-500 flex items-center space-x-4">
            <span>💡 Dica: Ctrl+Enter para enviar rapidamente</span>
          </div>
        )}
      </form>
    </motion.div>
  );
};

// ===== COMPONENTE ITEM DE COMENTÁRIO =====
// Adicione APÓS o CommentForm e ANTES do VideoPlayer existente

const CommentItem: React.FC<CommentItemProps> = ({
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

// ===== COMPONENTE SEÇÃO DE COMENTÁRIOS =====
// Adicione APÓS o CommentItem e ANTES do VideoPlayer existente

const CommentSection: React.FC<CommentSectionProps> = ({
  videoId,
  isVisible,
  onToggle,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<CommentStats["sortBy"]>("newest");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Simulação de dados de comentários
  useEffect(() => {
    if (isVisible && comments.length === 0) {
      setLoading(true);

      // Simular delay de carregamento
      setTimeout(() => {
        const mockComments: Comment[] = [
          {
            id: "1",
            userId: "user1",
            videoId,
            content:
              "Que música incrível! 🔥 A produção está perfeita e a letra é muito inspiradora. Parabéns pelo trabalho!",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
            likes: 24,
            isLiked: true,
            isPinned: true,
            user: {
              id: "user1",
              name: "Maria Silva",
              avatar:
                "https://images.unsplash.com/photo-1494790108755-2616b612b550?w=100&h=100&fit=crop&crop=face",
              verified: true,
            },
            replies: [
              {
                id: "1-1",
                userId: "user2",
                videoId,
                content:
                  "Concordo totalmente! O videoclipe também está show 👏",
                timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
                likes: 8,
                isLiked: false,
                user: {
                  id: "user2",
                  name: "João Santos",
                  avatar:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
                  verified: false,
                },
              },
            ],
          },
          {
            id: "2",
            userId: "user3",
            videoId,
            content:
              "Primeira vez ouvindo esse artista e já virei fã! Onde posso encontrar mais músicas assim?",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
            likes: 15,
            isLiked: false,
            user: {
              id: "user3",
              name: "Ana Costa",
              avatar:
                "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
              verified: false,
            },
          },
          {
            id: "3",
            userId: "user4",
            videoId,
            content:
              "A qualidade do som está impecável! Que equipamento vocês usaram para gravar? Sou músico também e estou sempre buscando melhorar minha produção.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h atrás
            likes: 31,
            isLiked: false,
            isEdited: true,
            user: {
              id: "user4",
              name: "Carlos Musician",
              avatar:
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
              verified: true,
            },
            replies: [
              {
                id: "3-1",
                userId: "user5",
                videoId,
                content:
                  "Também gostaria de saber! A qualidade está incrível mesmo.",
                timestamp: new Date(
                  Date.now() - 1000 * 60 * 60 * 4
                ).toISOString(),
                likes: 5,
                isLiked: false,
                user: {
                  id: "user5",
                  name: "Pedro Batista",
                  avatar:
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
                  verified: false,
                },
              },
            ],
          },
        ];

        setComments(mockComments);
        setLoading(false);
      }, 1000);
    }
  }, [isVisible, videoId, comments.length]);

  // Ordenar comentários
  const sortedComments = useMemo(() => {
    const sorted = [...comments];

    switch (sortBy) {
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      case "top":
        return sorted.sort((a, b) => b.likes - a.likes);
      case "replies":
        return sorted.sort(
          (a, b) => (b.replies?.length || 0) - (a.replies?.length || 0)
        );
      case "newest":
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }
  }, [comments, sortBy]);

  // Estatísticas dos comentários
  const stats = useMemo(() => {
    const totalReplies = comments.reduce(
      (acc, comment) => acc + (comment.replies?.length || 0),
      0
    );
    return {
      total: comments.length + totalReplies,
      sortBy,
    };
  }, [comments, sortBy]);

  // Handlers
  const handleAddComment = async (data: CommentFormData) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: "current-user",
      videoId,
      content: data.content,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      user: {
        id: "current-user",
        name: "Você",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
        verified: false,
      },
    };

    setComments((prev) => [newComment, ...prev]);
  };

  const handleLikeComment = useCallback((commentId: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }

        // Verificar nas respostas também
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  }
                : reply
            ),
          };
        }

        return comment;
      })
    );
  }, []);

  const handleReply = useCallback(
    async (parentId: string, content: string) => {
      const newReply: Comment = {
        id: `${parentId}-${Date.now()}`,
        userId: "current-user",
        videoId,
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        user: {
          id: "current-user",
          name: "Você",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
          verified: false,
        },
      };

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), newReply],
              }
            : comment
        )
      );
    },
    [videoId]
  );

  const handleEdit = useCallback(async (commentId: string, content: string) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, content, isEdited: true };
        }

        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? { ...reply, content, isEdited: true }
                : reply
            ),
          };
        }

        return comment;
      })
    );
  }, []);

  const handleDelete = useCallback(async (commentId: string) => {
    setComments((prev) =>
      prev.filter((comment) => {
        if (comment.id === commentId) return false;

        if (comment.replies) {
          comment.replies = comment.replies.filter(
            (reply) => reply.id !== commentId
          );
        }

        return true;
      })
    );
  }, []);

  const handlePin = useCallback(async (commentId: string) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? { ...comment, isPinned: !comment.isPinned }
          : comment
      )
    );
  }, []);

  // Função para carregar mais comentários
  const loadMoreComments = () => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoading(false);
      // Simular fim dos comentários após algumas páginas
      if (page >= 3) {
        setHasMore(false);
      }
    }, 1000);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900 border-t border-gray-700"
    >
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Header da seção */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <FaComments className="text-indigo-400" />
              <span>
                {stats.total} comentário{stats.total !== 1 ? "s" : ""}
              </span>
            </h3>

            <button
              onClick={onToggle}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-full transition-colors"
              title="Fechar comentários"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          {/* Ordenação */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400 hidden sm:block">
              Ordenar por:
            </span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as CommentStats["sortBy"])
              }
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="top">Mais curtidos</option>
              <option value="replies">Mais respostas</option>
            </select>
          </div>
        </div>

        {/* Formulário de novo comentário */}
        <div className="mb-8">
          <CommentForm
            onSubmit={handleAddComment}
            placeholder="Compartilhe sua opinião sobre este vídeo..."
          />
        </div>

        {/* Lista de comentários */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {sortedComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleLikeComment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPin={handlePin}
              />
            ))}
          </AnimatePresence>

          {/* Loading state */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center py-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400">Carregando comentários...</span>
              </div>
            </motion.div>
          )}

          {/* Botão carregar mais */}
          {!loading && hasMore && comments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-6"
            >
              <button
                onClick={loadMoreComments}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full text-white transition-colors flex items-center space-x-2"
              >
                <FaChevronDown size={14} />
                <span>Carregar mais comentários</span>
              </button>
            </motion.div>
          )}

          {/* Fim dos comentários */}
          {!hasMore && comments.length > 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">
                Você viu todos os comentários! 🎉
              </p>
            </div>
          )}

          {/* Estado vazio */}
          {comments.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
                <FaComments className="text-2xl text-gray-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-300 mb-2">
                Seja o primeiro a comentar!
              </h4>
              <p className="text-gray-500 max-w-md mx-auto">
                Compartilhe sua opinião sobre este vídeo e inicie uma conversa
                com outros fãs.
              </p>
            </motion.div>
          )}
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

// ===== COMPONENTE PRINCIPAL =====
export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">(
    "recent"
  );

  // Mock data with enhanced information
  useEffect(() => {
    const mockVideos: Video[] = [
      {
        id: "1",
        title: "Nunca tou no Place - Official Music Video",
        artist: {
          id: "1",
          name: "Hernâni & Laylizzy",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
          verified: true,
          subscribers: 1200000,
        },
        thumbnail:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "3:45",
        views: 125000,
        likes: 8500,
        dislikes: 120,
        uploadDate: "2024-01-15",
        description: "Novo videoclipe oficial de Hip Hop moçambicano",
        genre: "Hip Hop",
        isLiked: false,
        isDisliked: false,
        isBookmarked: false,
      },
      {
        id: "2",
        title: "Distância (Live Performance)",
        artist: {
          id: "2",
          name: "Nirvana MZ",
          avatar:
            "https://images.unsplash.com/photo-1494790108755-2616b612b550?w=100&h=100&fit=crop&crop=face",
          verified: true,
          subscribers: 890000,
        },
        thumbnail:
          "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "4:12",
        views: 89000,
        likes: 6200,
        dislikes: 45,
        uploadDate: "2024-01-10",
        description: "Performance ao vivo de R&B",
        genre: "R&B",
        isLiked: true,
        isDisliked: false,
        isBookmarked: true,
      },
      {
        id: "3",
        title: "Não voltar atrás (Acoustic Version)",
        artist: {
          id: "3",
          name: "7th Streetz Boyz",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
          verified: false,
          subscribers: 450000,
        },
        thumbnail:
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "3:28",
        views: 67000,
        likes: 4800,
        dislikes: 89,
        uploadDate: "2024-01-08",
        description: "Versão acústica exclusiva",
        genre: "Afrobeat",
        isLiked: false,
        isDisliked: false,
        isBookmarked: false,
      },
      {
        id: "4",
        title: "Rivais - Behind the Scenes",
        artist: {
          id: "4",
          name: "Twenty Fingers",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
          verified: true,
          subscribers: 2100000,
        },
        thumbnail:
          "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "3:56",
        views: 234000,
        likes: 18500,
        dislikes: 200,
        uploadDate: "2024-01-20",
        description: "Bastidores da gravação do hit romântico",
        genre: "Lovesong",
        isLiked: false,
        isDisliked: false,
        isBookmarked: true,
      },
      {
        id: "5",
        title: "Vanabela (Extended Mix)",
        artist: {
          id: "5",
          name: "Wizzi Massuke",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
          verified: false,
          subscribers: 680000,
        },
        thumbnail:
          "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "4:33",
        views: 156000,
        likes: 12300,
        dislikes: 76,
        uploadDate: "2024-01-18",
        description: "Versão estendida da marabenta moderna",
        genre: "Marabenta",
        isLiked: true,
        isDisliked: false,
        isBookmarked: false,
      },
      {
        id: "6",
        title: "No Chapa (Official Video)",
        artist: {
          id: "6",
          name: "Mc Mastoni",
          avatar:
            "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
          verified: true,
          subscribers: 950000,
        },
        thumbnail:
          "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
        videoUrl:
          "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
        duration: "3:21",
        views: 89500,
        likes: 7200,
        dislikes: 103,
        uploadDate: "2024-01-12",
        description: "Videoclipe oficial do trap moçambicano",
        genre: "Trap",
        isLiked: false,
        isDisliked: false,
        isBookmarked: false,
      },
    ];
    setVideos(mockVideos);
  }, []);

  // Event handlers
  const handleVideoSelect = useCallback((video: Video) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  }, []);

  const handleLike = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isLiked: !video.isLiked,
              isDisliked: video.isLiked ? video.isDisliked : false,
              likes: video.isLiked ? video.likes - 1 : video.likes + 1,
              dislikes: video.isLiked
                ? video.dislikes
                : video.isDisliked
                ? video.dislikes - 1
                : video.dislikes,
            }
          : video
      )
    );
  }, []);

  const handleDislike = useCallback((videoId: string) => {
    setVideos((prev) =>
      prev.map((video) =>
        video.id === videoId
          ? {
              ...video,
              isDisliked: !video.isDisliked,
              isLiked: video.isDisliked ? video.isLiked : false,
              dislikes: video.isDisliked
                ? video.dislikes - 1
                : video.dislikes + 1,
              likes: video.isDisliked
                ? video.likes
                : video.isLiked
                ? video.likes - 1
                : video.likes,
            }
          : video
      )
    );
  }, []);

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

  // Filtered and sorted videos
  const filteredVideos = useMemo(() => {
    let filtered = videos.filter((video) => {
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
                onVideoSelect={handleVideoSelect}
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
