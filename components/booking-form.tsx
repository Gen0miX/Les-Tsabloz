// components/booking-form.tsx
'use client'

import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { Booking } from '@/types/booking'

interface BookingFormProps {
  selectedRange: DateRange | undefined
  onSuccess: (booking: Booking) => void
}

export function BookingForm({ selectedRange, onSuccess }: BookingFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startDate = selectedRange?.from?.toISOString().split('T')[0]
  const endDate = selectedRange?.to?.toISOString().split('T')[0]
  const canSubmit = !!startDate && !!endDate && !!name && !!email

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        start_date: startDate,
        end_date: endDate,
        message: message || undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong')
      return
    }

    setName('')
    setEmail('')
    setMessage('')
    onSuccess(data.booking)
  }

  return (
    <Card className="border-stone-200 dark:border-stone-700 dark:bg-stone-800">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-stone-900 dark:text-stone-100">
          Request a Stay
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="dark:bg-stone-700 dark:border-stone-600"
          />
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="dark:bg-stone-700 dark:border-stone-600"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Check-in"
              value={startDate ?? ''}
              readOnly
              className="bg-stone-50 dark:bg-stone-700 dark:border-stone-600 cursor-default"
            />
            <Input
              placeholder="Check-out"
              value={endDate ?? ''}
              readOnly
              className="bg-stone-50 dark:bg-stone-700 dark:border-stone-600 cursor-default"
            />
          </div>
          <Textarea
            placeholder="Message for the host (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="dark:bg-stone-700 dark:border-stone-600"
          />
          {!startDate && (
            <p className="text-sm text-stone-400">
              Select dates on the calendar to continue
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading || !canSubmit}
            className="bg-[#7C9A7E] hover:bg-[#6a8a6c] text-white dark:bg-[#8FAF91] dark:hover:bg-[#7C9A7E] dark:text-stone-900"
          >
            {loading ? 'Sending…' : 'Send Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
