'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, SkipForward, MoreVertical, Pencil, Trash2,
  Clock, RefreshCw, Calendar,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { format, isPast, isToday, parseISO, addDays } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Routine } from '@/types'

interface RoutineCardProps {
  routine: Routine
  onComplete:   (id: string) => void
  onSkip:       (id: string) => void
  onEdit:       (routine: Routine) => void
  onDelete:     (id: string) => void
  onViewDetail: (id: string) => void
}

function frequencyLabel(r: Routine): string {
  if (r.frequency === 'daily')   return 'Daily'
  if (r.frequency === 'weekly')  return `Every ${r.interval > 1 ? `${r.interval} ` : ''}week${r.interval > 1 ? 's' : ''}`
  if (r.frequency === 'monthly') return `Every ${r.interval > 1 ? `${r.interval} ` : ''}month${r.interval > 1 ? 's' : ''}`
  if (r.frequency === 'custom' && r.interval_unit) {
    return `Every ${r.interval} ${r.interval_unit}`
  }
  return 'Custom'
}

function getDueBadgeVariant(nextDue: string): { color: string; label: string } {
  const dueDate = parseISO(nextDue)
  if (isPast(dueDate) && !isToday(dueDate)) return { color: '#ef4444', label: 'Overdue' }
  if (isToday(dueDate)) return { color: '#f59e0b', label: 'Today' }
  if (dueDate <= addDays(new Date(), 7)) return { color: '#10b981', label: format(dueDate, 'MMM d') }
  return { color: '#64748b', label: format(dueDate, 'MMM d') }
}

function getAccentBarColor(nextDue: string): string {
  const dueDate = parseISO(nextDue)
  if (isPast(dueDate) && !isToday(dueDate)) return '#ef4444'
  if (isToday(dueDate)) return '#f59e0b'
  if (dueDate <= addDays(new Date(), 7)) return '#10b981'
  return '#334155'
}

const freqBadgeColor: Record<string, string> = {
  daily:   '#3b82f6',
  weekly:  '#10b981',
  monthly: '#8b5cf6',
  custom:  '#f59e0b',
}

export function RoutineCard({
  routine,
  onComplete,
  onSkip,
  onEdit,
  onDelete,
  onViewDetail,
}: RoutineCardProps) {
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [confirmDelete,  setConfirmDelete]  = useState(false)
  const [confirmSkip,    setConfirmSkip]    = useState(false)
  const [completing,     setCompleting]     = useState(false)

  const dueBadge = getDueBadgeVariant(routine.next_due)
  const accentColor = getAccentBarColor(routine.next_due)
  const freqColor = freqBadgeColor[routine.frequency] ?? '#64748b'

  const handleComplete = () => {
    setCompleting(true)
    // Trigger exit animation, then call onComplete
    setTimeout(() => onComplete(routine.id), 350)
  }

  return (
    <motion.div
      layout
      animate={completing ? { x: 60, opacity: 0, height: 0, marginBottom: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } } : {}}
      initial={{ opacity: 0, y: 12 }}
      exit={{ opacity: 0, x: 60, height: 0, transition: { duration: 0.3 } }}
    >
      <GlassCard accent="emerald" className="overflow-hidden">
        <div className="flex items-stretch">
          {/* Left accent bar */}
          <div
            className="w-1 shrink-0 rounded-l-2xl"
            style={{ background: accentColor }}
          />

          {/* Content */}
          <div className="flex-1 p-4 min-w-0">
            {/* Row 1: title + actions */}
            <div className="flex items-start gap-2 mb-2">
              <button
                className="flex-1 text-left"
                onClick={() => onViewDetail(routine.id)}
              >
                <h3 className="font-semibold text-text-primary text-sm leading-snug hover:text-module-routines transition-colors truncate">
                  {routine.title}
                </h3>
              </button>

              {/* Frequency badge */}
              <span
                className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                style={{
                  color: freqColor,
                  background: `${freqColor}18`,
                  borderColor: `${freqColor}30`,
                }}
              >
                <RefreshCw size={8} className="inline mr-0.5 -mt-px" />
                {frequencyLabel(routine)}
              </span>
            </div>

            {/* Row 2: due date */}
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
              <Calendar size={11} className="shrink-0" style={{ color: dueBadge.color }} />
              <span>Due: </span>
              <span style={{ color: dueBadge.color }} className="font-medium">{dueBadge.label}</span>
            </div>

            {/* Row 3: reminder */}
            {routine.reminder_time && (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Clock size={11} className="shrink-0" />
                <span>Reminder: {routine.reminder_time}</span>
              </div>
            )}

            {/* Notes */}
            {routine.notes && (
              <p className="text-xs text-text-muted mt-1 truncate">{routine.notes}</p>
            )}
          </div>

          {/* Right action column */}
          <div className="flex flex-col items-end justify-center gap-1.5 pr-4 shrink-0">
            {/* ✓ Done */}
            <button
              onClick={handleComplete}
              disabled={completing}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                'border border-module-routines/30 text-module-routines',
                'hover:bg-module-routines/10 active:scale-95',
                completing && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Check size={12} />
              Done
            </button>

            {/* ⋮ More */}
            <div className="relative">
              <button
                onClick={() => { setMenuOpen((o) => !o); setConfirmDelete(false); setConfirmSkip(false) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium glass text-text-muted hover:text-text-primary transition-colors"
              >
                <MoreVertical size={12} />
                More
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className="absolute right-0 bottom-8 z-30 glass-modal rounded-xl py-1.5 min-w-[148px]"
                    initial={{ opacity: 0, scale: 0.92, y: 4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 4 }}
                    transition={{ duration: 0.12 }}
                    onMouseLeave={() => { if (!confirmDelete && !confirmSkip) setMenuOpen(false) }}
                  >
                    {!confirmDelete && !confirmSkip ? (
                      <>
                        <button
                          onClick={() => { setMenuOpen(false); onEdit(routine) }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmSkip(true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
                        >
                          <SkipForward size={13} />
                          Skip
                        </button>
                        <div className="mx-2 h-px bg-white/[0.06] my-0.5" />
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </>
                    ) : confirmSkip ? (
                      <div className="px-3 py-2 space-y-2">
                        <p className="text-xs text-text-secondary">Skip this occurrence?</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setConfirmSkip(false); setMenuOpen(false) }}
                            className="flex-1 px-2 py-1 text-xs rounded-lg glass text-text-secondary hover:text-text-primary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => { setMenuOpen(false); setConfirmSkip(false); onSkip(routine.id) }}
                            className="flex-1 px-2 py-1 text-xs rounded-lg bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                          >
                            Skip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="px-3 py-2 space-y-2">
                        <p className="text-xs text-text-secondary">Delete permanently?</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setConfirmDelete(false); setMenuOpen(false) }}
                            className="flex-1 px-2 py-1 text-xs rounded-lg glass text-text-secondary hover:text-text-primary"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => { setMenuOpen(false); setConfirmDelete(false); onDelete(routine.id) }}
                            className="flex-1 px-2 py-1 text-xs rounded-lg bg-error/15 text-error hover:bg-error/25"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
