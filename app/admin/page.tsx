// app/admin/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { ThemeToggle } from '@/components/theme-toggle'
import { BookingCard, BookingCardSkeleton } from '@/components/admin/booking-card'
import { LTWordmark } from '@/components/brand'
import { formatSwissDate } from '@/lib/format'
import type { Booking, BookingStatus } from '@/types/booking'

type AdminFilter = BookingStatus | 'completed'

type SortKey =
  | 'arrival_asc'
  | 'arrival_desc'
  | 'created_asc'
  | 'created_desc'
  | 'name_asc'
  | 'name_desc'

const SECTIONS: {
  label: string
  status: AdminFilter
  numeral: string
  heading: string
}[] = [
  { label: 'Demandes',  status: 'pending',   numeral: '§ 01', heading: 'Demandes en attente' },
  { label: 'Confirmées', status: 'approved',  numeral: '§ 02', heading: 'Séjours confirmés' },
  { label: 'Refusées',  status: 'rejected',  numeral: '§ 03', heading: 'Demandes refusées' },
  { label: 'Terminées', status: 'completed', numeral: '§ 04', heading: 'Séjours terminés' },
]

function isCompleted(b: Booking): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(b.end_date + 'T00:00:00') < today
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [icalUrl, setIcalUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [filter, setFilter] = useState<AdminFilter>('pending')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('arrival_asc')
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

  useEffect(() => {
    setSearch('')
    setSortKey('arrival_asc')
  }, [filter])

  async function handleLogout() {
    setLoadingLogout(true)
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } finally {
      setLoadingLogout(false)
    }
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

  const counts = useMemo(() => ({
    pending: bookings.filter((b) => b.status === 'pending').length,
    approved: bookings.filter((b) => b.status === 'approved' && !isCompleted(b)).length,
    rejected: bookings.filter((b) => b.status === 'rejected').length,
    completed: bookings.filter((b) => b.status === 'approved' && isCompleted(b)).length,
  }), [bookings])

  const visible = useMemo(() => {
    let result: Booking[]
    if (filter === 'completed') {
      result = bookings.filter((b) => b.status === 'approved' && isCompleted(b))
    } else {
      result = bookings.filter((b) => {
        if (b.status !== filter) return false
        if (filter === 'approved') return !isCompleted(b)
        return true
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q)
      )
    }

    return [...result].sort((a, b) => {
      switch (sortKey) {
        case 'arrival_asc':  return a.start_date.localeCompare(b.start_date)
        case 'arrival_desc': return b.start_date.localeCompare(a.start_date)
        case 'created_asc':  return a.created_at.localeCompare(b.created_at)
        case 'created_desc': return b.created_at.localeCompare(a.created_at)
        case 'name_asc':     return a.name.localeCompare(b.name)
        case 'name_desc':    return b.name.localeCompare(a.name)
      }
    })
  }, [bookings, filter, search, sortKey])

  const section = SECTIONS.find((s) => s.status === filter)!

  const nextArrival = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookings
      .filter((b) => b.status === 'approved' && !isCompleted(b))
      .filter((b) => new Date(b.start_date + 'T00:00:00') >= today)
      .map((b) => b.start_date)
      .sort()[0]
  }, [bookings])

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
              val: nextArrival ? formatSwissDate(nextArrival) : '—',
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
          <div className="flex justify-between items-center mb-4 gap-4">
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

            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="h-8 px-3 text-sm rounded-md border border-[var(--lt-line)] bg-[var(--lt-surface)] text-[var(--lt-ink)] placeholder:text-[var(--lt-ink-mute)] focus:outline-none focus:border-[var(--lt-moss)] w-44"
              />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="h-8 px-2 text-sm rounded-md border border-[var(--lt-line)] bg-[var(--lt-surface)] text-[var(--lt-ink)] focus:outline-none focus:border-[var(--lt-moss)] cursor-pointer"
              >
                <option value="arrival_asc">Arrivée ↑</option>
                <option value="arrival_desc">Arrivée ↓</option>
                <option value="created_asc">Création ↑</option>
                <option value="created_desc">Création ↓</option>
                <option value="name_asc">Nom A→Z</option>
                <option value="name_desc">Nom Z→A</option>
              </select>
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
                  readOnly={filter === 'completed'}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
