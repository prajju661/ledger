'use client'

import { AnimatePresence } from 'framer-motion'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { LogEntry } from './LogEntry'
import type { ActivityLog } from '@/types'

interface TimelineProps {
  logs:     ActivityLog[]
  onEdit:   (log: ActivityLog) => void
  onDelete: (id: string) => void
}

function groupByDate(logs: ActivityLog[]): Array<{ label: string; items: ActivityLog[] }> {
  const groups: Map<string, ActivityLog[]> = new Map()

  for (const log of logs) {
    const d = parseISO(log.completed_at)
    let label: string
    if (isToday(d)) {
      label = 'TODAY'
    } else if (isYesterday(d)) {
      label = 'YESTERDAY'
    } else {
      label = format(d, 'MMM d, yyyy').toUpperCase()
    }
    if (!groups.has(label)) groups.set(label, [])
    groups.get(label)!.push(log)
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

export function Timeline({ logs, onEdit, onDelete }: TimelineProps) {
  const groups = groupByDate(logs)

  if (groups.length === 0) return null

  return (
    <div className="space-y-8">
      {groups.map(({ label, items }) => (
        <div key={label} className="relative">
          {/* Date header */}
          <div className="flex items-center gap-3 mb-4">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                background: 'rgba(245,158,11,0.12)',
                color:       '#f59e0b',
                borderColor: 'rgba(245,158,11,0.25)',
              }}
            >
              {label}
            </span>
            <div className="flex-1 h-px bg-amber-500/10" />
          </div>

          {/* Entries with timeline connector */}
          <div className="relative pl-5">
            {/* Dashed vertical line */}
            <div
              className="absolute left-0 top-3 bottom-3 w-px"
              style={{
                borderLeft: '1px dashed rgba(245,158,11,0.25)',
              }}
            />

            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout">
                {items.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Dot on the line */}
                    <div
                      className="absolute -left-5 top-4 w-2 h-2 rounded-full -translate-x-[3px]"
                      style={{ background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}
                    />
                    <LogEntry log={log} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
