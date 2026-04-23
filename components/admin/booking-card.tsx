// components/admin/booking-card.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { StatusBadge } from '@/components/brand'
import type { Booking } from '@/types/booking'

interface BookingCardProps {
  booking: Booking
  onStatusChange: (id: string, status: 'approved' | 'rejected') => void
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

export function BookingCard({ booking, onStatusChange }: BookingCardProps) {
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
      style={{ borderLeft: `3px solid ${STATUS_BORDER[booking.status]}` }}
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
          <div className="text-[14.5px] mt-0.5">{booking.start_date}</div>
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
          <div className="text-[14.5px] mt-0.5">{booking.end_date}</div>
        </div>
      </div>

      {booking.message && (
        <div className="text-[13.5px] text-[var(--lt-ink-soft)] italic border-l-2 border-[var(--lt-line)] pl-3 leading-relaxed">
          « {booking.message} »
        </div>
      )}

      {booking.status === 'pending' && (
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

      {booking.status === 'approved' && (
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
