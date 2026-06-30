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
  routineId:  string | null
  onClose:    () => void
  onEdit:     (routine: Routine) => void
  onDelete:   (id: string) => void
}

function HeatmapCellTip({ cell }: { cell: HeatmapCell }) {
  let bg = 'bg-bg-elevated'
  let title = cell.date

  if (cell.isFuture) bg = 'bg-bg-overlay'
  else if (cell.action === 'completed') { bg = 'bg-emerald-600' ; title = `Completed on ${cell.date}` }
  else if (cell.action === 'skipped')   { bg = 'bg-red-800'     ; title = `Skipped on ${cell.date}` }
  else title = `No activity on ${cell.date}`

  return (
    <div
      className={cn('w-3 h-3 rounded-sm cursor-default', bg)}
      title={title}
    />
  )
}

export function RoutineDetailDrawer({ routineId, onClose, onEdit, onDelete }: RoutineDetailDrawerProps) {
  const [data,    setData]    = useState<RoutineHistoryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    if (!routineId) { setData(null); return }
    setLoading(true)
    fetch(`/api/routines/${routineId}/history`)
      .then((r) => r.json())
      .then((j: { data: RoutineHistoryData | null; error: string | null }) => {
        if (j.data) setData(j.data)
      })
      .catch(() => {/* silent */})
      .finally(() => setLoading(false))
  }, [routineId])

  const isOpen = !!routineId

  // Build 13-col × 7-row grid from heatmapData (90 days → pad to 91 = 13 * 7)
  const paddedCells: (HeatmapCell | null)[] = []
  if (data?.heatmapData) {
    // pad front so day 0 aligns to the right week column
    const cells = data.heatmapData
    const totalNeeded = 91
    const frontPad = totalNeeded - cells.length
    for (let i = 0; i < frontPad; i++) paddedCells.push(null)
    paddedCells.push(...cells)
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 glass rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && data && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Flame,        label: 'Streak',     value: data.streak,           color: '#f59e0b' },
              { icon: CheckCircle2, label: 'Completed',  value: data.totalCompletions, color: '#10b981' },
              { icon: Calendar,     label: 'Next Due',   value: format(parseISO(data.routine.next_due), 'MMM d'), color: '#6366f1', isText: true },
            ].map(({ icon: Icon, label, value, color, isText }) => (
              <div
                key={label}
                className="glass rounded-xl p-3 text-center"
                style={{ border: `1px solid ${color}25` }}
              >
                <Icon size={16} className="mx-auto mb-1" style={{ color }} />
                <p className="text-sm font-bold text-text-primary">
                  {isText ? value : value}
                </p>
                <p className="text-[10px] text-text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* Heatmap */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              3-Month History
            </h3>
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
            >
              {paddedCells.map((cell, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.002 }}
                >
                  {cell ? (
                    <HeatmapCellTip cell={cell} />
                  ) : (
                    <div className="w-3 h-3" />
                  )}
                </motion.div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> Done</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-800 inline-block" /> Skipped</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-bg-elevated inline-block" /> Missed</span>
            </div>
          </div>

          {/* History list */}
          {data.completions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                History
              </h3>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {data.completions.slice(0, 20).map((c) => (
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
                      {c.action === 'completed' ? '✓ Completed' : '↷ Skipped'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
                <Button variant="ghost" size="md" className="flex-1" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  className="flex-1"
                  onClick={() => { onDelete(data.routine.id); onClose() }}
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
