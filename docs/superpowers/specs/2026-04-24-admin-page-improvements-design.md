# Admin Page Improvements — Design Spec
Date: 2026-04-24

## Overview

Three improvements to the admin booking dashboard:
1. A new "Terminées" section for completed stays
2. Search and sort controls on the booking list
3. Swiss date format (JJ.MM.AAAA) throughout

---

## § 1 — Section "Terminées"

### Definition
A booking is considered "completed" (terminée) when:
- `status === 'approved'` AND
- `end_date < today` (date comparison, time-zone agnostic using local date)

### Implementation
- No database changes. The "completed" state is computed purely on the frontend.
- A local union type `BookingStatus | 'completed'` is used for the active filter state in `admin/page.tsx`. The canonical `BookingStatus` in `types/booking.ts` remains unchanged.
- A helper `isCompleted(booking: Booking): boolean` is added in `admin/page.tsx`.
- The `SECTIONS` array gains a 4th entry: `{ label: 'Terminées', status: 'completed', numeral: '§ 04', heading: 'Séjours terminés' }`.
- The sidebar counter for "Terminées" is derived from `bookings.filter(b => b.status === 'approved' && isCompleted(b)).length`.
- The "Confirmées" section (§ 02) only shows approved bookings whose `end_date >= today` (i.e., active/future stays).
- `BookingCard` in the "Terminées" section is displayed in read-only mode: no cancel button, card visually attenuated (lower opacity or muted border color).

---

## § 2 — Search and Sort

### Placement
Controls appear inline above the booking list, to the right of the section heading — within the existing `flex justify-between items-baseline` row.

### Search
- Single text input, placeholder: "Rechercher par nom ou email…"
- Filters on `booking.name` and `booking.email`, case-insensitive
- Computed in `useMemo`, no API calls
- Resets to empty string when the active section changes

### Sort
- Dropdown (`<select>` or a lightweight custom component matching the existing design system)
- Options:
  - `arrival_asc` — Date d'arrivée ↑ (default)
  - `arrival_desc` — Date d'arrivée ↓
  - `created_asc` — Date de création ↑
  - `created_desc` — Date de création ↓
  - `name_asc` — Nom A→Z
  - `name_desc` — Nom Z→A
- Applied after search filtering, both in a single `useMemo`
- Resets to `arrival_asc` when the active section changes

### State
Two new state variables in `admin/page.tsx`:
```ts
const [search, setSearch] = useState('')
const [sortKey, setSortKey] = useState<SortKey>('arrival_asc')
```

The existing `visible` memo is extended to apply search + sort after status filtering.

---

## § 3 — Swiss Date Format

### Format
`DD.MM.YYYY` — produced by `toLocaleDateString('fr-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })`.

### Utility function
A small helper is added (inline in `booking-card.tsx` or extracted to `lib/format.ts`):
```ts
function formatSwissDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
```
The `T00:00:00` suffix ensures the date is parsed in local time, not UTC, avoiding off-by-one-day errors.

### Affected locations
- `BookingCard`: "Du" and "Au" date values
- `admin/page.tsx`: "Prochaine arrivée" stat card

---

## Out of Scope
- No backend/API changes
- No new database columns or status values
- No pagination (list remains fully loaded client-side)
- No mobile-specific layout changes beyond what already exists
