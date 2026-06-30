import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { APP_URL } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()

    if (
      typeof body !== 'object' ||
      body === null ||
      !('email' in body)
    ) {
      // Always return success for security — never reveal if email exists
      return NextResponse.json({
        data: { message: "If this email exists, a reset link has been sent." },
        error: null,
      })
    }

    const { email } = body as { email: string }

    if (typeof email === 'string' && email.trim()) {
      const supabase = await createClient()
      // Intentionally not checking the error — always return the same response
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${APP_URL}/reset-password`,
      })
    }

    return NextResponse.json({
      data: { message: "If this email exists, a reset link has been sent." },
      error: null,
    })
  } catch {
    return NextResponse.json(
      { data: null, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
