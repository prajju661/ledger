import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication first
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: 'Unauthorized.' },
        { status: 401 }
      )
    }

    const body: unknown = await request.json()

    if (
      typeof body !== 'object' ||
      body === null ||
      !('newPassword' in body)
    ) {
      return NextResponse.json(
        { data: null, error: 'newPassword is required.' },
        { status: 400 }
      )
    }

    const { newPassword } = body as { newPassword: string }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { data: null, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data: { success: true }, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
