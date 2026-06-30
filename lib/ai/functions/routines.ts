import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { calculateNextDue } from '@/lib/utils'
import type { Routine, CreateRoutineInput } from '@/types'

/**
 * Create a new routine from an AI conversation.
 * Called by the AI when intent is 'create_routine'.
 */
export async function createRoutineFromAI(
  userId: string,
  params: CreateRoutineInput
): Promise<Routine | null> {
  const supabase = await createClient()

  const nextDueDate = calculateNextDue(
    params.frequency,
    params.interval ?? 1,
    params.interval_unit ?? 'days'
  )
  const next_due = params.next_due ?? format(nextDueDate, 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('routines')
    .insert({
      user_id:       userId,
      title:         params.title,
      frequency:     params.frequency,
      interval:      params.interval ?? 1,
      interval_unit: params.interval_unit ?? null,
      next_due,
      reminder_time: params.reminder_time ?? null,
      notes:         params.notes ?? null,
      is_active:     true,
    })
    .select()
    .single<Routine>()

  if (error) return null
  return data
}

/**
 * Get pending/upcoming routines for the current user.
 * Called by the AI when intent is 'get_pending_routines'.
 */
export async function getPendingRoutines(
  userId: string,
  filter: 'all' | 'today' | 'week' | 'overdue' = 'all'
): Promise<Routine[]> {
  const supabase = await createClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  let query = supabase
    .from('routines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)

  if (filter === 'today') {
    query = query.eq('next_due', today)
  } else if (filter === 'overdue') {
    query = query.lt('next_due', today)
  } else if (filter === 'week') {
    const weekEnd = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    query = query.gte('next_due', today).lte('next_due', weekEnd)
  }

  const { data, error } = await query
    .order('next_due', { ascending: true })
    .limit(10)

  if (error) return []
  return data ?? []
}
