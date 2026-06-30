import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFuture, parseISO } from 'date-fns'
import type { ActivityLog } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ─── PUT /api/logs/[id] ───────────────────────────────────────────────────────

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json() as Record<string, unknown>

    if (body.title !== undefined && !String(body.title).trim()) {
      return NextResponse.json({ data: null, error: 'Title cannot be empty.' }, { status: 400 })
    }

    if (body.completed_at) {
      const date = parseISO(body.completed_at as string)
      if (isFuture(date)) {
        return NextResponse.json(
          { data: null, error: 'Cannot log activities in the future.' },
          { status: 400 }
        )
      }
    }

    const updates: Partial<ActivityLog> & { updated_at?: string } = {}
    if (body.title    !== undefined) updates.title        = String(body.title).trim()
    if (body.category !== undefined) updates.category     = String(body.category)
    if (body.notes    !== undefined) updates.notes        = body.notes ? String(body.notes).trim() : null
    if (body.completed_at !== undefined) updates.completed_at = body.completed_at as string

    const { data: log, error } = await supabase
      .from('activity_logs')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single<ActivityLog>()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }
    if (!log) {
      return NextResponse.json({ data: null, error: 'Log not found.' }, { status: 404 })
    }

    return NextResponse.json({ data: { log }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── DELETE /api/logs/[id] ────────────────────────────────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await context.params

    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
