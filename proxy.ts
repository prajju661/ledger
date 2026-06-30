import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Route protection middleware.
 * - Refreshes the Supabase session on every request
 * - Protected routes (/dashboard/*): redirect unauthenticated users to /login
 * - Auth routes (/login, /register, /forgot-password): redirect authenticated users to /dashboard
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh the session — must not write any logic between createServerClient
  // and getUser(), or sessions may not refresh correctly.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // If user is NOT authenticated and tries to access a protected route
  if (!user && pathname.startsWith('/dashboard')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user IS authenticated and tries to access auth pages
  const authPages = ['/login', '/register', '/forgot-password']
  if (user && authPages.includes(pathname)) {
    const next = request.nextUrl.searchParams.get('next') ?? '/dashboard'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = next
    redirectUrl.search = ''
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     * - api routes (handled per-route)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
