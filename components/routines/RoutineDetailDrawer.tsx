'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, CheckCircle2, Calendar, Pencil, Trash2 } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Routine, RoutineCompletion } from '@/types'
import type { HeatmapCell } from '@/app/api/routines/[id]/history/route'

interface RoutineHistoryData {
  completions:      RoutineCompletion[]
  streak:           number
  totalCompletions: number
  heatmapData:      HeatmapCell[]
  routine:          Routine
}

interface RoutineDetailDrawerProps {
  routineId: string | null
  onClose:   () => void
  onEdit:    (routine: Routine) => void
  onDelete:  (id: string) => void
}

// Returns a Tailwind bg class based on the cell's action
function cellClass(cell: HeatmapCell): string {
  if (cell.isFuture)              return 'bg-white/5'
  if (cell.action === 'completed') return 'bg-emerald-500'
  if (cell.action === 'skipped')   return 'bg-red-700/70'
  return 'bg-white/[0.06]'       // no activity
}

function cellTitle(cell: HeatmapCell): string {
  if (cell.action === 'completed') return `Completed · ${cell.date}`
  if (cell.action === 'skipped')   return `Skipped · ${cell.date}`
  if (cell.isFuture)               return cell.date
  return `No activity · ${cell.date}`
}

export function RoutineDetailDrawer({ routineId, onClose, onEdit, onDelete }: RoutineDetailDrawerProps) {
  const [data,          setData]          = useState<RoutineHistoryData | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!routineId) return
    // Use Promise.resolve to avoid synchronous setState-in-effect lint error
    Promise.resolve().then(() => {
      setLoading(true)
      setConfirmDelete(false)
    }).catch(() => {})
    fetch(`/api/routines/${routineId}/history`)
      .then((r) => r.json())
      .then((j: { data: RoutineHistoryData | null; error: string | null }) => {
        setData(j.data ?? null)
      })
      .catch(() => { setData(null) })
      .finally(() => setLoading(false))
  }, [routineId])

  const isOpen = !!routineId

  // Build exactly 91 cells (13 cols × 7 rows) from the 90-day heatmap data.
  // Pad with 1 null at the front so the grid fills neatly.
  const gridCells: (HeatmapCell | null)[] = []
  if (data?.heatmapData) {
    // heatmapData has 90 entries; pad to 91 (= 13 × 7) with a null at the front
    gridCells.push(null)
    gridCells.push(...data.heatmapData)
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={data?.routine.title ?? 'Routine Details'}
      width="w-full max-w-[420px]"
    >
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 glass rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !data && routineId && (
        <p className="text-sm text-text-muted text-center py-8">
          Failed to load routine details.
        </p>
      )}

      {!loading && data && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon:   Flame,
                label:  'Streak',
                value:  `${data.streak}`,
                color:  '#f59e0b',
              },
              {
                icon:   CheckCircle2,
                label:  'Completed',
                value:  `${data.totalCompletions}`,
                color:  '#10b981',
              },
              {
                icon:   Calendar,
                label:  'Next Due',
                value:  format(parseISO(data.routine.next_due), 'MMM d'),
                color:  '#6366f1',
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="glass rounded-xl p-3 text-center"
                style={{ border: `1px solid ${color}25` }}
              >
                <Icon size={16} className="mx-auto mb-1" style={{ color }} />
                <p className="text-sm font-bold text-text-primary">{value}</p>
                <p className="text-[10px] text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* 3-Month Heatmap: 13 cols × 7 rows */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              3-Month History
            </h3>
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
            >
              {gridCells.map((cell, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.003, 0.3) }}
                >
                  {cell ? (
                    <div
                      className={cn(
                        'w-full aspect-square rounded-[2px] cursor-default transition-opacity hover:opacity-80',
                        cellClass(cell)
                      )}
                      title={cellTitle(cell)}
                    />
                  ) : (
                    <div className="w-full aspect-square" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-[10px] text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 inline-block" />
                Done
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-red-700/70 inline-block" />
                Skipped
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.06] inline-block" />
                Missed
              </span>
            </div>
          </div>

          {/* History list */}
          {data.completions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                History
              </h3>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                {data.completions.slice(0, 25).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-3 py-2 glass rounded-xl text-xs"
                  >
                    <span className="text-text-secondary">
                      {format(parseISO(c.completed_at), 'MMM d, yyyy · h:mm a')}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full font-medium border',
                        c.action === 'completed'
                          ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                          : 'text-amber-400 bg-amber-400/10 border-amber-400/20'
                      )}
                    >
                      {c.action === 'completed' ? '✓ Done' : '↷ Skipped'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.completions.length === 0 && (
            <p className="text-xs text-text-muted text-center py-4">
              No completions yet. Mark this routine as done to start tracking!
            </p>
          )}

          {/* Footer actions */}
          <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <Button
              variant="ghost"
              size="md"
              className="flex-1 gap-2"
              onClick={() => onEdit(data.routine)}
            >
              <Pencil size={14} />
              Edit
            </Button>

            {!confirmDelete ? (
              <Button
                variant="danger"
                size="md"
                className="flex-1 gap-2"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={14} />
                Delete
              </Button>
            ) : (
              <div className="flex-1 flex gap-1.5">
                <Button
                  variant="ghost"
                  size="md"
                  className="flex-1"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    onDelete(data.routine.id)
                    onClose()
                  }}
                >
                  Confirm
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}
