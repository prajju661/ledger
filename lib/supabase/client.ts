import { createBrowserClient } from '@supabase/ssr'

/**
 * Use this in Client Components ('use client').
 * Creates a Supabase client that works in the browser,
 * using the public anon key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
