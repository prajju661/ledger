import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/layout/PageTransition'
import { SettingsPageClient } from '@/components/settings/SettingsPageClient'
import type { Profile } from '@/types'
import type { ProfileStats } from '@/app/api/profile/stats/route'

export const metadata = {
  title: 'Settings – LifeLedger AI',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile + usage stats in parallel
  const [profileRes, statsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/profile/stats`,
      {
        // Server-to-server call needs the cookie header forwarded.
        // Since this runs on the server, we query directly instead.
        cache: 'no-store',
      }
    ),
  ])

  // Build stats by querying Supabase directly (avoids HTTP round-trip on server)
  const [itemsRes, routinesRes, logsRes, aiMessagesRes, sessionData] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('routines').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('chats').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('role', 'user'),
    supabase.from('chats').select('session_id').eq('user_id', user.id).eq('role', 'user'),
  ])

  const chatSessionsCount = sessionData.data
    ? new Set(sessionData.data.map((r: { session_id: string }) => r.session_id)).size
    : 0

  const profile: Profile = profileRes.data ?? {
    id: user.id,
    name: user.email?.split('@')[0] ?? 'User',
    avatar_url: null,
    created_at: user.created_at,
    updated_at: user.created_at,
  }

  const createdAt = new Date(profile.created_at)
  const accountAgeDays = Math.max(
    Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)),
    1
  )

  const stats: ProfileStats = {
    itemsCount:        itemsRes.count        ?? 0,
    routinesCount:     routinesRes.count      ?? 0,
    logsCount:         logsRes.count          ?? 0,
    chatSessionsCount,
    aiMessagesCount:   aiMessagesRes.count    ?? 0,
    accountAgeDays,
  }

  // Suppress unused variable warning from parallel fetch we replaced
  void statsRes

  return (
    <PageTransition>
      <SettingsPageClient
        profile={profile}
        userEmail={user.email ?? ''}
        stats={stats}
      />
    </PageTransition>
  )
}
