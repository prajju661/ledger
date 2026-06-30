import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body) ||
      !('password' in body)
    ) {
      return NextResponse.json(
        { data: null, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const { email, password } = body as { email: string; password: string }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { data: null, error: 'Invalid request body.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      return NextResponse.json(
        { data: null, error: 'Invalid email or password.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ data, error: null })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
