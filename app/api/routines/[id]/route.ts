import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { calculateNextDue } from '@/lib/utils'
import type { Routine } from '@/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

// ─── PUT /api/routines/[id] ───────────────────────────────────────────────────

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json() as Record<string, unknown>

    // ── Mode 2: complete or skip action ──────────────────────────────────────
    if (body.action === 'complete' || body.action === 'skip') {
      const action = body.action as 'complete' | 'skip'

      // 1. Fetch the routine (verify ownership)
      const { data: routine, error: fetchError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single<Routine>()

      if (fetchError || !routine) {
        return NextResponse.json({ data: null, error: 'Routine not found.' }, { status: 404 })
      }

      // 2. Insert into routine_completions
      const { error: insertError } = await supabase
        .from('routine_completions')
        .insert({
          routine_id:   id,
          user_id:      user.id,
          action,
          completed_at: new Date().toISOString(),
        })

      if (insertError) {
        return NextResponse.json({ data: null, error: insertError.message }, { status: 500 })
      }

      // 3. Calculate new next_due
      const nextDueDate = calculateNextDue(
        routine.frequency,
        routine.interval ?? 1,
        routine.interval_unit ?? 'days'
      )
      const newNextDue = format(nextDueDate, 'yyyy-MM-dd')

      // 4. Update the routine
      const { data: updated, error: updateError } = await supabase
        .from('routines')
        .update({ next_due: newNextDue, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single<Routine>()

      if (updateError) {
        return NextResponse.json({ data: null, error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ data: { routine: updated }, error: null })
    }

    // ── Mode 1: update fields ─────────────────────────────────────────────────
    const allowedFields: (keyof Routine)[] = [
      'title', 'frequency', 'interval', 'interval_unit',
      'next_due', 'reminder_time', 'notes', 'is_active',
    ]
    const updates: Partial<Routine> & { updated_at?: string } = { updated_at: new Date().toISOString() }
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updates as any)[field] = body[field]
      }
    }

    if (updates.title !== undefined && !String(updates.title).trim()) {
      return NextResponse.json({ data: null, error: 'Title cannot be empty.' }, { status: 400 })
    }

    const { data: routine, error } = await supabase
      .from('routines')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single<Routine>()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }
    if (!routine) {
      return NextResponse.json({ data: null, error: 'Routine not found.' }, { status: 404 })
    }

    return NextResponse.json({ data: { routine }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// ─── DELETE /api/routines/[id] ────────────────────────────────────────────────

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await context.params

    const { error } = await supabase
      .from('routines')
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
