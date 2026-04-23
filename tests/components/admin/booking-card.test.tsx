// tests/components/admin/booking-card.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BookingCard } from '@/components/admin/booking-card'
import type { Booking } from '@/types/booking'

const approvedBooking: Booking = {
  id: 'abc123def456',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  start_date: '2026-05-01',
  end_date: '2026-05-07',
  status: 'approved',
  message: null,
  ical_uid: 'uid-abc123@les-tsabloz',
  created_at: '2026-04-01T10:00:00Z',
}

describe('BookingCard — approved', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('affiche le bouton Annuler', () => {
    render(<BookingCard booking={approvedBooking} onStatusChange={() => {}} />)
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
  })

  it('affiche la confirmation après le premier clic', () => {
    render(<BookingCard booking={approvedBooking} onStatusChange={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
    expect(screen.getByText(/confirmer l'annulation/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /oui/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /non/i })).toBeInTheDocument()
  })

  it('annule la confirmation avec Non', () => {
    render(<BookingCard booking={approvedBooking} onStatusChange={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
    fireEvent.click(screen.getByRole('button', { name: /non/i }))
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument()
    expect(screen.queryByText(/confirmer l'annulation/i)).not.toBeInTheDocument()
  })

  it('appelle onStatusChange avec rejected après confirmation', async () => {
    const onStatusChange = vi.fn()
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response)

    render(<BookingCard booking={approvedBooking} onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }))
    fireEvent.click(screen.getByRole('button', { name: /oui/i }))

    await waitFor(() => {
      expect(onStatusChange).toHaveBeenCalledWith('abc123def456', 'rejected')
    })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/admin/bookings/abc123def456',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      })
    )
  })
})
