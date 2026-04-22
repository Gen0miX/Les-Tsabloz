// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookingCard } from '@/components/admin/booking-card'
import type { Booking, BookingStatus } from '@/types/booking'

const SECTIONS: { label: string; status: BookingStatus }[] = [
  { label: 'Pending', status: 'pending' },
  { label: 'Approved', status: 'approved' },
  { label: 'Rejected', status: 'rejected' },
]

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [icalUrl, setIcalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetch('/api/admin/bookings')
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings ?? []))
      .catch(console.error)

    fetch('/api/admin/ical-url')
      .then((r) => r.json())
      .then((data) => setIcalUrl(data.url ?? ''))
      .catch(console.error)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  function handleStatusChange(id: string, status: 'approved' | 'rejected') {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    )
  }

  function handleCopyIcal() {
    navigator.clipboard.writeText(icalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const grouped = Object.fromEntries(
    SECTIONS.map(({ status }) => [
      status,
      bookings.filter((b) => b.status === status),
    ])
  ) as Record<BookingStatus, Booking[]>

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900">
        <span className="font-serif text-xl text-stone-900 dark:text-stone-100">
          Les Tsabloz — Admin
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-stone-500 hover:text-stone-900 dark:text-stone-400"
          >
            Logout
          </Button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        {icalUrl && (
          <div className="flex items-center gap-3 p-3 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
            <p className="text-xs text-stone-500 dark:text-stone-400 flex-1 font-mono truncate">
              {icalUrl}
            </p>
            <Button size="sm" variant="outline" onClick={handleCopyIcal}>
              {copied ? 'Copied!' : 'Copy iCal URL'}
            </Button>
          </div>
        )}
        {SECTIONS.map(({ label, status }) => (
          <section key={status}>
            <h2 className="font-serif text-lg text-stone-900 dark:text-stone-100 mb-3">
              {label} ({grouped[status]?.length ?? 0})
            </h2>
            {!grouped[status]?.length ? (
              <p className="text-sm text-stone-400">
                No {label.toLowerCase()} bookings
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {grouped[status].map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}
