// src/components/monetization/PremiumBadge.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FaCheck, FaCrown, FaGem, FaStar } from 'react-icons/fa'

interface PremiumBadgeProps {
  type?: 'verified' | 'premium' | 'vip' | 'supporter'
  verified?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export default function PremiumBadge({ 
  type = 'verified',
  verified = false,
  size = 'md',
  animated = true,
  className = ''
}: PremiumBadgeProps) {
  
  if (!verified && type === 'verified') return null

  const getBadgeConfig = () => {
    switch (type) {
      case 'verified':
        return {
          icon: <FaCheck />,
          color: 'bg-blue-500',
          label: 'Verificado'
        }
      case 'premium':
        return {
          icon: <FaCrown />,
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500',
          label: 'Premium'
        }
      case 'vip':
        return {
          icon: <FaGem />,
          color: 'bg-gradient-to-r from-purple-400 to-pink-500',
          label: 'VIP'
        }
      case 'supporter':
        return {
          icon: <FaStar />,
          color: 'bg-gradient-to-r from-green-400 to-blue-500',
          label: 'Apoiador'
        }
      default:
        return {
          icon: <FaCheck />,
          color: 'bg-blue-500',
          label: 'Verificado'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4 text-xs'
      case 'lg':
        return 'w-8 h-8 text-sm'
      default:
        return 'w-6 h-6 text-xs'
    }
  }

  const config = getBadgeConfig()
  const sizeClasses = getSizeClasses()

  const badge = (
    <div 
      className={`${config.color} ${sizeClasses} rounded-full flex items-center justify-center text-white shadow-lg ${className}`}
      title={config.label}
    >
      {config.icon}
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}