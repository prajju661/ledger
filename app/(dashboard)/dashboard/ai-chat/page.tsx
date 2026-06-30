import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AiChatPageClient } from '@/components/ai/AiChatPageClient'

export const metadata = {
  title: 'LifeGuide AI – LifeLedger AI',
}

interface SearchParams {
  message?: string
}

export default async function AiChatPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, avatar_url')
    .eq('id', user.id)
    .single()

  // Fetch sessions for sidebar
  const { data: chatRows } = await supabase
    .from('chats')
    .select('session_id, message, created_at')
    .eq('user_id', user.id)
    .eq('role', 'user')
    .order('created_at', { ascending: true })

  // Group into sessions (dedup by session_id, pick first message as preview)
  const sessionMap = new Map<string, { session_id: string; preview: string; updated_at: string }>()
  for (const row of chatRows ?? []) {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, {
        session_id: row.session_id,
        preview:    row.message.slice(0, 60),
        updated_at: row.created_at,
      })
    } else {
      const s = sessionMap.get(row.session_id)!
      if (row.created_at > s.updated_at) s.updated_at = row.created_at
    }
  }
  const sessions = Array.from(sessionMap.values())
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 20)

  const params = await searchParams
  const initialMessage = params.message ?? null
  const userName = profile?.name ?? user.email?.split('@')[0] ?? 'User'

  return (
    <AiChatPageClient
      sessions={sessions}
      userName={userName}
      initialMessage={initialMessage}
    />
  )
}
