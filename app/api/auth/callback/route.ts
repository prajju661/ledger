import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles the OAuth callback (Google) and magic link redirects.
 * Exchanges the code for a session and redirects the user.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Ensure we only redirect to relative paths to prevent open redirect
      const safeNext = next.startsWith('/') ? next : '/dashboard'
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // Redirect to login with error on failure
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
