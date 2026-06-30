import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (
      typeof body !== 'object' ||
      body === null ||
      !('name' in body) ||
      !('email' in body) ||
      !('password' in body)
    ) {
      return NextResponse.json(
        { data: null, error: 'name, email, and password are required.' },
        { status: 400 }
      )
    }

    const { name, email, password } = body as {
      name: string
      email: string
      password: string
    }

    // Validate inputs
    if (typeof name !== 'string' || name.trim().length < 1) {
      return NextResponse.json(
        { data: null, error: 'Name is required.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json(
        { data: null, error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { data: null, error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
      },
    })

    if (error) {
      // Supabase returns a 400-level error for duplicate emails
      if (error.message.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { data: null, error: 'An account with this email already exists.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data, error: null }, { status: 201 })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
