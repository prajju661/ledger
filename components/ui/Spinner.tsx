import { cn } from '@/lib/utils'

interface SpinnerProps {
  /** Size in pixels — defaults to 24 */
  size?: number
  className?: string
}

/**
 * Rotating gradient ring spinner.
 * Uses a conic-gradient for the vivid indigo→violet look.
 */
export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('inline-block animate-spin', className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-full h-full"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="3"
        />
        <path
          d="M12 2 A10 10 0 0 1 22 12"
          stroke="url(#spinner-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )
}
