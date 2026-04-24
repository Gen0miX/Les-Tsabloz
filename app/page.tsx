// app/page.tsx — Accueil
"use client";

import { useState, useEffect, useTransition, ViewTransition } from "react";
import { TopBar } from "@/components/brand";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingForm } from "@/components/booking-form";
import { BookingSuccess } from "@/components/booking-success";
import { CabinInfo } from "@/components/cabin-info";
import { PricingInfo } from "@/components/pricing-info";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileNavDropdown, NAV_TABS, type TabId } from "@/components/mobile-nav-dropdown";
import type { DateRange } from "react-day-picker";
import type { Booking } from "@/types/booking";

const heroStyle = {
  fontSize: "clamp(44px, 6vw, 72px)",
  lineHeight: 0.95,
  fontVariationSettings: "'opsz' 144, 'SOFT' 80, 'WONK' 1",
} as const;

const heroEmStyle = {
  fontStyle: "italic",
  fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1",
} as const;

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
  const [tab, setTab] = useState<TabId>("book");
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "cabin" || hash === "tarifs" || hash === "book") {
      setTab(hash);
    }
  }, []);

  function handleTabChange(newTab: TabId) {
    window.location.hash = newTab;
    startTransition(() => {
      setTab(newTab);
    });
  }

  function fetchBookings() {
    setLoadingBookings(true)
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookedRanges(data.bookings ?? []))
      .catch(console.error)
      .finally(() => setLoadingBookings(false))
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
    <div className="lt-root min-h-screen flex flex-col bg-(--lt-bg)">
      <TopBar />

      {/* Editorial hero strip */}
      <section className="px-5 md:px-10 lg:px-16 pt-12 pb-8 border-b border-(--lt-line) bg-(--lt-bg)">
        <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-end">
          <div>
            <span className="lt-mono text-(--lt-moss)">
              ✦ Saison {new Date().getFullYear()} · ouverte
            </span>
            <h1
              className="lt-display mt-3.5"
              style={heroStyle}
            >
              Réservez votre séjour
              <br />
              <em
                className="not-italic text-(--lt-moss)"
                style={heroEmStyle}
              >
                aux Tsabloz.
              </em>
            </h1>
          </div>
          <div className="border-t pt-4 md:border-t-0 md:border-l md:pl-7 border-(--lt-line) self-end">
            <p className="text-(--lt-ink-soft) text-[15px] leading-relaxed m-0 max-w-[38ch]">
              Choisis tes dates sur le calendrier, remplis le formulaire — ta
              réservation devra ensuite être confirmée. <br /> Tu recevras la
              confirmation par e-mail.
            </p>
          </div>
        </div>
      </section>

      {/* Tabs — desktop */}
      <nav className="px-5 md:px-10 lg:px-16 border-b border-(--lt-line) bg-(--lt-surface)">
        {/* Mobile : dropdown */}
        <MobileNavDropdown tab={tab} onTabChange={handleTabChange} />

        {/* Desktop : onglets horizontaux */}
        <div className="hidden md:flex gap-0.5">
          {NAV_TABS.map(({ id, label }, i) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className="bg-transparent border-none py-4 px-5 font-(--lt-font-ui) text-sm cursor-pointer flex items-center gap-2 -mb-px"
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
        </div>
      </nav>

      <main className="flex-1 px-5 md:px-10 lg:px-16 py-10">
        <ViewTransition key={tab} name="tab-content" share="auto" enter="auto" default="none">
          {tab === "book" ? (
            <div className="grid md:grid-cols-2 gap-7 items-start max-w-6xl mx-auto">
              {loadingBookings ? (
                <Skeleton className="h-105 rounded-(--lt-radius-lg)" />
              ) : (
                <BookingCalendar
                  bookedRanges={bookedRanges}
                  selectedRange={selectedRange}
                  onSelectRange={setSelectedRange}
                />
              )}
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
        </ViewTransition>
      </main>

      <footer className="px-5 md:px-10 lg:px-16 py-6 border-t border-(--lt-line) flex flex-col gap-1 md:flex-row md:justify-between bg-(--lt-surface)">
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
