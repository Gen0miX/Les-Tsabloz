# Admin Page Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Terminées" section, search/sort controls, and Swiss date formatting to the admin booking dashboard.

**Architecture:** All changes are purely client-side. A new `formatSwissDate` utility is extracted to `lib/format.ts`. `BookingCard` gains a `readOnly` prop. `admin/page.tsx` gains a local `AdminFilter` union type, an `isCompleted` helper, two new state variables (`search`, `sortKey`), and an extended `visible` memo.

**Tech Stack:** Next.js (App Router), React, TypeScript, Vitest + @testing-library/react

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `lib/format.ts` | `formatSwissDate` utility |
| Create | `tests/lib/format.test.ts` | Unit tests for `formatSwissDate` |
| Modify | `components/admin/booking-card.tsx` | Swiss dates, `readOnly` prop |
| Modify | `tests/components/admin/booking-card.test.tsx` | Tests for new BookingCard behavior |
| Modify | `app/admin/page.tsx` | "Terminées" section, search/sort |

---

## Task 1: Swiss date format utility

**Files:**
- Create: `lib/format.ts`
- Create: `tests/lib/format.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/lib/format.test.ts`:

```ts
import { formatSwissDate } from '@/lib/format'

describe('formatSwissDate', () => {
  it('formats a date as DD.MM.YYYY', () => {
    expect(formatSwissDate('2026-04-24')).toBe('24.04.2026')
  })

  it('zero-pads single-digit day and month', () => {
    expect(formatSwissDate('2026-01-05')).toBe('05.01.2026')
  })

  it('does not shift the date due to UTC offset', () => {
    // '2026-12-31' must not become '30.12.2026' due to UTC parsing
    expect(formatSwissDate('2026-12-31')).toBe('31.12.2026')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/format.test.ts`
Expected: FAIL with "Cannot find module '@/lib/format'"

- [ ] **Step 3: Create `lib/format.ts`**

```ts
export function formatSwissDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${d.getFullYear()}`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/format.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/format.ts tests/lib/format.test.ts
git commit -m "feat: add formatSwissDate utility"
```

---

## Task 2: BookingCard — Swiss dates + read-only mode

**Files:**
- Modify: `components/admin/booking-card.tsx`
- Modify: `tests/components/admin/booking-card.test.tsx`

- [ ] **Step 1: Write the failing tests**

Add these two `describe` blocks at the bottom of `tests/components/admin/booking-card.test.tsx`:

```tsx
import { formatSwissDate } from '@/lib/format'

// Add inside the existing file, after the existing describe block:

describe('BookingCard — Swiss date display', () => {
  it('affiche les dates au format JJ.MM.AAAA', () => {
    render(<BookingCard booking={approvedBooking} onStatusChange={() => {}} />)
    expect(screen.getByText(formatSwissDate(approvedBooking.start_date))).toBeInTheDocument()
    expect(screen.getByText(formatSwissDate(approvedBooking.end_date))).toBeInTheDocument()
  })
})

describe('BookingCard — readOnly mode', () => {
  it('n\'affiche pas le bouton Annuler quand readOnly=true', () => {
    render(<BookingCard booking={approvedBooking} onStatusChange={() => {}} readOnly />)
    expect(screen.queryByRole('button', { name: /annuler/i })).not.toBeInTheDocument()
  })

  it('affiche les dates normalement en mode readOnly', () => {
    render(<BookingCard booking={approvedBooking} onStatusChange={() => {}} readOnly />)
    expect(screen.getByText(formatSwissDate(approvedBooking.start_date))).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/admin/booking-card.test.tsx`
Expected: FAIL — dates not matching (ISO format still displayed), `readOnly` prop not recognized

- [ ] **Step 3: Update `components/admin/booking-card.tsx`**

Replace the full file content with:

```tsx
// components/admin/booking-card.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/brand'
import { formatSwissDate } from '@/lib/format'
import type { Booking } from '@/types/booking'

interface BookingCardProps {
  booking: Booking
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
  readOnly?: boolean
}

const STATUS_BORDER = {
  pending: 'var(--lt-amber)',
  approved: 'var(--lt-moss)',
  rejected: 'var(--lt-rust)',
} as const

function nightsBetween(a: string, b: string) {
  const d1 = new Date(a + 'T00:00:00')
  const d2 = new Date(b + 'T00:00:00')
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
}

export function BookingCard({ booking, onStatusChange, readOnly = false }: BookingCardProps) {
  const [loading, setLoading] = useState<'approved' | 'rejected' | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)

  async function handleAction(status: 'approved' | 'rejected') {
    setLoading(status)
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) onStatusChange(booking.id, status)
      else setConfirmCancel(false)
    } finally {
      setLoading(null)
    }
  }

  const nights = nightsBetween(booking.start_date, booking.end_date)

  return (
    <div
      className="rounded-[var(--lt-radius-lg)] border border-[var(--lt-line)] bg-[var(--lt-surface)] p-[18px] flex flex-col gap-3"
      style={{
        borderLeft: `3px solid ${STATUS_BORDER[booking.status]}`,
        opacity: readOnly ? 0.65 : 1,
      }}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="lt-mono">#{booking.id.slice(0, 6)}</span>
          </div>
          <div className="lt-display text-[19px] text-[var(--lt-ink)]">
            {booking.name}
          </div>
          <div className="text-[13px] text-[var(--lt-ink-soft)] mt-0.5">
            {booking.email}
          </div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="flex items-center gap-3.5 px-3.5 py-2.5 bg-[var(--lt-surface-2)] rounded-lg">
        <div>
          <span className="lt-mono">Du</span>
          <div className="text-[14.5px] mt-0.5">{formatSwissDate(booking.start_date)}</div>
        </div>
        <div className="flex-1 flex items-center">
          <div className="flex-1 h-px bg-[var(--lt-line)] relative">
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[var(--lt-surface-2)] px-2 font-mono text-[10px] text-[var(--lt-moss)]">
              {nights} nuits
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="lt-mono">Au</span>
          <div className="text-[14.5px] mt-0.5">{formatSwissDate(booking.end_date)}</div>
        </div>
      </div>

      {booking.message && (
        <div className="text-[13.5px] text-[var(--lt-ink-soft)] italic border-l-2 border-[var(--lt-line)] pl-3 leading-relaxed">
          « {booking.message} »
        </div>
      )}

      {!readOnly && booking.status === 'pending' && (
        <div className="flex gap-2 mt-0.5">
          <Button
            size="sm"
            onClick={() => handleAction('approved')}
            disabled={!!loading}
            className="bg-[var(--lt-moss)] hover:brightness-95 text-[oklch(0.98_0.01_90)]"
          >
            {loading === 'approved' ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-3.5 w-3.5" />
                Validation…
              </span>
            ) : (
              '✓ Accepter'
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleAction('rejected')}
            disabled={!!loading}
            className="text-[var(--lt-rust)] border-[oklch(from_var(--lt-rust)_l_c_h_/_0.3)] hover:bg-[var(--lt-rust-soft)]"
          >
            {loading === 'rejected' ? (
              <span className="flex items-center gap-2">
                <Spinner className="h-3.5 w-3.5" />
                Refus…
              </span>
            ) : (
              '✕ Refuser'
            )}
          </Button>
        </div>
      )}

      {!readOnly && booking.status === 'approved' && (
        <div className="flex items-center gap-2 mt-0.5">
          {confirmCancel ? (
            <>
              <span className="text-[13px] text-[var(--lt-ink-soft)]">
                Confirmer l'annulation ?
              </span>
              <Button
                size="sm"
                onClick={() => handleAction('rejected')}
                disabled={!!loading}
                className="bg-[var(--lt-rust)] hover:brightness-95 text-[oklch(0.98_0.01_90)]"
              >
                {loading === 'rejected' ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-3.5 w-3.5" />
                    Annulation…
                  </span>
                ) : (
                  'Oui'
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmCancel(false)}
                disabled={!!loading}
              >
                Non
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirmCancel(true)}
              className="text-[var(--lt-rust)] border-[oklch(from_var(--lt-rust)_l_c_h_/_0.3)] hover:bg-[var(--lt-rust-soft)]"
            >
              ✕ Annuler la réservation
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function BookingCardSkeleton() {
  return (
    <div className="rounded-[var(--lt-radius-lg)] border border-[var(--lt-line)] bg-[var(--lt-surface)] p-[18px] flex flex-col gap-3 border-l-[3px] border-l-[var(--lt-line)]">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-32" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center gap-3.5 px-3.5 py-2.5 bg-[var(--lt-surface-2)] rounded-lg">
        <Skeleton className="h-8 w-20" />
        <div className="flex-1 h-px bg-[var(--lt-line)]" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex gap-2 mt-0.5">
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run all tests to verify they pass**

Run: `npx vitest run tests/components/admin/booking-card.test.tsx`
Expected: PASS (all tests including the 2 new describe blocks)

- [ ] **Step 5: Commit**

```bash
git add components/admin/booking-card.tsx tests/components/admin/booking-card.test.tsx
git commit -m "feat: add Swiss date format and readOnly mode to BookingCard"
```

---

## Task 3: Admin page — "Terminées" section

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Replace the full content of `app/admin/page.tsx`**

```tsx
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
```

- [ ] **Step 2: Run the full test suite to verify no regressions**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat: add Terminées section, search/sort controls, and Swiss date format to admin page"
```
