import { createClient } from '@supabase/supabase-js'

/**
 * Admin client with the service role key.
 * ONLY use this in server-side code (API routes, Server Actions).
 * It bypasses Row Level Security — never expose to the client.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
