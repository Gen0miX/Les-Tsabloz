# Pricing Tab — Design Spec
**Date:** 2026-04-22  
**Status:** Approved

## Overview

Add a "Tarifs" tab (Tab 03) to the existing tab navigation on the home page (`app/page.tsx`). The pricing content lives in a new component `components/pricing-info.tsx`, rendered in the same `<main>` block as `CabinInfo` and the booking view.

## Scope

- New tab entry in `page.tsx` tab nav (existing pattern)
- New component `components/pricing-info.tsx`
- No new routes, no new pages

## Tab Navigation Change

`app/page.tsx` currently manages tab state with `"book" | "cabin"`. Extend to `"book" | "cabin" | "tarifs"`.

Tab bar entries:
| # | ID | Label |
|---|-----|-------|
| 01 | `book` | Réserver un séjour |
| 02 | `cabin` | Le chalet |
| 03 | `tarifs` | Tarifs |

## Component: `PricingInfo`

### Section 1 — Editorial header

- `✦ Tarifs · Saison 2026` in `lt-mono`, color `--lt-moss`
- `lt-display` heading: "Ce que coûte un séjour."
- Short note: "Les enfants de moins de 12 ans ne sont pas comptabilisés."

### Section 2 — Detailed pricing tables

Two tables side by side on desktop (`md:grid-cols-2`), stacked on mobile. Each wrapped in a `div` with an `overflow-x-auto` for small screens.

**Table structure (same for both seasons):**

| Pers. | 1 nuit | 2 nuits | 3 nuits | 4 nuits | 5 nuits | Semaine |
|-------|--------|---------|---------|---------|---------|---------|
| 2     | …      | …       | …       | …       | …       | …       |
| …     | …      | …       | …       | …       | …       | …       |

**Styling:**
- Section label: `lt-numeral` + `lt-mono` (e.g. `§ 01 · Tarifs d'été`)
- Season range below label in `lt-mono` muted: `1er mai – 31 octobre`
- Table header row: `lt-mono` 9px, color `--lt-moss`, uppercase
- Table rows: `text-[15px]`, separated by `border-t border-[var(--lt-line-soft)]`
- "Semaine" column: `font-semibold`, color `--lt-ink`
- Unavailable cells (`-`): color `--lt-ink-mute`

**Été data (1 mai – 31 octobre):**

| Pers. | 1 nuit | 2 nuits | 3 nuits | 4 nuits | 5 nuits | Semaine |
|-------|--------|---------|---------|---------|---------|---------|
| 2     | 70     | 140     | 210     | 280     | 350     | 400     |
| 3     | 90     | 180     | 270     | 360     | 450     | 500     |
| 4     | 110    | 220     | 330     | 440     | —       | 600     |
| 5     | 130    | 260     | 390     | 520     | —       | 700     |
| 6     | 150    | 300     | 450     | 600     | —       | 800     |
| 7     | 170    | 340     | 510     | —       | —       | 900     |
| 8     | 190    | 380     | 570     | —       | —       | 1000    |
| 9     | 210    | 420     | 630     | —       | —       | 1100    |
| 10    | 230    | 460     | 690     | —       | —       | 1200    |

**Hiver data (1 novembre – 30 avril):**

| Pers. | 1 nuit | 2 nuits | 3 nuits | 4 nuits | 5 nuits | Semaine |
|-------|--------|---------|---------|---------|---------|---------|
| 2     | 80     | 160     | 240     | 320     | 400     | 450     |
| 3     | 100    | 200     | 300     | 400     | 500     | 550     |
| 4     | 120    | 240     | 360     | 480     | —       | 650     |
| 5     | 140    | 280     | 420     | 560     | —       | 750     |
| 6     | 160    | 320     | 480     | 640     | —       | 850     |
| 7     | 180    | 360     | 540     | 760     | —       | 950     |
| 8     | 200    | 400     | 600     | —       | —       | 1050    |
| 9     | 220    | 440     | 660     | —       | —       | 1150    |
| 10    | 240    | 480     | 720     | —       | —       | 1250    |

### Section 3 — Coordonnées bancaires

A bordered block (`border border-[var(--lt-line)]`, `bg-[var(--lt-surface)]`, `p-6 rounded-none`) containing:

- Label `lt-mono`: `Paiement par virement bancaire`
- Bank name in `lt-mono` muted: `Banque Raiffeisen Massongex-St-Maurice-Verossaz`
- Account holder in `lt-display` (28px): `Mayen des Tsabloz, c/o Jean-Marc Studer, St-Maurice`
- IBAN in `lt-mono` large (18px), selectable: `CH03 8060 6000 0003 9698 6`
- A small "Copier" button (ghost, `lt-mono` 11px) next to the IBAN that copies to clipboard and shows a brief "Copié !" confirmation

## Files Changed

| File | Change |
|------|--------|
| `app/page.tsx` | Extend tab union type, add Tab 03, render `<PricingInfo />` |
| `components/pricing-info.tsx` | New component (created) |
