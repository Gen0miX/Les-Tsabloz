// app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TopBar } from '@/components/top-bar'
import { BookingCalendar } from '@/components/booking-calendar'
import { BookingForm } from '@/components/booking-form'
import { BookingSuccess } from '@/components/booking-success'
import { CabinInfo } from '@/components/cabin-info'
import type { DateRange } from 'react-day-picker'
import type { Booking } from '@/types/booking'

interface ApprovedBooking {
  id: string
  start_date: string
  end_date: string
  name: string
  status: string
}

export default function Home() {
  const [bookedRanges, setBookedRanges] = useState<ApprovedBooking[]>([])
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null)

  function fetchBookings() {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => setBookedRanges(data.bookings ?? []))
      .catch(console.error)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  function handleSuccess(booking: Booking) {
    setSuccessBooking(booking)
    setSelectedRange(undefined)
    fetchBookings()
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      <TopBar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <Tabs defaultValue="book">
          <TabsList className="mb-6 dark:bg-stone-800">
            <TabsTrigger value="book">Book a Stay</TabsTrigger>
            <TabsTrigger value="cabin">The Cabin</TabsTrigger>
          </TabsList>
          <TabsContent value="book">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <BookingCalendar
                bookedRanges={bookedRanges}
                selectedRange={selectedRange}
                onSelectRange={setSelectedRange}
              />
              <BookingForm
                selectedRange={selectedRange}
                onSuccess={handleSuccess}
              />
            </div>
          </TabsContent>
          <TabsContent value="cabin">
            <CabinInfo />
          </TabsContent>
        </Tabs>
      </main>
      <BookingSuccess
        booking={successBooking}
        onClose={() => setSuccessBooking(null)}
      />
    </div>
  )
}
