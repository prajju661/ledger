import { cn } from '@/lib/utils'
import type { Intent } from '@/types'

interface IntentBadgeProps {
  intent: Intent | string | null | undefined
  className?: string
}

const INTENT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  find_item:            { label: '🔍 Item Lookup',      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)' },
  add_item:             { label: '📦 Item Added',        color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)' },
  create_routine:       { label: '🔁 Routine Created',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  check_history:        { label: '📅 LifeLog Query',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  pending_tasks:        { label: '✅ Pending Check',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  get_pending_routines: { label: '✅ Pending Check',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
  general:              { label: '💬 Conversation',      color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)' },
}

export function IntentBadge({ intent, className }: IntentBadgeProps) {
  if (!intent) return null
  const config = INTENT_CONFIG[intent] ?? INTENT_CONFIG.general

  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border', className)}
      style={{ color: config.color, background: config.bg, borderColor: config.border }}
    >
      {config.label}
    </span>
  )
}
