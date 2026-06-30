import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFuture, parseISO } from 'date-fns'
import type { ActivityLog, CreateLogInput } from '@/types'

// ─── GET /api/logs ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search   = searchParams.get('search')   ?? ''
    const category = searchParams.get('category') ?? ''
    const from     = searchParams.get('from')     ?? ''
    const to       = searchParams.get('to')       ?? ''
    const limit    = Math.min(parseInt(searchParams.get('limit')  ?? '100'), 200)
    const offset   = parseInt(searchParams.get('offset') ?? '0')

    let query = supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    if (search) {
      query = query.or(`title.ilike.%${search}%,notes.ilike.%${search}%`)
    }
    if (category && category !== 'All') {
      query = query.eq('category', category)
    }
    if (from) {
      query = query.gte('completed_at', from)
    }
    if (to) {
      query = query.lte('completed_at', to + 'T23:59:59')
    }

    const { data: logs, error, count } = await query
      .order('completed_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { logs: logs ?? [], total: count ?? 0 }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── POST /api/logs ───────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await request.json() as CreateLogInput & Record<string, unknown>
    const { title, category, notes, completed_at } = body

    if (!title?.toString().trim()) {
      return NextResponse.json({ data: null, error: 'Title is required.' }, { status: 400 })
    }
    if (!category?.toString().trim()) {
      return NextResponse.json({ data: null, error: 'Category is required.' }, { status: 400 })
    }

    const completedDate = completed_at
      ? parseISO(completed_at.toString())
      : new Date()

    if (isFuture(completedDate)) {
      return NextResponse.json(
        { data: null, error: 'Cannot log activities in the future.' },
        { status: 400 }
      )
    }

    const { data: log, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id:      user.id,
        title:        title.toString().trim(),
        category:     category.toString().trim(),
        notes:        notes?.toString().trim() || null,
        completed_at: completedDate.toISOString(),
      })
      .select()
      .single<ActivityLog>()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { log }, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
