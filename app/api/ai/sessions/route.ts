import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    // Get first user message per session (for preview), ordered by newest session first
    const { data: rows, error } = await supabase
      .from('chats')
      .select('session_id, message, created_at')
      .eq('user_id', user.id)
      .eq('role', 'user')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    // Group by session_id — keep only first message per session, then sort sessions newest first
    const sessionMap = new Map<string, { session_id: string; preview: string; updated_at: string }>()

    for (const row of rows ?? []) {
      if (!sessionMap.has(row.session_id)) {
        sessionMap.set(row.session_id, {
          session_id: row.session_id,
          preview:    row.message.slice(0, 60),
          updated_at: row.created_at,
        })
      } else {
        // Update the latest timestamp for this session
        const existing = sessionMap.get(row.session_id)!
        if (row.created_at > existing.updated_at) {
          existing.updated_at = row.created_at
        }
      }
    }

    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, 20)

    return NextResponse.json({ data: { sessions }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
