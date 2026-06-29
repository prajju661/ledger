'use client'

import { motion } from 'framer-motion'

/**
 * Ambient animated gradient orbs rendered behind all page content.
 * Fixed position, pointer-events-none, z-index -10.
 * Include once in the root layout.
 */
export function BackgroundOrbs() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none -z-10"
      aria-hidden="true"
    >
      {/* Top-left violet orb */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom-right cyan orb */}
      <motion.div
        className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Center indigo orb */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />
    </div>
  )
}
