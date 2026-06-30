import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/layout/PageTransition'
import { DashboardPageClient } from '@/components/dashboard/DashboardPageClient'
import { format, startOfMonth } from 'date-fns'
import type { Routine, ActivityLog } from '@/types'

export const metadata = {
  title: 'Dashboard – LifeLedger AI',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayStr   = format(new Date(), 'yyyy-MM-dd')
  const monthStart = startOfMonth(new Date()).toISOString()
  const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).toISOString()

  // Fetch all data in parallel
  const [
    itemsRes,
    routinesRes,
    logsMonthRes,
    aiChatsRes,
    upcomingRoutinesRes,
    recentLogsRes,
    profileRes,
  ] = await Promise.all([
    supabase.from('items').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('routines').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('is_active', true).lte('next_due', todayStr),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('completed_at', monthStart),
    supabase.from('chats').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('role', 'user').gte('created_at', todayStart),

    // Upcoming routines widget (5 items, sorted by next_due)
    supabase.from('routines').select('*')
      .eq('user_id', user.id).eq('is_active', true)
      .order('next_due', { ascending: true })
      .limit(5),

    // Recent activity widget (5 items)
    supabase.from('activity_logs').select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(5),

    // User profile
    supabase.from('profiles').select('name').eq('id', user.id).single(),
  ])

  const stats = {
    totalItems:          itemsRes.count           ?? 0,
    pendingRoutines:     routinesRes.count         ?? 0,
    activitiesThisMonth: logsMonthRes.count        ?? 0,
    aiChatsToday:        aiChatsRes.count          ?? 0,
    sparklines: {
      items:    Array(7).fill(0) as number[],
      routines: Array(7).fill(0) as number[],
      logs:     Array(7).fill(0) as number[],
      ai:       Array(7).fill(0) as number[],
    },
  }

  const userName = profileRes.data?.name ?? user.email?.split('@')[0] ?? 'User'

  return (
    <PageTransition>
      <DashboardPageClient
        userName={userName}
        stats={stats}
        routines={(upcomingRoutinesRes.data ?? []) as Routine[]}
        logs={(recentLogsRes.data ?? []) as ActivityLog[]}
      />
    </PageTransition>
  )
}
