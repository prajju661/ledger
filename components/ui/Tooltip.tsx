'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: React.ReactNode
  /** Placement relative to the trigger */
  side?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

const sideStyles: Record<NonNullable<TooltipProps['side']>, string> = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
}

/**
 * Hover tooltip with glass style.
 * Wraps any element and shows a tooltip on hover/focus.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocusCapture={() => setVisible(true)}
      onBlurCapture={() => setVisible(false)}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            role="tooltip"
            className={cn(
              'absolute z-50 pointer-events-none whitespace-nowrap',
              'glass rounded-lg px-3 py-1.5',
              'text-xs font-medium text-text-primary',
              sideStyles[side],
              className
            )}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.1 } }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
