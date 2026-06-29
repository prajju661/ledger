import { cn } from '@/lib/utils'
import type { BadgeVariant } from '@/types'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error:   'bg-error/10   text-error   border-error/20',
  info:    'bg-info/10    text-info     border-info/20',
  default: 'bg-white/[0.06] text-text-secondary border-white/[0.1]',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
