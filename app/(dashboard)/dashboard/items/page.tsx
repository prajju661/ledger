import { createClient } from '@/lib/supabase/server'
import { PageTransition } from '@/components/layout/PageTransition'
import { ItemsPageClient } from '@/components/items/ItemsPageClient'
import type { Item } from '@/types'

export default async function ItemsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let initialItems: Item[] = []

  if (user) {
    const { data } = await supabase
      .from('items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    initialItems = data ?? []
  }

  return (
    <PageTransition>
      <ItemsPageClient initialItems={initialItems} />
    </PageTransition>
  )
}
