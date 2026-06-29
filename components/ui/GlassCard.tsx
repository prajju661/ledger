'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { AccentColor } from '@/types'

interface GlassCardProps {
  children: React.ReactNode
  /** Module accent color for the glow ring */
  accent?: AccentColor
  /** Enable hover lift + brightening effect */
  hover?: boolean
  className?: string
  onClick?: () => void
  as?: 'div' | 'article' | 'section' | 'li'
}

const accentClass: Record<AccentColor, string> = {
  cyan:    'glow-cyan',
  emerald: 'glow-emerald',
  amber:   'glow-amber',
  indigo:  'glow-indigo',
  none:    '',
}

export function GlassCard({
  children,
  accent = 'none',
  hover = false,
  className,
  onClick,
}: GlassCardProps) {
  const classes = cn(
    'glass rounded-2xl',
    accent !== 'none' && accentClass[accent],
    hover && 'glass-hover cursor-pointer',
    className
  )

  if (hover || onClick) {
    return (
      <motion.div
        className={classes}
        onClick={onClick}
        whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={classes}>{children}</div>
}
