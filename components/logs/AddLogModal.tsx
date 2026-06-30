'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { format, isFuture, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { LOG_CATEGORIES } from '@/lib/constants'
import type { ActivityLog, CreateLogInput } from '@/types'
import {
  Wrench, Sparkles, Heart, Banknote, Briefcase, User, Box,
} from 'lucide-react'

interface AddLogModalProps {
  isOpen:      boolean
  onClose:     () => void
  onSave:      (log: ActivityLog) => void
  initialData?: ActivityLog | null
}

const MAX_NOTES = 1000

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

export function AddLogModal({ isOpen, onClose, onSave, initialData }: AddLogModalProps) {
  const isEdit = !!initialData

  const [title,        setTitle]        = useState('')
  const [category,     setCategory]     = useState<string>('Personal')
  const [notes,        setNotes]        = useState('')
  const [dateStr,      setDateStr]      = useState('')
  const [timeStr,      setTimeStr]      = useState('')
  const [logForToday,  setLogForToday]  = useState(true)
  const [titleError,   setTitleError]   = useState('')
  const [dateError,    setDateError]    = useState('')
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const now = new Date()
    /* eslint-disable react-hooks/set-state-in-effect */
    if (initialData) {
      setTitle(initialData.title)
      setCategory(initialData.category)
      setNotes(initialData.notes ?? '')
      const d = parseISO(initialData.completed_at)
      setDateStr(format(d, 'yyyy-MM-dd'))
      setTimeStr(format(d, 'HH:mm'))
      setLogForToday(false)
    } else {
      setTitle('')
      setCategory('Personal')
      setNotes('')
      setDateStr(format(now, 'yyyy-MM-dd'))
      setTimeStr(format(now, 'HH:mm'))
      setLogForToday(true)
    }
    setTitleError('')
    setDateError('')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen, initialData])

  // Sync dateStr to today when toggle is on
  useEffect(() => {
    if (logForToday) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDateStr(format(new Date(), 'yyyy-MM-dd'))
    }
  }, [logForToday])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    setTitleError('')
    setDateError('')

    if (!title.trim()) { setTitleError('Title is required.'); valid = false }

    const completedAt = new Date(`${dateStr}T${timeStr || '00:00'}`)
    if (isFuture(completedAt)) {
      setDateError('Cannot log activities in the future.')
      valid = false
    }
    if (!valid) return

    setLoading(true)
    try {
      const payload: CreateLogInput = {
        title:        title.trim(),
        category,
        notes:        notes.trim() || undefined,
        completed_at: completedAt.toISOString(),
      }

      const url    = isEdit ? `/api/logs/${initialData!.id}` : '/api/logs'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json() as { data: { log: ActivityLog } | null; error: string | null }
      if (!res.ok || json.error || !json.data) throw new Error(json.error ?? 'Failed to save.')

      onSave(json.data.log)
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
      title={isEdit ? 'Edit Log Entry' : 'Log Activity'}
      maxWidth="max-w-[480px]"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Title */}
        <Input
          label="Activity Title"
          placeholder="What did you do? e.g. Serviced bike, Paid bills..."
          value={title}
          onChange={(e) => { setTitle(e.target.value); setTitleError('') }}
          error={titleError}
          autoComplete="off"
          maxLength={150}
        />

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-secondary">Category</label>
          <div className="grid grid-cols-4 gap-1.5">
            {LOG_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat] ?? Box
              const color = CATEGORY_COLORS[cat] ?? '#64748b'
              const isActive = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-medium transition-all border',
                    isActive
                      ? 'border-current'
                      : 'glass border-white/[0.07] text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  )}
                  style={isActive ? { color, background: `${color}18`, borderColor: `${color}40` } : {}}
                >
                  <Icon size={14} />
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Date/Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">When</label>
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer">
              <Toggle
                checked={logForToday}
                onChange={setLogForToday}
                accentColor="#f59e0b"
              />
              Log for today
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={dateStr}
              onChange={(e) => { setDateStr(e.target.value); setDateError('') }}
              disabled={logForToday}
              className={cn('glass-input text-sm', logForToday && 'opacity-50 cursor-not-allowed')}
            />
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              className="glass-input text-sm"
            />
          </div>
          {dateError && <p className="text-xs text-error" role="alert">{dateError}</p>}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text-secondary">
              Notes <span className="text-text-disabled">(optional)</span>
            </label>
            <span className={cn('text-xs', notes.length > MAX_NOTES * 0.9 ? 'text-warning' : 'text-text-disabled')}>
              {notes.length}/{MAX_NOTES}
            </span>
          </div>
          <textarea
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES))}
            rows={3}
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
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {isEdit ? 'Save Changes' : 'Log Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
