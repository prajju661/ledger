import { format, parseISO } from 'date-fns'
import { timeAgo, formatRelativeDate } from '@/lib/utils'
import type { Item, Routine, ActivityLog } from '@/types'

interface InlineResultCardProps {
  metadata: Record<string, unknown>
}

export function InlineResultCard({ metadata }: InlineResultCardProps) {
  const { type, data } = metadata

  if (type === 'not_found') {
    return (
      <div className="mt-2 px-3 py-2.5 rounded-xl border text-sm"
        style={{ background: 'rgba(100,116,139,0.08)', borderColor: 'rgba(100,116,139,0.2)' }}>
        <p className="text-text-muted">No results found.</p>
      </div>
    )
  }

  if (type === 'items') {
    const items = data as Item[]
    return (
      <div className="mt-2 space-y-2">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="px-3 py-2.5 rounded-xl border text-sm"
            style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)' }}
          >
            <p className="font-semibold text-text-primary">📦 {item.name}</p>
            <p className="text-text-secondary text-xs mt-0.5">📍 {item.location}</p>
            <p className="text-text-muted text-[10px] mt-0.5">🏷 {item.category} · Added {timeAgo(item.created_at)}</p>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'item_added') {
    const item = data as Item
    if (!item) return null
    return (
      <div className="mt-2 px-3 py-2.5 rounded-xl border text-sm"
        style={{ background: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)' }}>
        <p className="font-semibold text-text-primary">📦 {item.name} added!</p>
        <p className="text-text-secondary text-xs mt-0.5">📍 {item.location}</p>
        <p className="text-text-muted text-[10px] mt-0.5">🏷 {item.category}</p>
      </div>
    )
  }

  if (type === 'routine') {
    const routine = data as Routine
    if (!routine) return null
    return (
      <div className="mt-2 px-3 py-2.5 rounded-xl border text-sm"
        style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
        <p className="font-semibold text-text-primary">🔁 {routine.title} created!</p>
        <p className="text-text-secondary text-xs mt-0.5">
          Every {routine.interval > 1 ? `${routine.interval} ` : ''}{routine.frequency}
        </p>
        <p className="text-text-muted text-[10px] mt-0.5">
          Next due: {format(parseISO(routine.next_due), 'MMM d, yyyy')}
        </p>
      </div>
    )
  }

  if (type === 'log_result') {
    const log = data as ActivityLog
    if (!log) return null
    return (
      <div className="mt-2 px-3 py-2.5 rounded-xl border text-sm"
        style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
        <p className="font-semibold text-text-primary">✅ Found in LifeLog</p>
        <p className="text-text-secondary text-xs mt-0.5">{log.title}</p>
        <p className="text-text-muted text-[10px] mt-0.5">
          {formatRelativeDate(log.completed_at)} · {timeAgo(log.completed_at)}
        </p>
      </div>
    )
  }

  if (type === 'routines_list') {
    const routines = data as Routine[]
    if (!routines?.length) {
      return (
        <div className="mt-2 px-3 py-2.5 rounded-xl border text-sm"
          style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <p className="text-text-muted">No pending routines found.</p>
        </div>
      )
    }
    return (
      <div className="mt-2 px-3 py-2.5 rounded-xl border text-sm"
        style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
        <p className="font-semibold text-text-primary mb-1.5">🔁 Pending Routines</p>
        {routines.slice(0, 3).map((r) => (
          <div key={r.id} className="flex items-center justify-between py-0.5">
            <span className="text-text-secondary text-xs">● {r.title}</span>
            <span className="text-[10px] text-text-muted">Due: {format(parseISO(r.next_due), 'MMM d')}</span>
          </div>
        ))}
        {routines.length > 3 && (
          <p className="text-[10px] text-text-muted mt-1">+ {routines.length - 3} more routines</p>
        )}
      </div>
    )
  }

  return null
}
