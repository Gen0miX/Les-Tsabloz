import { createServiceClient } from '@/lib/supabase/server'
import { generateICSFeed } from '@/lib/ical'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')

  if (!token || token !== process.env.ICAL_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'approved')
    .order('start_date')

  if (error) {
    return new Response('Internal error', { status: 500 })
  }

  const ics = generateICSFeed(data)

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
    },
  })
}
