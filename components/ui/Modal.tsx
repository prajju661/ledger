'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { scaleIn, mobileSheet } from '@/lib/animations'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  /** Max width class, defaults to 'max-w-lg' */
  maxWidth?: string
  /** Hide the default close button */
  hideCloseButton?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'max-w-lg',
  hideCloseButton = false,
  className,
}: ModalProps) {
  // Close on Escape key
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

          {/* Modal panel — centered on desktop, bottom sheet on mobile */}
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
              className={cn(
                'glass-modal w-full sm:rounded-2xl rounded-t-2xl p-6',
                maxWidth,
                className
              )}
              // Bottom sheet on mobile, scale-in on desktop
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Header */}
              {(title || !hideCloseButton) && (
                <div className="flex items-start justify-between mb-5">
                  <div>
                    {title && (
                      <h2
                        id="modal-title"
                        className="text-lg font-semibold text-text-primary"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id="modal-description"
                        className="text-sm text-text-secondary mt-0.5"
                      >
                        {description}
                      </p>
                    )}
                  </div>

                  {!hideCloseButton && (
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={onClose}
                      aria-label="Close modal"
                      className="shrink-0 -mt-1 -mr-1"
                    >
                      <X size={18} />
                    </Button>
                  )}
                </div>
              )}

              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
