import { PackageSearch } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { GlassCard } from '@/components/ui/GlassCard'

export default function ItemsPage() {
  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard accent="cyan" className="p-12 text-center max-w-sm w-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.08))' }}
          >
            <PackageSearch size={28} className="text-module-items" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">WhereDidItGo</h2>
          <p className="text-sm text-text-secondary">
            Full item tracking with image upload and search coming in Phase 3.
          </p>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
