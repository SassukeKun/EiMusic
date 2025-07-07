// src/components/VideoPlayer.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress } from 'react-icons/fa';

// Move the VideoPlayerProps interface here
export interface VideoPlayerProps {
  video: {
    id: string;
    title: string;
    videoUrl: string;
    thumbnail: string;
    duration: string;
  };
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// Move the formatDuration function here
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// The actual VideoPlayer component
export const VideoPlayer: React.FC<VideoPlayerProps> = ({
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
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Handle play/pause
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.play().catch(e => console.error('Error playing video:', e));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Handle time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(e => {
        console.error('Error attempting to enable fullscreen:', e);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Video container */}
      <div className="relative flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="max-w-full max-h-full"
          poster={video.thumbnail}
          onClick={onPlayPause}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          loop
          muted={isMuted}
        />

        {/* Overlay controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <button
              onClick={onPlayPause}
              className="bg-black bg-opacity-50 rounded-full p-4 text-white hover:bg-opacity-70 transition-all"
            >
              <FaPlay className="w-8 h-8" />
            </button>
          )}
        </div>

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            ✕
          </button>
          <h2 className="text-white text-xl font-semibold">{video.title}</h2>
          <div className="w-8"></div> {/* For spacing */}
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={onPlayPause}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
            
            <div className="flex items-center space-x-2 text-white text-sm">
              <span>{formatDuration(currentTime)}</span>
              <span>/</span>
              <span>{formatDuration(duration)}</span>
            </div>
            
            <div className="flex-1 mx-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <button
              onClick={toggleMute}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 rounded-full p-2"
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className={`px-4 py-1 rounded ${hasPrevious ? 'text-white hover:bg-white/20' : 'text-gray-500'}`}
            >
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className={`px-4 py-1 rounded ${hasNext ? 'text-white hover:bg-white/20' : 'text-gray-500'}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
