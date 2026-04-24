import type { Booking } from '@/types/booking'

function formatDate(dateStr: string): string {
  return dateStr.replace(/-/g, '')
}

function toVEvent(booking: Booking): string {
  return [
    'BEGIN:VEVENT',
    `UID:${booking.ical_uid}@les-tsabloz`,
    `DTSTART;VALUE=DATE:${formatDate(booking.start_date)}`,
    `DTEND;VALUE=DATE:${formatDate(booking.end_date)}`,
    `SUMMARY:${booking.name}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
  ].join('\r\n')
}

function wrapCalendar(events: string[]): string {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Les Tsabloz//Cabin Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n') + '\r\n'
}

export function generateICSFeed(bookings: Booking[]): string {
  return wrapCalendar(bookings.map(toVEvent))
}

export function generateICSEvent(booking: Booking): string {
  return wrapCalendar([toVEvent(booking)])
}
