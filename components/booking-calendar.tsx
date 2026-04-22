// components/booking-calendar.tsx
'use client'

import { Calendar } from '@/components/ui/calendar'
import type { DateRange } from 'react-day-picker'

interface BookedRange {
  start_date: string
  end_date: string
}

interface BookingCalendarProps {
  bookedRanges: BookedRange[]
  selectedRange: DateRange | undefined
  onSelectRange: (range: DateRange | undefined) => void
}

export function BookingCalendar({
  bookedRanges,
  selectedRange,
  onSelectRange,
}: BookingCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const disabledDates = bookedRanges.map((r) => ({
    from: new Date(r.start_date + 'T00:00:00'),
    to: new Date(r.end_date + 'T00:00:00'),
  }))

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3">
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={onSelectRange}
        disabled={[{ before: today }, ...disabledDates]}
        numberOfMonths={1}
        className="w-full"
        modifiers={{ booked: disabledDates }}
        modifiersClassNames={{
          booked: 'opacity-40 line-through cursor-not-allowed',
        }}
      />
      <p className="mt-2 text-xs text-stone-400 text-center">
        Select your check-in then check-out date
      </p>
    </div>
  )
}
