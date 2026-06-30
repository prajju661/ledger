import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/layout/PageTransition'
import { RoutinesPageClient } from '@/components/routines/RoutinesPageClient'
import type { Routine } from '@/types'

export const metadata = {
  title: 'Repeat – LifeLedger AI',
}

export default async function RoutinesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialRoutines: Routine[] = []

  if (user) {
    const { data } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('next_due', { ascending: true })
      .limit(100)
    initialRoutines = data ?? []
  }

  return (
    <PageTransition>
      <RoutinesPageClient initialRoutines={initialRoutines} />
    </PageTransition>
  )
}
