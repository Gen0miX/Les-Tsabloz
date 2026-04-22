// app/page.tsx — Accueil
"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/brand";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingForm } from "@/components/booking-form";
import { BookingSuccess } from "@/components/booking-success";
import { CabinInfo } from "@/components/cabin-info";
import { PricingInfo } from "@/components/pricing-info";
import type { DateRange } from "react-day-picker";
import type { Booking } from "@/types/booking";

interface ApprovedBooking {
  id: string;
  start_date: string;
  end_date: string;
  name: string;
  status: string;
}

export default function Home() {
  const [bookedRanges, setBookedRanges] = useState<ApprovedBooking[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [tab, setTab] = useState<"book" | "cabin" | "tarifs">("book");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "cabin" || hash === "tarifs" || hash === "book") {
      setTab(hash);
    }
  }, []);

  function handleTabChange(newTab: "book" | "cabin" | "tarifs") {
    setTab(newTab);
    window.location.hash = newTab;
  }

  function fetchBookings() {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookedRanges(data.bookings ?? []))
      .catch(console.error);
  }

  useEffect(() => {
    fetchBookings();
  }, []);

  function handleSuccess(booking: Booking) {
    setSuccessBooking(booking);
    setSelectedRange(undefined);
    fetchBookings();
  }

  return (
    <div className="lt-root min-h-screen flex flex-col bg-[var(--lt-bg)]">
      <TopBar />

      {/* Editorial hero strip */}
      <section className="px-10 md:px-16 pt-12 pb-8 border-b border-[var(--lt-line)] bg-[var(--lt-bg)]">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-end">
          <div>
            <span className="lt-mono text-[var(--lt-moss)]">
              ✦ Saison {new Date().getFullYear()} · ouverte
            </span>
            <h1
              className="lt-display mt-3.5"
              style={{
                fontSize: "clamp(44px, 6vw, 72px)",
                lineHeight: 0.95,
                fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1",
              }}
            >
              Réservez votre séjour
              <br />
              <em
                className="not-italic text-[var(--lt-moss)]"
                style={{
                  fontStyle: "italic",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1",
                }}
              >
                aux Tsabloz.
              </em>
            </h1>
          </div>
          <div className="pl-7 border-l border-[var(--lt-line)] self-end">
            <p className="text-[var(--lt-ink-soft)] text-[15px] leading-relaxed m-0 max-w-[38ch]">
              Choisis tes dates sur le calendrier, remplis le formulaire — ta
              réservation devra ensuite être confirmée. <br /> Tu recevras la
              confirmation par e-mail.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="px-10 md:px-16 border-b border-[var(--lt-line)] flex gap-0.5 bg-[var(--lt-surface)]">
        {(
          [
            { id: "book", label: "Réserver un séjour" },
            { id: "cabin", label: "Le chalet" },
            { id: "tarifs", label: "Tarifs" },
          ] as const
        ).map(({ id, label }, i) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className="bg-transparent border-none py-4 px-5 font-[var(--lt-font-ui)] text-sm cursor-pointer flex items-center gap-2 -mb-px"
              style={{
                fontWeight: active ? 600 : 400,
                color: active ? "var(--lt-ink)" : "var(--lt-ink-mute)",
                borderBottom: active
                  ? "2px solid var(--lt-moss)"
                  : "2px solid transparent",
              }}
            >
              <span
                className="lt-mono"
                style={{
                  fontSize: 9,
                  color: active ? "var(--lt-moss)" : "var(--lt-ink-mute)",
                }}
              >
                0{i + 1}
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 px-10 md:px-16 py-10">
        {tab === "book" ? (
          <div className="grid md:grid-cols-2 gap-7 items-start max-w-6xl mx-auto">
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
        ) : tab === "cabin" ? (
          <div className="max-w-6xl mx-auto">
            <CabinInfo />
          </div>
        ) : (
          <PricingInfo />
        )}
      </main>

      <footer className="px-10 md:px-16 py-6 border-t border-[var(--lt-line)] flex justify-between bg-[var(--lt-surface)]">
        <span className="lt-mono">Les Tsabloz · Vercorin · Valais</span>
        <span className="lt-mono">Pour la famille & les amis</span>
      </footer>

      <BookingSuccess
        booking={successBooking}
        onClose={() => setSuccessBooking(null)}
      />
    </div>
  );
}
