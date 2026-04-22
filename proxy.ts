import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']

function guestSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.COOKIE_SECRET!)
}

async function isGuestAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('guest_session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, guestSecret())
    return true
  } catch {
    return false
  }
}

async function getAdminUser(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const response = NextResponse.next()

    // /admin/login is behind the guest password wall but not the admin auth wall
    if (pathname === '/admin/login') {
      const guestOk = await isGuestAuthenticated(request)
      if (!guestOk) return NextResponse.redirect(new URL('/login', request.url))
      return response
    }

    const user = await getAdminUser(request, response)
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return response
  }

  const guestOk = await isGuestAuthenticated(request)
  if (!guestOk) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
