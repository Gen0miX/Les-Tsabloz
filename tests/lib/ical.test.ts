import { describe, it, expect } from 'vitest'
import { generateICSFeed, generateICSEvent } from '@/lib/ical'
import type { Booking } from '@/types/booking'

const booking: Booking = {
  id: '123',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  start_date: '2026-07-01',
  end_date: '2026-07-08',
  message: null,
  status: 'approved',
  ical_uid: 'abc-def-123',
  created_at: '2026-04-22T10:00:00Z',
}

describe('generateICSFeed', () => {
  it('wraps output in VCALENDAR', () => {
    const ics = generateICSFeed([booking])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('END:VCALENDAR')
  })

  it('includes a VEVENT for each booking', () => {
    const ics = generateICSFeed([booking])
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:abc-def-123@les-tsabloz')
    expect(ics).toContain('DTSTART;VALUE=DATE:20260701')
    expect(ics).toContain('DTEND;VALUE=DATE:20260708')
    expect(ics).toContain('SUMMARY:Jean Dupont')
    expect(ics).toContain('END:VEVENT')
  })

  it('returns calendar with no events when passed empty array', () => {
    const ics = generateICSFeed([])
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).not.toContain('BEGIN:VEVENT')
  })

  it('includes all bookings when multiple are passed', () => {
    const b2 = { ...booking, id: '456', name: 'Marie Curie', ical_uid: 'xyz-789' }
    const ics = generateICSFeed([booking, b2])
    expect(ics).toContain('UID:abc-def-123@les-tsabloz')
    expect(ics).toContain('UID:xyz-789@les-tsabloz')
  })
})

describe('generateICSEvent', () => {
  it('wraps a single event in VCALENDAR', () => {
    const ics = generateICSEvent(booking)
    expect(ics).toContain('BEGIN:VCALENDAR')
    expect(ics).toContain('BEGIN:VEVENT')
    expect(ics).toContain('UID:abc-def-123@les-tsabloz')
    expect(ics).toContain('END:VEVENT')
    expect(ics).toContain('END:VCALENDAR')
  })
})
