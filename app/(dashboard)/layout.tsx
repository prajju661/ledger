import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from './DashboardShell'

/**
 * Server component — fetches the authenticated user and passes profile
 * data to the client-side shell (Sidebar + TopBar).
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Fetch the user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single()

  // Fallback profile if the DB row isn't ready yet
  const resolvedProfile = profile ?? {
    id: user.id,
    name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
    avatar_url: null,
    created_at: user.created_at,
    updated_at: user.created_at,
  }

  return <DashboardShell user={resolvedProfile}>{children}</DashboardShell>
}
