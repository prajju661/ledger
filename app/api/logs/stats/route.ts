import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const today = new Date()

    // ── Fetch all logs for stats ───────────────────────────────────────────────
    // We fetch 84 days back (heatmap) + all for month/category stats
    const eightMonthsAgo = format(subMonths(today, 8), 'yyyy-MM-dd')
    const { data: allLogs, error: logsError } = await supabase
      .from('activity_logs')
      .select('id, category, completed_at, title')
      .eq('user_id', user.id)
      .gte('completed_at', eightMonthsAgo)
      .order('completed_at', { ascending: true })

    if (logsError) {
      return NextResponse.json({ data: null, error: logsError.message }, { status: 500 })
    }

    const logs = allLogs ?? []

    // ── By month (last 6 months) ──────────────────────────────────────────────
    const monthBuckets: Array<{ month: string; count: number }> = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd   = endOfMonth(monthDate)
      const count = logs.filter((l) => {
        const d = new Date(l.completed_at)
        return d >= monthStart && d <= monthEnd
      }).length
      monthBuckets.push({
        month: format(monthDate, 'MMM yyyy'),
        count,
      })
    }

    // ── By category ───────────────────────────────────────────────────────────
    const catMap: Record<string, number> = {}
    for (const l of logs) {
      catMap[l.category] = (catMap[l.category] ?? 0) + 1
    }
    const byCategory = Object.entries(catMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // ── Heatmap: last 84 days ─────────────────────────────────────────────────
    const heatmapData: Array<{ date: string; count: number }> = []
    for (let i = 83; i >= 0; i--) {
      const cellDate = subDays(today, i)
      const dateStr = format(cellDate, 'yyyy-MM-dd')
      const count = logs.filter((l) => {
        return format(new Date(l.completed_at), 'yyyy-MM-dd') === dateStr
      }).length
      heatmapData.push({ date: dateStr, count })
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    const total = logs.length
    const topCategory = byCategory[0]?.category ?? null

    // Most active month
    const mostActiveMonth =
      monthBuckets.reduce((best, m) => (m.count > best.count ? m : best), { month: 'N/A', count: 0 }).month

    // Longest streak (consecutive days with at least 1 log)
    let longestStreak = 0
    let currentStreak = 0
    const allDates = new Set(logs.map((l) => format(new Date(l.completed_at), 'yyyy-MM-dd')))
    for (let i = 83; i >= 0; i--) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd')
      if (allDates.has(dateStr)) {
        currentStreak++
        if (currentStreak > longestStreak) longestStreak = currentStreak
      } else {
        currentStreak = 0
      }
    }

    return NextResponse.json({
      data: {
        byMonth:    monthBuckets,
        byCategory,
        heatmap:    heatmapData,
        summary: {
          total,
          mostActiveMonth,
          topCategory,
          longestStreak,
        },
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
