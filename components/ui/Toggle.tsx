'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
  /** Accent color for the active state — defaults to indigo */
  accentColor?: string
}

/**
 * Animated spring toggle switch.
 * The thumb slides with a spring animation for a satisfying feel.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled = false,
  className,
  accentColor = '#6366f1',
}: ToggleProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full border transition-colors duration-300 focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary',
          checked
            ? 'border-transparent'
            : 'bg-white/[0.06] border-white/[0.12]'
        )}
        style={
          checked
            ? { backgroundColor: accentColor, boxShadow: `0 0 12px ${accentColor}60` }
            : undefined
        }
      >
        <motion.span
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          layout
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      </button>

      {label && (
        <span className="text-sm font-medium text-text-primary">{label}</span>
      )}
    </label>
  )
}
