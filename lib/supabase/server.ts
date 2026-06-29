import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Use this in Server Components, Server Actions, and API Route Handlers.
 * Reads and sets cookies on the server to manage the user session.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll called from a Server Component — cookies can't be set here.
            // If middleware is refreshing sessions, this can safely be ignored.
          }
        },
      },
    }
  )
}
