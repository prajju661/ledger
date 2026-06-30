import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, startOfMonth, subDays } from 'date-fns'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const today     = new Date()
    const todayStr  = format(today, 'yyyy-MM-dd')
    const monthStart = startOfMonth(today).toISOString()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()

    // ── 4 counts in parallel ───────────────────────────────────────────────────
    const [itemsRes, routinesRes, logsRes, chatsRes] = await Promise.all([
      supabase
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),

      supabase
        .from('routines')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lte('next_due', todayStr),

      supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', monthStart),

      supabase
        .from('chats')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user')
        .gte('created_at', todayStart),
    ])

    // ── 7-day sparkline data per metric ───────────────────────────────────────
    const [sparkItems, sparkLogs] = await Promise.all([
      // Items added per day (last 7 days)
      supabase
        .from('items')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', subDays(today, 7).toISOString()),

      // Logs per day (last 7 days)
      supabase
        .from('activity_logs')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', subDays(today, 7).toISOString()),
    ])

    const days7 = Array.from({ length: 7 }, (_, i) =>
      format(subDays(today, 6 - i), 'yyyy-MM-dd')
    )

    function countPerDay(rows: { created_at?: string; completed_at?: string }[], field: 'created_at' | 'completed_at') {
      return days7.map((d) =>
        (rows ?? []).filter((r) => r[field]?.startsWith(d)).length
      )
    }

    const itemsSparkline    = countPerDay(sparkItems.data ?? [], 'created_at')
    const logsSparkline     = countPerDay(sparkLogs.data ?? [], 'completed_at')
    // Routines and AI chats sparklines — use flat arrays of 0s for now (not cost-effective to compute daily)
    const routinesSparkline = days7.map(() => 0)
    const aiSparkline       = days7.map(() => 0)

    return NextResponse.json({
      data: {
        totalItems:           itemsRes.count   ?? 0,
        pendingRoutines:      routinesRes.count ?? 0,
        activitiesThisMonth:  logsRes.count    ?? 0,
        aiChatsToday:         chatsRes.count   ?? 0,
        sparklines: {
          items:    itemsSparkline,
          routines: routinesSparkline,
          logs:     logsSparkline,
          ai:       aiSparkline,
        },
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
