import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { differenceInDays } from 'date-fns'

export interface ProfileStats {
  itemsCount:        number
  routinesCount:     number
  logsCount:         number
  chatSessionsCount: number
  aiMessagesCount:   number
  accountAgeDays:    number
}

// GET /api/profile/stats — return 6 usage statistics for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    // Run all queries in parallel
    const [
      itemsRes,
      routinesRes,
      logsRes,
      aiMessagesRes,
      profileRes,
    ] = await Promise.all([
      supabase
        .from('items')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('routines')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('activity_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('chats')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('role', 'user'),
      supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single(),
    ])

    // Count distinct session_ids for chat sessions
    const { data: sessionData } = await supabase
      .from('chats')
      .select('session_id')
      .eq('user_id', user.id)
      .eq('role', 'user')

    const chatSessionsCount = sessionData
      ? new Set(sessionData.map((r: { session_id: string }) => r.session_id)).size
      : 0

    const accountAgeDays = profileRes.data?.created_at
      ? differenceInDays(new Date(), new Date(profileRes.data.created_at))
      : 0

    const stats: ProfileStats = {
      itemsCount:        itemsRes.count        ?? 0,
      routinesCount:     routinesRes.count      ?? 0,
      logsCount:         logsRes.count          ?? 0,
      chatSessionsCount,
      aiMessagesCount:   aiMessagesRes.count    ?? 0,
      accountAgeDays:    Math.max(accountAgeDays, 1),
    }

    return NextResponse.json({ data: { stats }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
