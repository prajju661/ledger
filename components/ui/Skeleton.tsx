import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  /** Override width inline (e.g. "120px", "60%") */
  width?: string
  /** Override height inline */
  height?: string
}

/**
 * Pulse shimmer placeholder that matches the shape of the real content.
 * Use multiple Skeletons arranged like the actual card layout.
 */
export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg',
        'bg-white/[0.06]',
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

/** Pre-built skeleton that matches a standard GlassCard with title + body */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('glass rounded-2xl p-5 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

/** Pre-built skeleton for a stat card */
export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}
