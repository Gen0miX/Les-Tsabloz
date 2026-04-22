// components/booking-success.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/types/booking'

interface BookingSuccessProps {
  booking: Booking | null
  onClose: () => void
}

export function BookingSuccess({ booking, onClose }: BookingSuccessProps) {
  if (!booking) return null

  function handleAddToCalendar() {
    window.open(`/api/bookings/${booking!.id}/ical`, '_blank')
  }

  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="dark:bg-stone-800 dark:border-stone-700">
        <DialogHeader>
          <DialogTitle className="font-serif dark:text-stone-100">
            Request Sent
          </DialogTitle>
          <DialogDescription className="dark:text-stone-400">
            Your request for {booking.start_date} – {booking.end_date} has been
            received. The host will confirm shortly.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={handleAddToCalendar}
            className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
          >
            Add to Calendar
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="dark:border-stone-600 dark:text-stone-300"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
