// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookingCard, BookingCardSkeleton } from '@/components/admin/booking-card'
import { LTWordmark } from '@/components/brand'
import type { Booking, BookingStatus } from '@/types/booking'

const SECTIONS: {
  label: string
  status: BookingStatus
  numeral: string
  heading: string
}[] = [
  { label: 'Demandes', status: 'pending',  numeral: '§ 01', heading: 'Demandes en attente' },
  { label: 'Confirmées', status: 'approved', numeral: '§ 02', heading: 'Séjours confirmés' },
  { label: 'Refusées',  status: 'rejected', numeral: '§ 03', heading: 'Demandes refusées' },
]

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [icalUrl, setIcalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<BookingStatus>('pending')
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    setLoadingBookings(true)
    Promise.all([
      fetch('/api/admin/bookings').then((r) => r.json()),
      fetch('/api/admin/ical-url').then((r) => r.json()),
    ])
      .then(([bookingsData, icalData]) => {
        setBookings(bookingsData.bookings ?? [])
        setIcalUrl(icalData.url ?? '')
      })
      .catch(console.error)
      .finally(() => setLoadingBookings(false))
  }, [])

  async function handleLogout() {
    setLoadingLogout(true)
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

  const counts = {
    pending: bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved').length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
  }

  const visible = bookings.filter((b) => b.status === filter)
  const section = SECTIONS.find((s) => s.status === filter)!

  // Next arrival
  const nextArrival = bookings
    .filter((b) => b.status === 'approved')
    .map((b) => new Date(b.start_date))
    .filter((d) => d >= new Date())
    .sort((a, b) => a.getTime() - b.getTime())[0]

  return (
    <div className="lt-root min-h-screen bg-[var(--lt-bg)] grid md:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-[var(--lt-line)] bg-[var(--lt-surface)] p-5 flex flex-col gap-6">
        <LTWordmark subtle />

        <nav className="flex flex-col gap-0.5">
          <span className="lt-mono px-2.5 pb-2">Navigation</span>
          {SECTIONS.map(({ label, status }) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg border-none cursor-pointer text-left text-sm"
              style={{
                background: filter === status ? 'var(--lt-surface-2)' : 'transparent',
                color: filter === status ? 'var(--lt-ink)' : 'var(--lt-ink-soft)',
                fontWeight: filter === status ? 500 : 400,
              }}
            >
              <span className="flex items-center gap-2">
                {filter === status && (
                  <span className="w-[3px] h-3.5 bg-[var(--lt-moss)] rounded-sm" />
                )}
                {label}
              </span>
              <span className="lt-mono text-[10px]">{counts[status]}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1.5">
          <span className="lt-mono">Synchronisation</span>
          <div className="rounded-[var(--lt-radius-lg)] border border-[var(--lt-line)] bg-[var(--lt-surface)] p-3 text-xs text-[var(--lt-ink-soft)] leading-relaxed">
            Le calendrier iCal est disponible pour export vers Google / Apple.
            {icalUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyIcal}
                className="mt-2.5 w-full"
              >
                {copied ? 'Copié !' : 'Copier le lien iCal'}
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col">
        <header className="px-9 py-5 border-b border-[var(--lt-line)] flex justify-between items-center bg-[var(--lt-surface)]">
          <div>
            <span className="lt-mono">Espace admin</span>
            <h1 className="lt-display text-[26px] mt-1">
              Tableau des réservations
            </h1>
          </div>
          <div className="flex gap-1.5 items-center">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loadingLogout}
            >
              {loadingLogout ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Déconnexion…
                </span>
              ) : (
                'Déconnexion'
              )}
            </Button>
          </div>
        </header>

        {/* Stats */}
        <div className="px-9 py-7 border-b border-[var(--lt-line-soft)] grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: 'Demandes en attente', val: counts.pending, color: 'var(--lt-amber)' },
            { label: 'Confirmées', val: counts.approved, color: 'var(--lt-moss)' },
            { label: 'Refusées', val: counts.rejected, color: 'var(--lt-ink)' },
            {
              label: 'Prochaine arrivée',
              val: nextArrival
                ? nextArrival.toLocaleDateString('fr-CH', { day: '2-digit', month: 'short' })
                : '—',
              color: 'var(--lt-ink)',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-[var(--lt-radius-lg)] border border-[var(--lt-line)] bg-[var(--lt-surface)] p-4"
            >
              <span className="lt-mono">{s.label}</span>
              <div
                className="lt-display text-[30px] mt-1.5"
                style={{ color: s.color }}
              >
                {loadingBookings ? <Skeleton className="h-8 w-12 mt-1" /> : s.val}
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        <main className="px-9 py-7 flex-1">
          <div className="flex justify-between items-baseline mb-4">
            <div>
              <span className="lt-mono text-[var(--lt-moss)]">
                {section.numeral}
              </span>
              <h2 className="lt-display text-[22px] mt-1">
                {section.heading}
                <span className="text-[var(--lt-ink-mute)] font-light ml-2.5">
                  {visible.length}
                </span>
              </h2>
            </div>
          </div>

          {loadingBookings ? (
            <div className="flex flex-col gap-3.5">
              <BookingCardSkeleton />
              <BookingCardSkeleton />
              <BookingCardSkeleton />
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-[var(--lt-radius-lg)] border border-[var(--lt-line)] bg-[var(--lt-surface)] p-10 text-center">
              <span className="lt-mono">Aucune demande</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {visible.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
