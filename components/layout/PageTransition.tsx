'use client'

import { motion } from 'framer-motion'
import { pageTransition } from '@/lib/animations'

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Wraps page content in a Framer Motion div.
 * Provides a consistent fade + slide entrance for every page.
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="h-full"
    >
      {children}
    </motion.div>
  )
}
