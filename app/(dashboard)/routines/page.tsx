import { RefreshCw } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { GlassCard } from '@/components/ui/GlassCard'

export default function RoutinesPage() {
  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard accent="emerald" className="p-12 text-center max-w-sm w-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))' }}
          >
            <RefreshCw size={28} className="text-module-routines" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Repeat</h2>
          <p className="text-sm text-text-secondary">
            Recurring routines with streaks and heatmap coming in Phase 4.
          </p>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
