import { createClient } from '@/lib/supabase/server'
import { subDays, subMonths } from 'date-fns'
import type { ActivityLog } from '@/types'

interface SearchResult {
  found: boolean
  logs: ActivityLog[]
  lastOccurrence?: ActivityLog
}

/**
 * Search activity history for the current user.
 * Called by the AI when intent is 'check_history'.
 *
 * @param userId    - The authenticated user's ID
 * @param query     - Search term (matches title + notes)
 * @param timeFilter - 'week', 'month', 'year', or undefined for all time
 */
export async function searchActivityHistory(
  userId: string,
  query: string,
  timeFilter?: string
): Promise<SearchResult> {
  const supabase = await createClient()
  const now = new Date()

  let dbQuery = supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)

  // Apply search term
  if (query.trim()) {
    dbQuery = dbQuery.or(
      `title.ilike.%${query}%,notes.ilike.%${query}%`
    )
  }

  // Apply time filter
  if (timeFilter === 'week') {
    dbQuery = dbQuery.gte('completed_at', subDays(now, 7).toISOString())
  } else if (timeFilter === 'month') {
    dbQuery = dbQuery.gte('completed_at', subMonths(now, 1).toISOString())
  } else if (timeFilter === 'year') {
    dbQuery = dbQuery.gte('completed_at', subMonths(now, 12).toISOString())
  }

  const { data, error } = await dbQuery
    .order('completed_at', { ascending: false })
    .limit(10)

  if (error || !data || data.length === 0) {
    return { found: false, logs: [] }
  }

  return {
    found: true,
    logs: data,
    lastOccurrence: data[0],
  }
}
