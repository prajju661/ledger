'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { format, parseISO, isToday, isPast } from 'date-fns'
import { GlassCard } from '@/components/ui/GlassCard'
import { staggerContainer, fadeInUp } from '@/lib/animations'
import type { Routine } from '@/types'
import { useState, useCallback } from 'react'

interface UpcomingRoutinesProps {
  initialRoutines: Routine[]
}

function urgencyColor(nextDue: string): string {
  const d = parseISO(nextDue)
  if (isPast(d) && !isToday(d)) return '#ef4444'
  if (isToday(d)) return '#f59e0b'
  return '#10b981'
}

function dueLabel(nextDue: string): string {
  const d = parseISO(nextDue)
  if (isPast(d) && !isToday(d)) {
    const days = Math.floor((Date.now() - d.getTime()) / 86400000)
    return `${days}d overdue`
  }
  if (isToday(d)) return 'Today'
  return format(d, 'MMM d')
}

export function UpcomingRoutines({ initialRoutines }: UpcomingRoutinesProps) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines)

  const handleComplete = useCallback(async (id: string) => {
    // Optimistic remove
    setRoutines((prev) => prev.filter((r) => r.id !== id))
    try {
      const res = await fetch(`/api/routines/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'complete' }),
      })
      const json = await res.json() as { data: { routine: Routine } | null; error: string | null }
      if (!res.ok || json.error) throw new Error()
      toast.success('Done! Routine completed 🎉')
    } catch {
      toast.error('Failed to complete routine.')
      // Re-fetch would be ideal but for now just restore
      setRoutines(initialRoutines)
    }
  }, [initialRoutines])

  return (
    <GlassCard accent="emerald" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-text-primary">Upcoming Routines</h2>
        <Link href="/dashboard/routines" className="text-xs text-text-secondary hover:text-module-routines transition-colors">
          View All →
        </Link>
      </div>

      {routines.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-module-routines">✅ All caught up!</p>
          <p className="text-xs text-text-muted mt-0.5">No routines due soon.</p>
        </div>
      ) : (
        <motion.div
          className="space-y-2"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {routines.map((routine) => (
              <motion.div
                key={routine.id}
                variants={fadeInUp}
                exit={{ opacity: 0, x: 30, height: 0, transition: { duration: 0.25 } }}
                className="flex items-center gap-3 px-3 py-2.5 glass rounded-xl"
              >
                {/* Urgency dot */}
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: urgencyColor(routine.next_due), boxShadow: `0 0 6px ${urgencyColor(routine.next_due)}60` }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{routine.title}</p>
                  <p className="text-[10px] text-text-muted">{dueLabel(routine.next_due)}</p>
                </div>

                <button
                  onClick={() => void handleComplete(routine.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-module-routines border border-module-routines/30 hover:bg-module-routines/10 transition-colors shrink-0"
                  aria-label="Complete"
                >
                  <Check size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </GlassCard>
  )
}
