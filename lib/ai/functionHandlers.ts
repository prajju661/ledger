import { searchItems, addItemFromAI }               from '@/lib/ai/functions/items'
import { createRoutineFromAI, getPendingRoutines }  from '@/lib/ai/functions/routines'
import { searchActivityHistory }                    from '@/lib/ai/functions/logs'
import type { CreateRoutineInput } from '@/types'

/**
 * Dispatches a tool call to the appropriate function handler.
 * All functions are server-side and access Supabase directly.
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  switch (toolName) {
    case 'find_item':
      return searchItems(userId, args.query as string)

    case 'add_item':
      return addItemFromAI(userId, {
        name:     args.name     as string,
        location: args.location as string,
        category: args.category as string | undefined,
        notes:    args.notes    as string | undefined,
      })

    case 'create_routine':
      return createRoutineFromAI(userId, {
        title:         args.title         as string,
        frequency:     args.frequency     as CreateRoutineInput['frequency'],
        interval:      args.interval      as number | undefined,
        interval_unit: args.interval_unit as CreateRoutineInput['interval_unit'],
        next_due:      args.next_due      as string,
        notes:         args.notes         as string | undefined,
      })

    case 'check_history':
      return searchActivityHistory(
        userId,
        args.query       as string,
        args.time_filter as string | undefined,
      )

    case 'get_pending_routines':
      return getPendingRoutines(userId, args.filter as 'all' | 'today' | 'week' | 'overdue')

    default:
      throw new Error(`Unknown tool: ${toolName}`)
  }
}
