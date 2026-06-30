import { Skeleton } from '@/components/ui/Skeleton'

export function ItemsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="glass rounded-2xl overflow-hidden flex flex-col">
          {/* Image area */}
          <Skeleton className="h-40 w-full rounded-none rounded-t-2xl" />
          {/* Body */}
          <div className="p-4 space-y-3 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
            </div>
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-1/3 mt-auto" />
          </div>
        </div>
      ))}
    </div>
  )
}
