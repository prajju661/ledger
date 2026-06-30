import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/layout/PageTransition'
import { LogsPageClient } from '@/components/logs/LogsPageClient'
import type { ActivityLog } from '@/types'

export const metadata = {
  title: 'LifeLog – LifeLedger AI',
}

interface StatsData {
  byMonth:    { month: string; count: number }[]
  byCategory: { category: string; count: number }[]
  heatmap:    { date: string; count: number }[]
  summary: {
    total: number
    mostActiveMonth: string
    topCategory:     string | null
    longestStreak:   number
  }
}

export default async function LogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialLogs: ActivityLog[] = []
  const initialStats: StatsData | null = null

  if (user) {
    // Fetch initial logs (last 50)
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(50)
    initialLogs = data ?? []
  }

  return (
    <PageTransition>
      <LogsPageClient initialLogs={initialLogs} initialStats={initialStats} />
    </PageTransition>
  )
}
