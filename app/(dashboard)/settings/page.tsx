import { Settings } from 'lucide-react'
import { PageTransition } from '@/components/layout/PageTransition'
import { GlassCard } from '@/components/ui/GlassCard'

export default function SettingsPage() {
  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-12 text-center max-w-sm w-full">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))' }}
          >
            <Settings size={28} className="text-text-secondary" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Settings</h2>
          <p className="text-sm text-text-secondary">
            Profile, security, notifications, and account management coming in Phase 6.
          </p>
        </GlassCard>
      </div>
    </PageTransition>
  )
}
