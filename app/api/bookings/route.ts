import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendBookingNotification } from '@/lib/email'
import type { CreateBookingPayload } from '@/types/booking'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('id, start_date, end_date, name, status')
    .eq('status', 'approved')
    .order('start_date')

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }

  return NextResponse.json({ bookings: data })
}

export async function POST(request: Request) {
  const body: CreateBookingPayload = await request.json()

  if (!body.name || !body.email || !body.start_date || !body.end_date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (body.start_date >= body.end_date) {
    return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      name: body.name,
      email: body.email,
      start_date: body.start_date,
      end_date: body.end_date,
      message: body.message ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Booking insert error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }

  // Non-blocking — don't fail the request if email fails
  sendBookingNotification(data).catch((err) =>
    console.error('Email notification failed:', err)
  )

  return NextResponse.json({ booking: data }, { status: 201 })
}
