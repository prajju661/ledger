import { BookOpen } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { GlassCard } from '@/components/ui/GlassCard'

export default function LogsPage() {
  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard accent="amber" className="p-12 text-center max-w-sm w-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))' }}
          >
            <BookOpen size={28} className="text-module-logs" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">LifeLog</h2>
          <p className="text-sm text-text-secondary">
            Activity timeline and stats charts coming in Phase 4.
          </p>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
