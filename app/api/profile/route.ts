import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/profile — fetch the current user's profile
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { profile }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}

// PUT /api/profile — update name and/or avatar_url
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ data: null, error: 'Unauthorized.' }, { status: 401 })
    }

    const body: unknown = await request.json()

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ data: null, error: 'Invalid request body.' }, { status: 400 })
    }

    const updates = body as { name?: string; avatar_url?: string | null }

    // Validate name if provided
    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return NextResponse.json({ data: null, error: 'Name cannot be empty.' }, { status: 400 })
      }
      if (updates.name.trim().length > 100) {
        return NextResponse.json({ data: null, error: 'Name too long (max 100 chars).' }, { status: 400 })
      }
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (updates.name !== undefined) updatePayload.name = updates.name.trim()
    if ('avatar_url' in updates) updatePayload.avatar_url = updates.avatar_url

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: { profile }, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Internal server error.' }, { status: 500 })
  }
}
