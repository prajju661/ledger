'use client'

import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-40 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        /** Filled gradient — primary CTAs */
        primary: [
          'bg-linear-to-r from-accent-primary to-accent-secondary',
          'text-white rounded-xl',
          'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
          'hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-[1.02]',
          'active:scale-[0.98]',
          'focus-visible:ring-accent-primary',
        ],
        /** Glass outline — secondary actions */
        ghost: [
          'glass rounded-xl text-text-primary',
          'hover:bg-white/[0.08] hover:border-white/[0.2]',
          'active:scale-[0.98]',
          'focus-visible:ring-white/30',
        ],
        /** Red-tinted — destructive actions */
        danger: [
          'bg-error/10 border border-error/30 text-error rounded-xl',
          'hover:bg-error/20 hover:border-error/50',
          'active:scale-[0.98]',
          'focus-visible:ring-error',
        ],
        /** Square icon-only button */
        icon: [
          'glass rounded-xl text-text-secondary',
          'hover:text-text-primary hover:bg-white/[0.08]',
          'active:scale-[0.95]',
          'focus-visible:ring-white/30',
        ],
      },
      size: {
        sm:   'text-xs px-3 py-1.5 h-8',
        md:   'text-sm px-4 py-2 h-10',
        lg:   'text-base px-6 py-3 h-12',
        icon: 'text-sm w-10 h-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
