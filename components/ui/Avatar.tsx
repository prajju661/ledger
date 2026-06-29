import Image from 'next/image'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  /** Full name used to generate initials fallback */
  name?: string | null
  /** URL of the avatar image */
  src?: string | null
  size?: number
  className?: string
}

/**
 * Circular avatar that shows the user's image when available,
 * falling back to their initials on a gradient background.
 */
export function Avatar({ name, src, size = 36, className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?'

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0 select-none',
        'flex items-center justify-center',
        className
      )}
      style={{ width: size, height: size }}
      aria-label={name ?? 'User avatar'}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? 'User avatar'}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-semibold"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            fontSize: size * 0.38,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}
