import Link from 'next/link'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDistanceToNow, parseISO } from 'date-fns'
import type { ActivityLog } from '@/types'
import {
  Wrench, Sparkles, Heart, Banknote, Briefcase, User, Box,
} from 'lucide-react'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Maintenance: Wrench,
  Cleaning:    Sparkles,
  Health:      Heart,
  Finance:     Banknote,
  Work:        Briefcase,
  Personal:    User,
  Other:       Box,
}

const CATEGORY_COLORS: Record<string, string> = {
  Maintenance: '#f97316',
  Cleaning:    '#06b6d4',
  Health:      '#ef4444',
  Finance:     '#10b981',
  Work:        '#6366f1',
  Personal:    '#a855f7',
  Other:       '#64748b',
}

interface RecentActivityProps {
  logs: ActivityLog[]
}

export function RecentActivity({ logs }: RecentActivityProps) {
  return (
    <GlassCard accent="amber" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-primary">Recent Activities</h2>
        <Link href="/dashboard/logs" className="text-xs text-text-secondary hover:text-module-logs transition-colors">
          View All →
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-text-muted">No activities logged yet.</p>
          <p className="text-xs text-text-disabled mt-0.5">Start tracking what you&apos;ve done.</p>
        </div>
      ) : (
        <div className="relative pl-5">
          {/* Vertical dashed line */}
          <div
            className="absolute left-0 top-2 bottom-2 w-px"
            style={{ borderLeft: '1px dashed rgba(245,158,11,0.2)' }}
          />
          <div className="space-y-3">
            {logs.map((log) => {
              const Icon  = CATEGORY_ICONS[log.category] ?? Box
              const color = CATEGORY_COLORS[log.category] ?? '#64748b'
              return (
                <Link
                  key={log.id}
                  href="/dashboard/logs"
                  className="relative flex items-start gap-2.5 group"
                >
                  {/* Dot */}
                  <div
                    className="absolute -left-5 top-2.5 w-2 h-2 rounded-full -translate-x-[3px]"
                    style={{ background: '#f59e0b' }}
                  />
                  {/* Icon */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${color}15` }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate group-hover:text-module-logs transition-colors">{log.title}</p>
                    <p className="text-[10px] text-text-muted">
                      {formatDistanceToNow(parseISO(log.completed_at), { addSuffix: true })}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </GlassCard>
  )
}
