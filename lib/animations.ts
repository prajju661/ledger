/**
 * Framer Motion variants used across the app.
 * Import these instead of defining inline variants to keep animations consistent.
 */
import type { Variants } from 'framer-motion'

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
}

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
}

/** Wrap a list of children in this to stagger their entrance animations */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

/** Use on motion.div with initial="rest" whileHover="hover" */
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2 },
  },
}

/** Mobile bottom sheet — slides up from off-screen */
export const mobileSheet: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
}

/** Glow pulse for indigo accent elements */
export const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(99,102,241,0.2)',
      '0 0 40px rgba(99,102,241,0.4)',
      '0 0 20px rgba(99,102,241,0.2)',
    ],
    transition: { duration: 2, repeat: Infinity },
  },
}

/** Page-level enter/exit transition */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
}
