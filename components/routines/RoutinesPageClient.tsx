'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { GlassCard } from '@/components/ui/GlassCard'
import { RoutineCard } from './RoutineCard'
import { AddRoutineModal } from './AddRoutineModal'
import { RoutineDetailDrawer } from './RoutineDetailDrawer'
import { staggerContainer, fadeInDown } from '@/lib/animations'
import { isToday, parseISO, addDays, startOfDay, endOfDay } from 'date-fns'
import type { Routine } from '@/types'

interface RoutinesPageClientProps {
  initialRoutines: Routine[]
}

type TabFilter = 'all' | 'today' | 'week' | 'overdue'

const TABS: { value: TabFilter; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'today',   label: 'Today' },
  { value: 'week',    label: 'This Week' },
  { value: 'overdue', label: 'Overdue' },
]

function filterRoutines(routines: Routine[], tab: TabFilter): Routine[] {
  const todayStart = startOfDay(new Date())
  const weekEnd    = endOfDay(addDays(todayStart, 7))

  switch (tab) {
    case 'today':
      return routines.filter((r) => isToday(parseISO(r.next_due)))
    case 'week':
      return routines.filter((r) => {
        const d = parseISO(r.next_due)
        return d >= todayStart && d <= weekEnd
      })
    case 'overdue':
      return routines.filter((r) => {
        const d = parseISO(r.next_due)
        return d < todayStart && !isToday(d)
      })
    default:
      return routines
  }
}

export function RoutinesPageClient({ initialRoutines }: RoutinesPageClientProps) {
  const [routines,        setRoutines]        = useState<Routine[]>(initialRoutines)
  const [activeTab,       setActiveTab]       = useState<TabFilter>('all')
  const [isAddOpen,       setIsAddOpen]       = useState(false)
  const [editRoutine,     setEditRoutine]     = useState<Routine | null>(null)
  const [drawerRoutineId, setDrawerRoutineId] = useState<string | null>(null)
  // Ref to track whether we're in edit mode at the time handleSave fires
  const isEditingRef = useRef<boolean>(false)

  const filteredRoutines = filterRoutines(routines, activeTab)

  const overdueCount = routines.filter((r) => {
    const d = parseISO(r.next_due)
    return d < startOfDay(new Date()) && !isToday(d)
  }).length
  const todayCount = routines.filter((r) => isToday(parseISO(r.next_due))).length
  const weekCount  = routines.filter((r) => {
    const d   = parseISO(r.next_due)
    const ts  = startOfDay(new Date())
    const we  = endOfDay(addDays(ts, 7))
    return d >= ts && d <= we
  }).length

    // ── Optimistic complete ────────────────────────────────────────────────
  // The RoutineCard plays its slide-out animation, then calls this after ~400ms.
  // We optimistically remove the card from the list immediately (it's already
  // animating out), then re-insert the updated routine with the new next_due.
  const handleComplete = useCallback(async (id: string) => {
    // The card is already gone visually — remove it from state
    setRoutines((prev) => prev.filter((r) => r.id !== id))

    try {
      const res  = await fetch(`/api/routines/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'complete' }),
      })
      const json = await res.json() as { data: { routine: Routine } | null; error: string | null }
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? 'Failed to complete.')

      // Re-insert the updated routine (new next_due) back into the sorted list
      setRoutines((prev) => {
        const updated = [json.data!.routine, ...prev]
        return updated.sort((a, b) => a.next_due.localeCompare(b.next_due))
      })
      toast.success('Done! Routine completed 🎉')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to complete: ${msg}`)
      // Re-fetch to restore accurate state
      fetch('/api/routines')
        .then((r) => r.json())
        .then((j: { data: { routines: Routine[] } | null }) => {
          if (j.data) setRoutines(j.data.routines)
        })
        .catch(() => {/* silent */})
    }
  }, [])

  // ── Skip ───────────────────────────────────────────────────────────────────
  const handleSkip = useCallback(async (id: string) => {
    // Optimistic: remove from list (it will re-appear with new due date)
    setRoutines((prev) => prev.filter((r) => r.id !== id))

    try {
      const res  = await fetch(`/api/routines/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'skip' }),
      })
      const json = await res.json() as { data: { routine: Routine } | null; error: string | null }
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? 'Failed to skip.')

      setRoutines((prev) => {
        const updated = [json.data!.routine, ...prev]
        return updated.sort((a, b) => a.next_due.localeCompare(b.next_due))
      })
      toast.success('Routine skipped.')
    } catch {
      toast.error('Failed to skip routine.')
      fetch('/api/routines')
        .then((r) => r.json())
        .then((j: { data: { routines: Routine[] } | null }) => {
          if (j.data) setRoutines(j.data.routines)
        })
        .catch(() => {/* silent */})
    }
  }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    const backup = routines.find((r) => r.id === id)
    setRoutines((prev) => prev.filter((r) => r.id !== id))
    try {
      const res  = await fetch(`/api/routines/${id}`, { method: 'DELETE' })
      const json = await res.json() as { data: unknown; error: string | null }
      if (!res.ok || json.error) throw new Error(json.error ?? 'Delete failed.')
      toast.success('Routine deleted.')
    } catch {
      if (backup) setRoutines((prev) => [...prev, backup].sort((a, b) => a.next_due.localeCompare(b.next_due)))
      toast.error('Failed to delete routine.')
    }
  }, [routines])

  // ── Save (add / edit) ──────────────────────────────────────────────────────
  const handleOpenAdd = useCallback(() => {
    isEditingRef.current = false
    setEditRoutine(null)
    setIsAddOpen(true)
  }, [])

  const handleOpenEdit = useCallback((r: Routine) => {
    isEditingRef.current = true
    setEditRoutine(r)
    setIsAddOpen(true)
  }, [])

  const handleSave = useCallback((saved: Routine) => {
    const wasEditing = isEditingRef.current
    setRoutines((prev) => {
      const exists = prev.find((r) => r.id === saved.id)
      const updated = exists
        ? prev.map((r) => (r.id === saved.id ? saved : r))
        : [saved, ...prev]
      return updated.sort((a, b) => a.next_due.localeCompare(b.next_due))
    })
    toast.success(wasEditing ? 'Routine updated!' : 'Routine created!')
    isEditingRef.current = false
    setEditRoutine(null)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsAddOpen(false)
    setEditRoutine(null)
    isEditingRef.current = false
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ textShadow: '0 0 20px rgba(16,185,129,0.3)' }}
          >
            Repeat
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Stay on top of recurring responsibilities
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          className="gap-2 shrink-0"
        >
          <RefreshCw size={15} />
          New Routine
        </Button>
      </motion.div>

      {/* Summary pills */}
      <motion.div
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
        className="flex gap-3 flex-wrap"
      >
        {[
          { label: 'Total',     value: routines.length, color: '#10b981' },
          { label: 'Due Today', value: todayCount,      color: '#f59e0b' },
          { label: 'This Week', value: weekCount,       color: '#6366f1' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="px-4 py-2 rounded-full text-sm font-medium glass border"
            style={{ borderColor: `${color}25`, color }}
          >
            {value} {label}
          </div>
        ))}
      </motion.div>

      {/* Tab filters */}
      <div className="flex gap-1 glass rounded-xl p-1 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={[
              'relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
              activeTab === tab.value
                ? 'text-module-routines bg-module-routines/10'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {tab.label}
            {tab.value === 'overdue' && overdueCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-error text-white font-bold leading-none">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {routines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-10"
        >
          <GlassCard accent="emerald" className="p-12 text-center max-w-sm w-full">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.08))' }}
            >
              <RefreshCw size={28} className="text-module-routines" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">No routines yet</h2>
            <p className="text-sm text-text-secondary mb-4">
              Create your first routine to start tracking recurring tasks.
            </p>
            <Button
              onClick={handleOpenAdd}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              + New Routine
            </Button>
          </GlassCard>
        </motion.div>
      ) : filteredRoutines.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-10"
        >
          <GlassCard className="p-8 text-center max-w-xs w-full">
            <AlertCircle size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary text-sm">
              No routines match &ldquo;{TABS.find((t) => t.value === activeTab)?.label}&rdquo;.
            </p>
          </GlassCard>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {filteredRoutines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onComplete={handleComplete}
                onSkip={handleSkip}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                onViewDetail={setDrawerRoutineId}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modals */}
      <AddRoutineModal
        isOpen={isAddOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initialData={editRoutine}
      />

      <RoutineDetailDrawer
        routineId={drawerRoutineId}
        onClose={() => setDrawerRoutineId(null)}
        onEdit={(r) => {
          setDrawerRoutineId(null)
          handleOpenEdit(r)
        }}
        onDelete={handleDelete}
      />
    </div>
  )
}
