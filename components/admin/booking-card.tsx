// components/admin/booking-card.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Booking, BookingStatus } from '@/types/booking'

const statusStyle: Record<BookingStatus, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  approved:
    'bg-[#7C9A7E]/20 text-[#5a7a5c] dark:bg-[#8FAF91]/20 dark:text-[#8FAF91]',
  rejected:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

interface BookingCardProps {
  booking: Booking
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
}

export function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)

  async function handleAction(status: 'approved' | 'rejected') {
    setLoading(status)
    const res = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    if (res.ok) {
      onStatusChange(booking.id, status)
    }
  }

  return (
    <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-800">
      <CardContent className="pt-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="font-medium text-stone-900 dark:text-stone-100">
              {booking.name}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {booking.email}
            </p>
            <p className="text-sm text-stone-700 dark:text-stone-300 mt-1">
              {booking.start_date} → {booking.end_date}
            </p>
            {booking.message && (
              <p className="text-sm text-stone-500 dark:text-stone-400 italic mt-1">
                "{booking.message}"
              </p>
            )}
          </div>
          <Badge className={statusStyle[booking.status]}>{booking.status}</Badge>
        </div>
        {booking.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAction('approved')}
              disabled={!!loading}
              className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
            >
              {loading === 'approved' ? 'Approving…' : 'Approve'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction('rejected')}
              disabled={!!loading}
            >
              {loading === 'rejected' ? 'Rejecting…' : 'Reject'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
