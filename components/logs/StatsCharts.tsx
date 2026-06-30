'use client'

import { useEffect, useState, useRef } from 'react'
import {
  BarChart, Bar, XAxis, Cell, Tooltip, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'

interface ByMonth   { month: string; count: number }
interface ByCategory { category: string; count: number }
interface HeatCell  { date: string; count: number }
interface Summary   { total: number; mostActiveMonth: string; topCategory: string | null; longestStreak: number }

interface StatsData {
  byMonth:    ByMonth[]
  byCategory: ByCategory[]
  heatmap:    HeatCell[]
  summary:    Summary
}

// ── Color helpers ──────────────────────────────────────────────────────────────

const PIE_COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ef4444', '#06b6d4', '#a855f7', '#f97316']

function heatmapColor(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.04)'
  if (count === 1) return '#78350f'
  if (count <= 3) return '#b45309'
  return '#f59e0b'
}

// ── Custom tooltip ─────────────────────────────────────────────────────────────

interface TooltipPayload { value?: number }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayload[]; label?: string }

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg px-3 py-2 text-sm"
      style={{
        background: 'rgba(15,15,26,0.9)',
        border: '1px solid rgba(245,158,11,0.3)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <p className="font-medium" style={{ color: '#f59e0b' }}>{label}</p>
      <p className="text-text-secondary">{payload[0]?.value} activities</p>
    </div>
  )
}

// ── Count-up hook ──────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (target === 0) { setValue(0); return }
    /* eslint-enable react-hooks/set-state-in-effect */
    const start = performance.now()
    function step(now: number) {
      const t = Math.min((now - start) / duration, 1)
      setValue(Math.round(t * target))
      if (t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return value
}

// ── Summary card ───────────────────────────────────────────────────────────────

function SummaryCard({ label, value, isText = false }: { label: string; value: number | string; isText?: boolean }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)

  return (
    <GlassCard accent="amber" className="p-4 text-center">
      <p className="text-2xl font-bold text-amber-400">
        {isText ? value : animated}
      </p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </GlassCard>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface StatsChartsProps {
  data: StatsData | null
  isLoading?: boolean
}

export function StatsCharts({ data, isLoading }: StatsChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-40 glass rounded-2xl animate-pulse" />)}
      </div>
    )
  }
  if (!data) return null

  const { byMonth, byCategory, heatmap, summary } = data

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Logged"       value={summary.total} />
        <SummaryCard label="Most Active Month"  value={summary.mostActiveMonth ?? 'N/A'} isText />
        <SummaryCard label="Top Category"       value={summary.topCategory ?? 'N/A'} isText />
        <SummaryCard label="Longest Streak"     value={summary.longestStreak} />
      </div>

      {/* Bar chart */}
      <GlassCard accent="amber" className="p-5">
        <h3 className="text-sm font-semibold text-text-secondary mb-4">Activities Per Month</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byMonth} barCategoryGap="30%">
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => v.split(' ')[0]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,158,11,0.05)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive>
              {byMonth.map((_, i) => (
                <Cell key={i} fill={i === byMonth.length - 1 ? '#f59e0b' : 'rgba(245,158,11,0.45)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Pie + Heatmap row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Donut chart */}
        <GlassCard accent="amber" className="p-5">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">By Category</h3>
          {byCategory.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    isAnimationActive
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div
                          className="rounded-lg px-3 py-2 text-xs"
                          style={{
                            background:    'rgba(15,15,26,0.9)',
                            border:        '1px solid rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(16px)',
                          }}
                        >
                          <span className="text-text-primary font-medium">{payload[0]?.name}</span>
                          <span className="text-text-secondary ml-2">{payload[0]?.value}</span>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-2">
                {byCategory.slice(0, 6).map((item, i) => (
                  <span
                    key={item.category}
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                    style={{
                      color: PIE_COLORS[i % PIE_COLORS.length],
                      background: `${PIE_COLORS[i % PIE_COLORS.length]}15`,
                      borderColor: `${PIE_COLORS[i % PIE_COLORS.length]}30`,
                    }}
                  >
                    {item.category} {item.count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted text-center py-12">No data</p>
          )}
        </GlassCard>

        {/* Activity heatmap */}
        <GlassCard accent="amber" className="p-5">
          <h3 className="text-sm font-semibold text-text-secondary mb-4">Activity Heatmap (12 weeks)</h3>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}
          >
            {heatmap.map((cell, i) => (
              <div
                key={i}
                className="w-full aspect-square rounded-[2px] cursor-default"
                style={{ background: heatmapColor(cell.count) }}
                title={`${cell.count} activit${cell.count === 1 ? 'y' : 'ies'} on ${cell.date}`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 text-[10px] text-text-muted">
            <span>Less</span>
            {[0, 1, 2, 4].map((v) => (
              <div
                key={v}
                className="w-3 h-3 rounded-sm"
                style={{ background: heatmapColor(v) }}
              />
            ))}
            <span>More</span>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
