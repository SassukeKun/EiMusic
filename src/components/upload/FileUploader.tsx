'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { FaCloudUploadAlt, FaImage, FaMusic, FaVideo, FaFile, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface FileUploaderProps {
  // Required props
  onFileSelect: (file: File) => void;
  
  // Optional props
  accept?: string;
  maxSize?: number; // In MB
  label?: string;
  multiple?: boolean;
  previewUrl?: string;
  type?: 'image' | 'audio' | 'video' | 'file';
  className?: string;
  resetKey?: number; // Change this to reset the component
  onClearFile?: () => void;
}

export default function FileUploader({
  onFileSelect,
  accept = '*/*',
  maxSize = 10, // Default max size is 10MB
  label = 'Upload a file',
  multiple = false,
  previewUrl,
  type = 'file',
  className = '',
  resetKey = 0,
  onClearFile
}: FileUploaderProps) {
  // Input ref for file selection
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for drag and drop behavior
  const [dragOver, setDragOver] = useState(false);
  
  // State for file preview
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  
  // State for file name display
  const [fileName, setFileName] = useState<string | null>(null);
  
  // State for error messages
  const [error, setError] = useState<string | null>(null);
  
  // Reset component when resetKey changes
  React.useEffect(() => {
    if (resetKey > 0) {
      setPreview(previewUrl || null);
      setFileName(null);
      setError(null);
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [resetKey, previewUrl]);
  
  // Update preview when previewUrl changes externally
  React.useEffect(() => {
    if (previewUrl) {
      setPreview(previewUrl);
    }
  }, [previewUrl]);
  
  // Validate file size and type
  const validateFile = useCallback((file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return false;
    }
    
    // Check file type
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',');
      const fileType = file.type;
      
      if (!acceptedTypes.some(type => {
        if (type.includes('/*')) {
          // Handle wildcard types like image/* or audio/*
          const baseType = type.split('/')[0];
          return fileType.startsWith(`${baseType}/`);
        }
        return type === fileType;
      })) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return false;
      }
    }
    
    setError(null);
    return true;
  }, [accept, maxSize]);
  
  // Handle file selection from input
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    if (validateFile(file)) {
      // Create preview URL if it's an image
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        
        // Clean up object URL when component unmounts
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        // For non-image files, just display the file name
        setFileName(file.name);
        setPreview(null);
      }
      
      // Call the onFileSelect callback
      onFileSelect(file);
    }
  }, [validateFile, onFileSelect]);
  
  // Handle drop events
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    if (validateFile(file)) {
      // Create preview URL if it's an image
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      } else {
        // For non-image files, just display the file name
        setFileName(file.name);
        setPreview(null);
      }
      
      // Call the onFileSelect callback
      onFileSelect(file);
    }
  }, [validateFile, onFileSelect]);
  
  // Handle drag over events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  
  // Handle drag leave events
  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);
  
  // Clear selected file
  const handleClearFile = useCallback(() => {
    setPreview(null);
    setFileName(null);
    setError(null);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Call the onClearFile callback if provided
    if (onClearFile) {
      onClearFile();
    }
  }, [onClearFile]);
  
  // Handle click on the uploader
  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // Determine which icon to show based on type
  const getIcon = useCallback(() => {
    switch (type) {
      case 'image':
        return <FaImage className="text-4xl text-indigo-400" />;
      case 'audio':
        return <FaMusic className="text-4xl text-indigo-400" />;
      case 'video':
        return <FaVideo className="text-4xl text-indigo-400" />;
      default:
        return <FaFile className="text-4xl text-indigo-400" />;
    }
  }, [type]);
  
  // Determine accepted file types
  const getAcceptString = useCallback(() => {
    if (accept !== '*/*') return accept;
    
    switch (type) {
      case 'image':
        return 'image/*';
      case 'audio':
        return 'audio/*';
      case 'video':
        return 'video/*';
      default:
        return '*/*';
    }
  }, [type, accept]);
  
  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={getAcceptString()}
        onChange={handleFileChange}
        multiple={multiple}
      />
      
      <motion.div
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          ${dragOver ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/30'} 
          transition-colors
          ${preview || fileName ? 'bg-gray-800/30' : ''}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {!preview && !fileName ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-4">
            <motion.div
              className="bg-indigo-700/30 p-4 rounded-full mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getIcon()}
            </motion.div>
            <h2 className="text-lg font-semibold mb-2">{label}</h2>
            <p className="text-gray-400 mb-4 text-sm">
              Drag and drop or click to select
            </p>
            <motion.button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center text-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
            >
              <FaCloudUploadAlt className="mr-2" /> Select File
            </motion.button>
            <p className="text-gray-500 mt-4 text-xs">
              {type === 'image' ? 'JPG, PNG, GIF' : type === 'audio' ? 'MP3, WAV, OGG' : type === 'video' ? 'MP4, WebM, MOV' : 'Any file'} up to {maxSize}MB
            </p>
          </div>
        ) : (
          // Preview state
          <div className="relative">
            {/* Clear button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="absolute -top-3 -right-3 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white hover:bg-gray-700 z-10"
            >
              <FaTimes />
            </button>
            
            {/* Preview content */}
            {preview && type === 'image' ? (
              <div className="relative w-full aspect-square overflow-hidden rounded-lg">
                <Image
                  src={preview}
                  alt="File preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <div className="bg-indigo-700/30 p-4 rounded-full mr-3">
                  {getIcon()}
                </div>
                <div className="text-left">
                  <p className="font-medium text-white truncate max-w-[200px]">
                    {fileName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Click to change file
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  )
} 