// components/booking-success.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/types/booking";

interface BookingSuccessProps {
  booking: Booking | null;
  onClose: () => void;
}

export function BookingSuccess({ booking, onClose }: BookingSuccessProps) {
  if (!booking) return null;

  function handleAddToCalendar() {
    window.open(`/api/bookings/${booking!.id}/ical`, "_blank");
  }

  const firstName = (booking.name || "").split(" ")[0] || "vous";

  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="bg-(--lt-surface) border-(--lt-line) max-w-130 p-10 overflow-hidden">
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: "oklch(from var(--lt-moss) l c h / 0.12)" }}
        />
        <div className="relative">
          <div className="w-13.5 h-13.5 rounded-full bg-(--lt-moss) text-[oklch(0.98_0.01_90)] flex items-center justify-center mb-5">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>

          <span className="lt-mono text-(--lt-moss)">✦ Demande transmise</span>
          <DialogHeader className="p-0 mt-2">
            <DialogTitle className="lt-display text-[34px] m-0 text-(--lt-ink)">
              Merci, <em className="italic text-(--lt-moss)">{firstName}</em>.
            </DialogTitle>
          </DialogHeader>
          <p className="text-(--lt-ink-soft) text-[15px] leading-relaxed mt-3.5 mb-0">
            Votre demande pour{" "}
            <strong className="text-(--lt-ink)">
              du {booking.start_date} au {booking.end_date}
            </strong>{" "}
            a bien été reçue. L’hôte vous confirmera la réservation sous 24
            heures par e-mail.
          </p>

          <div className="mt-6 p-4 bg-(--lt-surface-2) rounded-[10px] grid grid-cols-2 gap-4">
            <div>
              <span className="lt-mono">Réf.</span>
              <div className="font-mono text-[13px] mt-0.5">
                #TSB-{booking.id.slice(0, 8)}
              </div>
            </div>
            <div>
              <span className="lt-mono">Statut</span>
              <div className="text-[13.5px] mt-0.5">
                En attente de validation
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-6">
            <Button
              onClick={handleAddToCalendar}
              className="flex-1 bg-(--lt-moss) hover:brightness-95 text-[oklch(0.98_0.01_90)]"
            >
              Ajouter à mon calendrier
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
