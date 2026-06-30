import { LayoutDashboard } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { GlassCard } from '@/components/ui/GlassCard'

export default function DashboardPage() {
  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard accent="indigo" className="p-12 text-center max-w-sm w-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))' }}
          >
            <LayoutDashboard size={28} className="text-accent-primary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Dashboard</h2>
          <p className="text-sm text-text-secondary">
            Full dashboard with live stats and widgets coming in Phase 5.
          </p>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
