import { createClient } from '@/lib/supabase/server'
import type { Item } from '@/types'

/**
 * Search user's items by name, location, or notes.
 * Called by the AI when intent is 'find_item'.
 */
export async function searchItems(userId: string, query: string): Promise<Item[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .or(
      `name.ilike.%${query}%,location.ilike.%${query}%,notes.ilike.%${query}%`
    )
    .order('updated_at', { ascending: false })
    .limit(5)

  if (error) return []
  return data ?? []
}

/**
 * Add a new item from an AI conversation.
 * Called by the AI when intent is 'add_item'.
 */
export async function addItemFromAI(
  userId: string,
  params: {
    name: string
    location: string
    category?: string
    notes?: string
  }
): Promise<Item | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('items')
    .insert({
      user_id:  userId,
      name:     params.name,
      location: params.location,
      category: params.category ?? 'Other',
      notes:    params.notes ?? null,
    })
    .select()
    .single()

  if (error) return null
  return data
}
