'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import type { ActivityLog } from '@/types'
import {
  Wrench, Sparkles, Heart, Banknote, Briefcase, User, Box,
} from 'lucide-react'

interface LogEntryProps {
  log:      ActivityLog
  onEdit:   (log: ActivityLog) => void
  onDelete: (id: string) => void
}

export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Maintenance: Wrench,
  Cleaning:    Sparkles,
  Health:      Heart,
  Finance:     Banknote,
  Work:        Briefcase,
  Personal:    User,
  Other:       Box,
}

export const CATEGORY_COLORS: Record<string, string> = {
  Maintenance: '#f97316',
  Cleaning:    '#06b6d4',
  Health:      '#ef4444',
  Finance:     '#10b981',
  Work:        '#6366f1',
  Personal:    '#a855f7',
  Other:       '#64748b',
}

export function LogEntry({ log, onEdit, onDelete }: LogEntryProps) {
  const [expanded,       setExpanded]       = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(false)

  const Icon  = CATEGORY_ICONS[log.category] ?? Box
  const color = CATEGORY_COLORS[log.category] ?? '#64748b'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
      className="group relative glass rounded-xl overflow-hidden"
      style={{ borderLeft: `3px solid ${color}60` }}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Category icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${color}18` }}
        >
          <Icon size={15} style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-text-primary leading-snug">{log.title}</h4>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-text-secondary" style={{ color: '#f59e0b' }}>
                {format(parseISO(log.completed_at), 'h:mm a')}
              </span>
            </div>
          </div>

          {/* Category badge */}
          <span
            className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border"
            style={{ color, background: `${color}15`, borderColor: `${color}30` }}
          >
            {log.category}
          </span>

          {/* Notes (truncated / expanded) */}
          {log.notes && (
            <div className="mt-1.5">
              <p className={cn('text-xs text-text-muted', !expanded && 'line-clamp-1')}>
                {log.notes}
              </p>
              {log.notes.length > 60 && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="text-[10px] text-text-disabled hover:text-text-secondary mt-0.5 flex items-center gap-0.5"
                >
                  {expanded ? <><ChevronUp size={10} /> Less</> : <><ChevronDown size={10} /> More</>}
                </button>
              )}
            </div>
          )}

          {/* Inline delete confirm */}
          <AnimatePresence>
            {confirmDelete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2"
              >
                <p className="text-xs text-text-secondary mb-1.5">Remove this entry? Cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1 rounded-lg text-xs glass text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setConfirmDelete(false); onDelete(log.id) }}
                    className="px-3 py-1 rounded-lg text-xs bg-error/15 text-error hover:bg-error/25"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hover actions */}
        {!confirmDelete && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(log)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.07] transition-colors"
              aria-label="Edit"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
