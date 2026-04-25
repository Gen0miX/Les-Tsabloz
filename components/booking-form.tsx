// components/booking-form.tsx
"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Booking } from "@/types/booking";

interface BookingFormProps {
  selectedRange: DateRange | undefined;
  onSuccess: (booking: Booking) => void;
}

function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DAY_FR = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];
const MONTH_FR_SHORT = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

function formatLong(d: Date) {
  return {
    day: d.getDate() + " " + MONTH_FR_SHORT[d.getMonth()],
    dow: DAY_FR[d.getDay()],
  };
}

export function BookingForm({ selectedRange, onSuccess }: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDate = selectedRange?.from
    ? toLocalDateString(selectedRange.from)
    : undefined;
  const endDate = selectedRange?.to
    ? toLocalDateString(selectedRange.to)
    : undefined;
  const canSubmit = !!startDate && !!endDate && !!name && !!email;

  const nights =
    selectedRange?.from && selectedRange?.to
      ? Math.round(
          (selectedRange.to.getTime() - selectedRange.from.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          start_date: startDate,
          end_date: endDate,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue");
        return;
      }
      setName("");
      setEmail("");
      setMessage("");
      onSuccess(data.booking);
    } catch {
      setError("Une erreur réseau est survenue");
    } finally {
      setLoading(false);
    }
  }

  const fromF = selectedRange?.from ? formatLong(selectedRange.from) : null;
  const toF = selectedRange?.to ? formatLong(selectedRange.to) : null;

  return (
    <div className="rounded-(--lt-radius-lg) border border-(--lt-line) bg-(--lt-surface) p-5 flex flex-col gap-4">
      <div>
        <span className="lt-numeral">§ 02</span>
        <span className="lt-mono"> Tes informations</span>
        <h3 className="lt-display text-[22px] mt-1.5">Demande de séjour</h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {[
          ["Arrivée", fromF],
          ["Départ", toF],
        ].map(([label, f]) => (
          <div
            key={label as string}
            className="p-3 border border-dashed border-(--lt-moss) rounded-(--lt-radius)"
            style={{ background: "oklch(from var(--lt-moss) l c h / 0.06)" }}
          >
            <span className="lt-mono text-(--lt-moss)">{label as string}</span>
            <div className="lt-display text-[20px] mt-0.5">
              {f ? (f as { day: string }).day : "—"}
            </div>
            <span className="text-[11px] text-(--lt-ink-mute)">
              {f ? (f as { dow: string }).dow : "Sélectionne une date"}
            </span>
          </div>
        ))}
      </div>

      {nights > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-(--lt-surface-2) rounded-md">
          <span className="text-(--lt-moss)">◦</span>
          <span className="text-[12.5px] text-(--lt-ink-soft)">
            <strong className="text-(--lt-ink)">{nights} nuits</strong> · 4
            chambres · jusqu’à 10 personnes
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="lt-label">Nom complet</label>
          <Input
            placeholder="Prénom Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="lt-label">E-mail</label>
          <Input
            type="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="lt-label">Message (facultatif)</label>
          <Textarea
            placeholder="Quelques mots…"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {!startDate && (
          <p className="text-sm text-(--lt-ink-mute)">
            Sélectionne tes dates sur le calendrier pour continuer
          </p>
        )}
        {error && <p className="text-sm text-(--lt-rust)">{error}</p>}

        <Button
          type="submit"
          disabled={loading || !canSubmit}
          className="mt-1 bg-(--lt-moss) hover:brightness-95 text-[oklch(0.98_0.01_90)]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Spinner className="h-4 w-4" />
              Envoi…
            </span>
          ) : (
            "Envoyer la demande"
          )}
        </Button>

        <p className="m-0 text-[12px] text-(--lt-ink-mute) leading-relaxed">
          Ta demande sera examinée. Aucun paiement n’est requis à ce stade.
        </p>
      </form>
    </div>
  );
}
