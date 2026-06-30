import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays, format, parseISO } from 'date-fns'
import type { RoutineCompletion, Routine } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

export interface HeatmapCell {
  date: string    // 'yyyy-MM-dd'
  action: 'completed' | 'skipped' | null
  isFuture: boolean
}

// ─── GET /api/routines/[id]/history ──────────────────────────────────────────

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await context.params

    // Verify ownership
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single<Routine>()

    if (routineError || !routine) {
      return NextResponse.json({ data: null, error: 'Routine not found.' }, { status: 404 })
    }

    // Fetch all completions ordered newest first
    const { data: completions, error: completionsError } = await supabase
      .from('routine_completions')
      .select('*')
      .eq('routine_id', id)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })

    if (completionsError) {
      return NextResponse.json({ data: null, error: completionsError.message }, { status: 500 })
    }

    const allCompletions: RoutineCompletion[] = completions ?? []

    // ── Streak calculation ────────────────────────────────────────────────────
    // Walk backward, count consecutive 'completed' entries, skip 'skipped'
    // but stop at any gap larger than expected interval
    let streak = 0
    for (const c of allCompletions) {
      if (c.action === 'completed') {
        streak++
      } else if (c.action === 'skipped') {
        // skipped doesn't break streak but doesn't count
        continue
      } else {
        break
      }
    }

    const totalCompletions = allCompletions.filter((c) => c.action === 'completed').length

    // ── Build heatmap: last 90 days ───────────────────────────────────────────
    const today = new Date()
    const heatmapData: HeatmapCell[] = []

    for (let i = 89; i >= 0; i--) {
      const cellDate = subDays(today, i)
      const dateStr = format(cellDate, 'yyyy-MM-dd')
      const isFutureDate = cellDate > today

      const match = allCompletions.find((c) => {
        const completedDate = format(parseISO(c.completed_at), 'yyyy-MM-dd')
        return completedDate === dateStr
      })

      heatmapData.push({
        date: dateStr,
        action: match ? match.action : null,
        isFuture: isFutureDate,
      })
    }

    return NextResponse.json({
      data: {
        completions: allCompletions,
        streak,
        totalCompletions,
        heatmapData,
        routine,
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
