import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: 500 }
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
