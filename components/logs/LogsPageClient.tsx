'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Search, LayoutList, AlignJustify,
  Clock, BarChart2,
  Wrench, Sparkles, Heart,
  Banknote, Briefcase, User, Box,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GlassCard } from '@/components/ui/GlassCard'
import { Timeline } from './Timeline'
import { CATEGORY_COLORS } from './LogEntry'
import { AddLogModal } from './AddLogModal'
import { StatsCharts } from './StatsCharts'
import { staggerContainer, fadeInDown } from '@/lib/animations'
import { format, parseISO } from 'date-fns'
import { LOG_CATEGORIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ActivityLog } from '@/types'

type ViewMode = 'timeline' | 'grid' | 'list' | 'stats'

interface StatsData {
  byMonth:    { month: string; count: number }[]
  byCategory: { category: string; count: number }[]
  heatmap:    { date: string; count: number }[]
  summary: {
    total: number
    mostActiveMonth: string
    topCategory:     string | null
    longestStreak:   number
  }
}

interface LogsPageClientProps {
  initialLogs:  ActivityLog[]
  initialStats: StatsData | null
}

const DATE_PRESETS = ['today', 'week', 'month', 'year', 'all'] as const
type DatePreset = typeof DATE_PRESETS[number]

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Maintenance: Wrench,
  Cleaning:    Sparkles,
  Health:      Heart,
  Finance:     Banknote,
  Work:        Briefcase,
  Personal:    User,
  Other:       Box,
}

function presetToDates(preset: DatePreset): { from: string | null; to: string | null } {
  const today = new Date()
  const f = (d: Date) => format(d, 'yyyy-MM-dd')

  if (preset === 'today')  return { from: f(today), to: f(today) }
  if (preset === 'week')   return { from: f(new Date(today.getTime() - 7  * 86400000)), to: f(today) }
  if (preset === 'month')  return { from: f(new Date(today.getTime() - 30 * 86400000)), to: f(today) }
  if (preset === 'year')   return { from: f(new Date(today.getTime() - 365 * 86400000)), to: f(today) }
  return { from: null, to: null }
}

export function LogsPageClient({ initialLogs, initialStats }: LogsPageClientProps) {
  const [logs,            setLogs]            = useState<ActivityLog[]>(initialLogs)
  const [view,            setView]            = useState<ViewMode>('timeline')
  const [search,          setSearch]          = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [activeCategory,  setActiveCategory]  = useState('All')
  const [activePreset,    setActivePreset]    = useState<DatePreset>('all')
  const [dateFrom,        setDateFrom]        = useState<string | null>(null)
  const [dateTo,          setDateTo]          = useState<string | null>(null)
  const [isLoading,       setIsLoading]       = useState(false)
  const [isAddOpen,       setIsAddOpen]       = useState(false)
  const [editingLog,      setEditingLog]      = useState<ActivityLog | null>(null)
  const [stats,           setStats]           = useState<StatsData | null>(initialStats)
  const [statsLoading,    setStatsLoading]    = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search])

  // Fetch logs on filter change
  const fetchLogs = useCallback(async (
    s: string, cat: string, from: string | null, to: string | null
  ) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (s)   params.set('search',   s)
      if (cat && cat !== 'All') params.set('category', cat)
      if (from) params.set('from', from)
      if (to)   params.set('to',   to)
      const res = await fetch(`/api/logs?${params}`)
      const json = await res.json() as { data: { logs: ActivityLog[] } | null; error: string | null }
      if (json.data) setLogs(json.data.logs)
    } catch {
      toast.error('Failed to load logs.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch stats when switching to stats view
  useEffect(() => {
    if (view === 'stats' && !stats) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatsLoading(true)
      fetch('/api/logs/stats')
        .then((r) => r.json())
        .then((j: { data: StatsData | null; error: string | null }) => { if (j.data) setStats(j.data) })
        .catch(() => {})
        .finally(() => setStatsLoading(false))
    }
  }, [view, stats])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchLogs(debouncedSearch, activeCategory, dateFrom, dateTo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeCategory, dateFrom, dateTo])

  const handlePreset = (preset: DatePreset) => {
    setActivePreset(preset)
    const { from, to } = presetToDates(preset)
    setDateFrom(from)
    setDateTo(to)
  }

  // Stats (computed at render time — use stable inline date)
  const _now = new Date()
  const thisMonth = logs.filter((l) => {
    const d = parseISO(l.completed_at)
    return d.getMonth() === _now.getMonth() && d.getFullYear() === _now.getFullYear()
  }).length
  const thisWeek = logs.filter((l) => {
    const d = parseISO(l.completed_at)
    return d >= new Date(_now.getTime() - 7 * 86400000)
  }).length

  // Optimistic add/edit
  const handleSave = useCallback((saved: ActivityLog) => {
    setLogs((prev) => {
      const exists = prev.find((l) => l.id === saved.id)
      if (exists) return prev.map((l) => (l.id === saved.id ? saved : l))
      return [saved, ...prev]
    })
    toast.success(editingLog ? 'Log updated!' : 'Activity logged!')
    setEditingLog(null)
    // Invalidate stats cache
    setStats(null)
  }, [editingLog])

  // Optimistic delete
  const handleDelete = useCallback(async (id: string) => {
    const backup = logs.find((l) => l.id === id)
    setLogs((prev) => prev.filter((l) => l.id !== id))
    toast.success('Log removed.')
    setStats(null)
    try {
      const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' })
      const json = await res.json() as { data: unknown; error: string | null }
      if (!res.ok || json.error) throw new Error(json.error ?? 'Delete failed.')
    } catch {
      if (backup) setLogs((prev) => [backup, ...prev])
      toast.error('Failed to delete log.')
    }
  }, [logs])

  const VIEW_TABS: { value: ViewMode; icon: React.ElementType; label: string }[] = [
    { value: 'timeline', icon: Clock,       label: 'Timeline' },
    { value: 'grid',     icon: LayoutList,  label: 'Grid' },
    { value: 'list',     icon: AlignJustify, label: 'List' },
    { value: 'stats',    icon: BarChart2,   label: 'Stats' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInDown} initial="hidden" animate="visible"
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ textShadow: '0 0 20px rgba(245,158,11,0.3)' }}
          >
            LifeLog
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">A record of everything you&apos;ve done</p>
        </div>
        <Button
          onClick={() => { setEditingLog(null); setIsAddOpen(true) }}
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          className="gap-2 shrink-0"
        >
          <BookOpen size={15} />
          Log Activity
        </Button>
      </motion.div>

      {/* Summary pills */}
      <motion.div variants={fadeInDown} initial="hidden" animate="visible" className="flex gap-3 flex-wrap">
        {[
          { label: 'Total',      value: logs.length, color: '#f59e0b' },
          { label: 'This Month', value: thisMonth,   color: '#10b981' },
          { label: 'This Week',  value: thisWeek,    color: '#6366f1' },
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

      {/* Search + view toggle row */}
      <motion.div variants={fadeInDown} initial="hidden" animate="visible" className="space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search activities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
          {/* View toggle */}
          <div className="flex glass rounded-xl p-1 gap-0.5">
            {VIEW_TABS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setView(value)}
                title={label}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  view === value
                    ? 'text-amber-400 bg-amber-400/10'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date preset chips */}
        {view !== 'stats' && (
          <div className="flex gap-2 flex-wrap items-center">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePreset(preset)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all capitalize',
                  activePreset === preset
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    : 'glass text-text-secondary hover:text-text-primary'
                )}
              >
                {preset === 'all' ? 'All Time'
                  : preset === 'week' ? 'This Week'
                  : preset === 'month' ? 'This Month'
                  : preset === 'year' ? 'This Year'
                  : 'Today'}
              </button>
            ))}
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setActivePreset('all'); setDateFrom(null); setDateTo(null) }}
                className="text-xs text-text-muted hover:text-error transition-colors"
              >
                × Clear
              </button>
            )}
          </div>
        )}

        {/* Category chips */}
        {view !== 'stats' && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['All', ...LOG_CATEGORIES].map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-amber-500 text-bg-surface font-semibold'
                      : 'glass text-text-secondary hover:text-text-primary hover:border-white/20'
                  )}
                >
                  {cat !== 'All' && (() => {
                    const Icon = CATEGORY_ICONS[cat] ?? Box
                    return <Icon size={11} style={{ color: isActive ? 'inherit' : CATEGORY_COLORS[cat] }} />
                  })()}
                  {cat}
                </button>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 glass rounded-xl animate-pulse" />
            ))}
          </motion.div>
        ) : view === 'stats' ? (
          <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <StatsCharts data={stats} isLoading={statsLoading} />
          </motion.div>
        ) : logs.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex justify-center pt-10"
          >
            <GlassCard accent="amber" className="p-12 text-center max-w-sm w-full">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.08))' }}
              >
                <BookOpen size={28} className="text-module-logs" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">Nothing logged yet</h2>
              <p className="text-sm text-text-secondary mb-4">
                Start tracking your activities to see them here.
              </p>
              <Button
                onClick={() => setIsAddOpen(true)}
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
              >
                + Log Activity
              </Button>
            </GlassCard>
          </motion.div>
        ) : view === 'timeline' ? (
          <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Timeline
              logs={logs}
              onEdit={(l) => { setEditingLog(l); setIsAddOpen(true) }}
              onDelete={handleDelete}
            />
          </motion.div>
        ) : view === 'grid' ? (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {logs.map((log) => (
              <GlassCard key={log.id} accent="amber" hover className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-text-primary text-sm">{log.title}</h4>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0"
                    style={{
                      color: CATEGORY_COLORS[log.category] ?? '#64748b',
                      background: `${CATEGORY_COLORS[log.category] ?? '#64748b'}15`,
                      borderColor: `${CATEGORY_COLORS[log.category] ?? '#64748b'}30`,
                    }}
                  >
                    {log.category}
                  </span>
                </div>
                {log.notes && (
                  <p className="text-xs text-text-muted line-clamp-2 mb-2">{log.notes}</p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  <p className="text-[10px] text-text-disabled">
                    {new Date(log.completed_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setEditingLog(log); setIsAddOpen(true) }}
                      className="text-[10px] text-text-muted hover:text-text-primary px-2 py-0.5 glass rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="text-[10px] text-error hover:bg-error/10 px-2 py-0.5 rounded-lg"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        ) : (
          /* List view */
          <motion.div
            key="list"
            className="divide-y divide-white/[0.04] glass rounded-xl overflow-hidden"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {logs.map((log) => (
              <div
                key={log.id}
                className="group flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
              >
                {(() => {
                  const Icon = CATEGORY_ICONS[log.category] ?? Box
                  const color = CATEGORY_COLORS[log.category] ?? '#64748b'
                  return <Icon size={14} style={{ color }} className="shrink-0" />
                })()}
                <span className="flex-1 text-sm text-text-primary truncate">{log.title}</span>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0"
                  style={{
                    color: CATEGORY_COLORS[log.category] ?? '#64748b',
                    background: `${CATEGORY_COLORS[log.category] ?? '#64748b'}15`,
                    borderColor: `${CATEGORY_COLORS[log.category] ?? '#64748b'}30`,
                  }}
                >
                  {log.category}
                </span>
                <span className="text-[10px] text-text-disabled shrink-0">
                  {new Date(log.completed_at).toLocaleDateString()}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingLog(log); setIsAddOpen(true) }}
                    className="text-[10px] text-text-muted hover:text-text-primary px-2 py-0.5 glass rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-[10px] text-error hover:bg-error/10 px-2 py-0.5 rounded"
                  >
                    Del
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AddLogModal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); setEditingLog(null) }}
        onSave={handleSave}
        initialData={editingLog}
      />
    </div>
  )
}
