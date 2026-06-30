import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format, addDays } from 'date-fns'
import type { Routine, CreateRoutineInput } from '@/types'

// ─── GET /api/routines ────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') ?? 'all'
    const limit  = Math.min(parseInt(searchParams.get('limit')  ?? '100'), 200)
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const today = format(new Date(), 'yyyy-MM-dd')
    const weekEnd = format(addDays(new Date(), 7), 'yyyy-MM-dd')

    let query = supabase
      .from('routines')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (filter === 'today') {
      query = query.eq('next_due', today)
    } else if (filter === 'week') {
      query = query.gte('next_due', today).lte('next_due', weekEnd)
    } else if (filter === 'overdue') {
      query = query.lt('next_due', today)
    }
    // 'all' → no date filter

    const { data: routines, error, count } = await query
      .order('next_due', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { routines: routines ?? [], total: count ?? 0 }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── POST /api/routines ───────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json() as CreateRoutineInput & Record<string, unknown>

    const { title, frequency, next_due, interval, interval_unit, reminder_time, notes } = body

    if (!title?.toString().trim()) {
      return NextResponse.json({ data: null, error: 'Title is required.' }, { status: 400 })
    }
    if (!frequency) {
      return NextResponse.json({ data: null, error: 'Frequency is required.' }, { status: 400 })
    }
    if (!next_due) {
      return NextResponse.json({ data: null, error: 'Next due date is required.' }, { status: 400 })
    }

    const { data: routine, error } = await supabase
      .from('routines')
      .insert({
        user_id:       user.id,
        title:         title.toString().trim(),
        frequency,
        interval:      interval ?? 1,
        interval_unit: interval_unit ?? null,
        next_due,
        reminder_time: reminder_time ?? null,
        notes:         notes?.toString().trim() || null,
        is_active:     true,
      })
      .select()
      .single<Routine>()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { routine }, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
