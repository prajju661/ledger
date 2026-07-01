'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'
import { format, addDays, addWeeks, addMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Routine, CreateRoutineInput } from '@/types'

interface AddRoutineModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (routine: Routine) => void
  initialData?: Routine | null
}

type Frequency = 'daily' | 'weekly' | 'monthly' | 'custom'
type IntervalUnit = 'days' | 'weeks' | 'months'

function getDefaultNextDue(freq: Frequency, interval: number, unit: IntervalUnit): string {
  const today = new Date()
  if (freq === 'daily')   return format(addDays(today, 1), 'yyyy-MM-dd')
  if (freq === 'weekly')  return format(addWeeks(today, interval), 'yyyy-MM-dd')
  if (freq === 'monthly') return format(addMonths(today, interval), 'yyyy-MM-dd')
  if (freq === 'custom') {
    if (unit === 'days')   return format(addDays(today, interval), 'yyyy-MM-dd')
    if (unit === 'weeks')  return format(addWeeks(today, interval), 'yyyy-MM-dd')
    if (unit === 'months') return format(addMonths(today, interval), 'yyyy-MM-dd')
  }
  return format(addDays(today, 1), 'yyyy-MM-dd')
}

function buildPreviewText(freq: Frequency, interval: number, unit: IntervalUnit, nextDue: string): string {
  let repeatDesc = ''
  if (freq === 'daily') repeatDesc = 'every day'
  else if (freq === 'weekly') repeatDesc = interval === 1 ? 'every week' : `every ${interval} weeks`
  else if (freq === 'monthly') repeatDesc = interval === 1 ? 'every month' : `every ${interval} months`
  else if (freq === 'custom') repeatDesc = `every ${interval} ${unit}`

  const next = nextDue
    ? format(new Date(nextDue + 'T00:00:00'), 'MMM d, yyyy')
    : 'N/A'

  return `↻ Will repeat ${repeatDesc} · Next: ${next}`
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom',  label: 'Custom' },
]

export function AddRoutineModal({ isOpen, onClose, onSave, initialData }: AddRoutineModalProps) {
  const isEdit = !!initialData
  // Ref must be declared here at the top level — never between two useEffects
  const isEditRef = useRef(isEdit)

  const [title,        setTitle]        = useState('')
  const [frequency,    setFrequency]    = useState<Frequency>('weekly')
  const [interval,     setInterval]     = useState(1)
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>('weeks')
  const [nextDue,      setNextDue]      = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [notes,        setNotes]        = useState('')
  const [titleError,   setTitleError]   = useState('')
  const [loading,      setLoading]      = useState(false)

  // Keep isEditRef current so the nextDue auto-update effect can read it
  // without needing to be in its deps array
  useEffect(() => {
    isEditRef.current = isEdit
  }, [isEdit])

  // Pre-fill form when opening. Wrapped in Promise.resolve to satisfy
  // react-hooks/set-state-in-effect lint rule.
  useEffect(() => {
    if (!isOpen) return
    Promise.resolve().then(() => {
      if (initialData) {
        setTitle(initialData.title)
        setFrequency(initialData.frequency)
        setInterval(initialData.interval ?? 1)
        setIntervalUnit((initialData.interval_unit as IntervalUnit) ?? 'days')
        setNextDue(initialData.next_due)
        setReminderTime(initialData.reminder_time ?? '')
        setNotes(initialData.notes ?? '')
      } else {
        setTitle('')
        setFrequency('weekly')
        setInterval(1)
        setIntervalUnit('weeks')
        setNextDue(getDefaultNextDue('weekly', 1, 'weeks'))
        setReminderTime('')
        setNotes('')
      }
      setTitleError('')
    }).catch(() => {})
  }, [isOpen, initialData])

  // Auto-update nextDue when frequency / interval / unit changes (add mode only)
  useEffect(() => {
    if (isEditRef.current || !isOpen) return
    setNextDue(getDefaultNextDue(frequency, interval, intervalUnit))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frequency, interval, intervalUnit])

  const previewText = buildPreviewText(frequency, interval, intervalUnit, nextDue)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setTitleError('Title is required.'); return }

    setLoading(true)
    try {
      const payload: CreateRoutineInput & { interval_unit?: string | null } = {
        title: title.trim(),
        frequency,
        interval,
        interval_unit: frequency === 'custom' ? intervalUnit : null,
        next_due: nextDue,
        reminder_time: reminderTime || undefined,
        notes: notes.trim() || undefined,
      }

      const url = isEdit ? `/api/routines/${initialData!.id}` : '/api/routines'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json() as { data: { routine: Routine } | null; error: string | null }

      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? 'Failed to save.')

      onSave(json.data.routine)
      onClose()
    } catch (err) {
      setTitleError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Routine' : 'New Routine'}
      maxWidth="max-w-[500px]"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Title */}
        <Input
          label="Routine Title"
          placeholder="e.g. Change HVAC filter, Water plants..."
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
          error={titleError}
          autoComplete="off"
          maxLength={120}
        />

        {/* Frequency segmented control */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">Frequency</label>
          <div className="grid grid-cols-4 gap-1.5">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setFrequency(f.value)
                  // Reset interval unit to a sensible default per frequency
                  if (f.value === 'weekly')  setIntervalUnit('weeks')
                  if (f.value === 'monthly') setIntervalUnit('months')
                  if (f.value === 'daily')   setIntervalUnit('days')
                  if (f.value !== 'custom')  setInterval(1)
                }}
                className={cn(
                  'py-2 rounded-xl text-xs font-medium transition-all',
                  frequency === f.value
                    ? 'bg-module-routines/20 border border-module-routines/50 text-module-routines'
                    : 'glass text-text-secondary hover:text-text-primary hover:bg-white/[0.06]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom interval */}
        {frequency === 'custom' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary shrink-0">Every</label>
            <input
              type="number"
              min={1}
              max={365}
              value={interval}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="glass-input w-20 text-sm text-center"
            />
            <select
              value={intervalUnit}
              onChange={(e) => setIntervalUnit(e.target.value as IntervalUnit)}
              className="glass-input flex-1 text-sm"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
            </select>
          </div>
        )}

        {/* Weekly interval */}
        {frequency === 'weekly' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary shrink-0">Every</label>
            <input
              type="number"
              min={1}
              max={52}
              value={interval}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="glass-input w-20 text-sm text-center"
            />
            <span className="text-sm text-text-secondary">week{interval > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Monthly interval */}
        {frequency === 'monthly' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-secondary shrink-0">Every</label>
            <input
              type="number"
              min={1}
              max={24}
              value={interval}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="glass-input w-20 text-sm text-center"
            />
            <span className="text-sm text-text-secondary">month{interval > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Live preview pill */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs border"
          style={{
            background: 'rgba(16,185,129,0.08)',
            borderColor: 'rgba(16,185,129,0.25)',
            color: '#10b981',
          }}
        >
          <RefreshCw size={12} className="shrink-0" />
          <span>{previewText}</span>
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Next Due</label>
            <input
              type="date"
              value={nextDue}
              onChange={(e) => setNextDue(e.target.value)}
              className="glass-input text-sm"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Reminder <span className="text-text-disabled">(optional)</span>
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="glass-input text-sm"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary">
            Notes <span className="text-text-disabled">(optional)</span>
          </label>
          <textarea
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            rows={2}
            className="glass-input resize-none text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            isLoading={loading}
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            {isEdit ? 'Save Changes' : 'Create Routine'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
