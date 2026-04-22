import { Resend } from 'resend'
import type { Booking } from '@/types/booking'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingNotification(booking: Booking): Promise<void> {
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/admin`
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: process.env.OWNER_EMAIL!,
    subject: `New booking request from ${booking.name}`,
    html: `
      <h2 style="font-family:serif">New Booking Request — Les Tsabloz</h2>
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Check-in:</strong> ${booking.start_date}</p>
      <p><strong>Check-out:</strong> ${booking.end_date}</p>
      ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ''}
      <p><a href="${adminUrl}">Review in admin dashboard →</a></p>
    `,
  })
}
