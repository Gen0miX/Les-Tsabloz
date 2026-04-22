import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signGuestToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Password required' }, { status: 400 })
  }

  const hash = process.env.SITE_PASSWORD!
  const valid = await bcrypt.compare(password, hash)

  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await signGuestToken()
  const response = NextResponse.json({ ok: true })

  response.cookies.set('guest_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
