'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  /** Side to slide in from — defaults to 'right' */
  side?: 'right' | 'left'
  /** Width class — defaults to 'w-full max-w-md' */
  width?: string
  className?: string
}

const sideVariants: Record<'right' | 'left', Variants> = {
  right: {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 300 } },
  },
  left: {
    hidden: { x: '-100%', opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: 'spring' as const, damping: 28, stiffness: 300 } },
  },
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = 'right',
  width = 'w-full max-w-md',
  className,
}: DrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            className={cn(
              'fixed inset-y-0 z-50',
              side === 'right' ? 'right-0' : 'left-0'
            )}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'drawer-title' : undefined}
              className={cn(
                'h-full glass-modal rounded-none',
                side === 'right' ? 'rounded-l-2xl' : 'rounded-r-2xl',
                width,
                'flex flex-col p-6 overflow-y-auto',
                className
              )}
              variants={sideVariants[side]}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  {title && (
                    <h2 id="drawer-title" className="text-lg font-semibold text-text-primary">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-text-secondary mt-0.5">{description}</p>
                  )}
                </div>
                <Button
                  variant="icon"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close drawer"
                  className="shrink-0 -mt-1 -mr-1"
                >
                  <X size={18} />
                </Button>
              </div>

              <div className="flex-1">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
