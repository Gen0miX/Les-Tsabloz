// types/booking.ts
export type BookingStatus = 'pending' | 'approved' | 'rejected'

export interface Booking {
  id: string
  name: string
  email: string
  start_date: string
  end_date: string
  message: string | null
  status: BookingStatus
  ical_uid: string
  created_at: string
}

export interface CreateBookingPayload {
  name: string
  email: string
  start_date: string
  end_date: string
  message?: string
}
