import { describe, it, expect, vi } from 'vitest'
import { render } from '@react-email/render'
import React from 'react'
import { ConfirmationEmail, AdminNotificationEmail } from '@/lib/email'
import type { Booking } from '@/types/booking'

// Mock Resend module to prevent API key requirement during tests
vi.mock('resend', () => {
  const mockResend = class {
    emails = {
      send: vi.fn().mockResolvedValue({ id: 'mocked' }),
    }
  }
  return { Resend: mockResend }
})

const booking: Booking = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Marie Dupont',
  email: 'marie@example.com',
  start_date: '2026-07-12',
  end_date: '2026-07-19',
  message: 'Nous serons deux adultes et un enfant.',
  status: 'approved',
  ical_uid: 'abc-def-123',
  created_at: '2026-04-22T10:00:00Z',
}

const bookingNoMessage: Booking = { ...booking, message: null }

describe('ConfirmationEmail', () => {
  it('contient le prénom du destinataire', async () => {
    const html = await render(React.createElement(ConfirmationEmail, { booking }))
    expect(html).toContain('Marie')
  })

  it("contient les dates d'arrivée et de départ", async () => {
    const html = await render(React.createElement(ConfirmationEmail, { booking }))
    expect(html).toContain('2026-07-12')
    expect(html).toContain('2026-07-19')
  })

  it('contient la référence de réservation (8 premiers chars de id)', async () => {
    const html = await render(React.createElement(ConfirmationEmail, { booking }))
    expect(html).toContain('#TSB-a1b2c3d4')
  })

  it('contient un lien vers le calendrier', async () => {
    const html = await render(React.createElement(ConfirmationEmail, { booking }))
    expect(html).toContain('http://localhost:3000/api/bookings/a1b2c3d4-e5f6-7890-abcd-ef1234567890/ical')
  })
})

describe('AdminNotificationEmail', () => {
  const adminUrl = 'http://localhost:3000/admin'

  it('contient le nom du demandeur', async () => {
    const html = await render(React.createElement(AdminNotificationEmail, { booking, adminUrl }))
    expect(html).toContain('Marie Dupont')
  })

  it("contient l'email du demandeur", async () => {
    const html = await render(React.createElement(AdminNotificationEmail, { booking, adminUrl }))
    expect(html).toContain('marie@example.com')
  })

  it("contient les dates d'arrivée et de départ", async () => {
    const html = await render(React.createElement(AdminNotificationEmail, { booking, adminUrl }))
    expect(html).toContain('2026-07-12')
    expect(html).toContain('2026-07-19')
  })

  it('affiche le message du client quand il est présent', async () => {
    const html = await render(React.createElement(AdminNotificationEmail, { booking, adminUrl }))
    expect(html).toContain('Nous serons deux adultes et un enfant.')
  })

  it("n'affiche pas de bloc message quand message est null", async () => {
    const html = await render(React.createElement(AdminNotificationEmail, { booking: bookingNoMessage, adminUrl }))
    expect(html).not.toContain('Nous serons deux adultes et un enfant.')
    expect(html).not.toContain('>Message<')
  })

  it("contient le lien vers l'espace admin", async () => {
    const html = await render(React.createElement(AdminNotificationEmail, { booking, adminUrl }))
    expect(html).toContain('http://localhost:3000/admin')
  })
})
