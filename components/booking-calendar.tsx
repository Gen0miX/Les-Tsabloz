// components/booking-calendar.tsx
"use client";

import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

interface BookedRange {
  start_date: string;
  end_date: string;
}

interface BookingCalendarProps {
  bookedRanges: BookedRange[];
  selectedRange: DateRange | undefined;
  onSelectRange: (range: DateRange | undefined) => void;
}

export function BookingCalendar({
  bookedRanges,
  selectedRange,
  onSelectRange,
}: BookingCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const disabledDates = bookedRanges.map((r) => ({
    from: new Date(r.start_date + "T00:00:00"),
    to: new Date(r.end_date + "T00:00:00"),
  }));

  function handleSelect(range: DateRange | undefined) {
    if (range?.from && range?.to) {
      const overlaps = disabledDates.some(
        ({ from, to }) => range.from! <= to && range.to! >= from
      );
      if (overlaps) {
        onSelectRange(undefined);
        return;
      }
    }
    onSelectRange(range);
  }

  return (
    <div className="rounded-(--lt-radius-lg) border border-(--lt-line) bg-(--lt-surface) p-5 flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="lt-numeral">§ 01</span>
          <span className="lt-mono"> Dates</span>
          <h3 className="lt-display text-[22px] mt-1.5">Choisis tes dates</h3>
        </div>
      </div>

      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={handleSelect}
        disabled={[{ before: today }, ...disabledDates]}
        numberOfMonths={1}
        className="w-full"
        modifiers={{ booked: disabledDates }}
        modifiersClassNames={{
          booked: "opacity-60 cursor-not-allowed [&_button]:line-through [&_button]:text-[color:var(--lt-rust)]",
        }}
      />

      <hr className="border-0 h-px bg-(--lt-line)" />

      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-(--lt-moss)" />
          <span className="lt-mono">Votre sélection</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-(--lt-surface-2) border border-(--lt-line)" />
          <span className="lt-mono">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-(--lt-rust)" />
          <span className="lt-mono">Occupé</span>
        </div>
      </div>
    </div>
  );
}
