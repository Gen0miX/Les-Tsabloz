// app/api/admin/ical-url/route.ts
import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/supabase/auth-client'

export async function GET() {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL!.trim()
  const token = process.env.ICAL_SECRET!.trim()
  return NextResponse.json({ url: `${base}/api/ical?token=${encodeURIComponent(token)}` })
}
