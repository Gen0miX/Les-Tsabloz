import { createServiceClient } from '@/lib/supabase/server'
import { generateICSEvent } from '@/lib/ical'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return new Response('Not found', { status: 404 })
  }

  const ics = generateICSEvent(data)

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="les-tsabloz-booking.ics"`,
    },
  })
}
