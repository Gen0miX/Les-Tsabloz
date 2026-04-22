# Pricing Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Tarifs" tab (Tab 03) to the home page with full seasonal pricing tables and IBAN payment block.

**Architecture:** New `PricingInfo` component holds all pricing data and UI. `app/page.tsx` gets a minimal change to extend the tab union type and render the new component. No new routes.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, existing design tokens (`--lt-*` CSS vars), `lt-mono` / `lt-display` utility classes.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `components/pricing-info.tsx` | Create | Pricing tables + IBAN block |
| `app/page.tsx` | Modify | Extend tab type, add Tab 03, render `<PricingInfo />` |

---

## Task 1: Create `components/pricing-info.tsx`

**Files:**
- Create: `components/pricing-info.tsx`

- [ ] **Step 1: Create the file with data and the `PricingTable` sub-component**

```tsx
// components/pricing-info.tsx
"use client";

import { useState } from "react";

const IBAN = "CH03 8060 6000 0003 9698 6";

type SeasonRow = {
  persons: number;
  nights: (number | null)[];
};

const SUMMER: SeasonRow[] = [
  { persons: 2, nights: [70, 140, 210, 280, 350, 400] },
  { persons: 3, nights: [90, 180, 270, 360, 450, 500] },
  { persons: 4, nights: [110, 220, 330, 440, null, 600] },
  { persons: 5, nights: [130, 260, 390, 520, null, 700] },
  { persons: 6, nights: [150, 300, 450, 600, null, 800] },
  { persons: 7, nights: [170, 340, 510, null, null, 900] },
  { persons: 8, nights: [190, 380, 570, null, null, 1000] },
  { persons: 9, nights: [210, 420, 630, null, null, 1100] },
  { persons: 10, nights: [230, 460, 690, null, null, 1200] },
];

const WINTER: SeasonRow[] = [
  { persons: 2, nights: [80, 160, 240, 320, 400, 450] },
  { persons: 3, nights: [100, 200, 300, 400, 500, 550] },
  { persons: 4, nights: [120, 240, 360, 480, null, 650] },
  { persons: 5, nights: [140, 280, 420, 560, null, 750] },
  { persons: 6, nights: [160, 320, 480, 640, null, 850] },
  { persons: 7, nights: [180, 360, 540, 760, null, 950] },
  { persons: 8, nights: [200, 400, 600, null, null, 1050] },
  { persons: 9, nights: [220, 440, 660, null, null, 1150] },
  { persons: 10, nights: [240, 480, 720, null, null, 1250] },
];

const COLS = ["1 nuit", "2 nuits", "3 nuits", "4 nuits", "5 nuits", "Semaine"];

function PricingTable({
  numeral,
  label,
  range,
  rows,
}: {
  numeral: string;
  label: string;
  range: string;
  rows: SeasonRow[];
}) {
  return (
    <div>
      <div className="flex flex-col gap-1 mb-5">
        <div className="flex items-baseline gap-2.5">
          <span className="lt-numeral">{numeral}</span>
          <span className="lt-mono">{label}</span>
        </div>
        <span className="lt-mono text-[var(--lt-ink-mute)]">{range}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="lt-mono text-[9px] text-[var(--lt-moss)] text-left py-2 pr-4 font-normal whitespace-nowrap">
                Pers.
              </th>
              {COLS.map((col, i) => (
                <th
                  key={col}
                  className="lt-mono text-[9px] text-[var(--lt-moss)] text-right py-2 pl-4 whitespace-nowrap"
                  style={{ fontWeight: i === 5 ? 600 : 400 }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.persons}
                style={{
                  borderTop:
                    ri === 0 ? "none" : "1px solid var(--lt-line-soft)",
                }}
              >
                <td className="lt-mono text-[var(--lt-moss)] py-3 pr-4 text-sm whitespace-nowrap">
                  {row.persons} pers.
                </td>
                {row.nights.map((val, ci) => (
                  <td
                    key={ci}
                    className="py-3 pl-4 text-right text-[15px] whitespace-nowrap"
                    style={{
                      color:
                        val === null ? "var(--lt-ink-mute)" : "var(--lt-ink)",
                      fontWeight: ci === 5 ? 600 : 400,
                    }}
                  >
                    {val === null ? "—" : `${val} CHF`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PricingInfo() {
  const [copied, setCopied] = useState(false);

  function copyIban() {
    navigator.clipboard.writeText(IBAN.replace(/\s/g, "")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-11 max-w-6xl mx-auto">
      {/* Editorial header */}
      <div className="flex flex-col gap-2">
        <span className="lt-mono text-[var(--lt-moss)]">✦ Tarifs · Saison 2026</span>
        <h2
          className="lt-display m-0 text-[var(--lt-ink)]"
          style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 0.95 }}
        >
          Ce que coûte un séjour.
        </h2>
        <p className="lt-mono text-[var(--lt-ink-mute)] m-0 text-sm">
          Les enfants de moins de 12 ans ne sont pas comptabilisés. Tarifs en CHF.
        </p>
      </div>

      {/* Pricing tables */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <PricingTable
          numeral="§ 01"
          label="Tarifs d'été"
          range="1er mai – 31 octobre"
          rows={SUMMER}
        />
        <PricingTable
          numeral="§ 02"
          label="Tarifs d'hiver"
          range="1er novembre – 30 avril"
          rows={WINTER}
        />
      </div>

      {/* Banking coordinates */}
      <div className="border border-[var(--lt-line)] bg-[var(--lt-surface)] p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="lt-mono text-[9px] text-[var(--lt-moss)] uppercase tracking-widest">
            Paiement par virement bancaire
          </span>
          <span className="lt-mono text-[var(--lt-ink-mute)] text-sm">
            Banque Raiffeisen Massongex-St-Maurice-Verossaz
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="lt-mono text-[10px] text-[var(--lt-ink-mute)]">Titulaire</span>
          <span
            className="lt-display text-[var(--lt-ink)] leading-tight"
            style={{ fontSize: "clamp(18px, 2.5vw, 24px)" }}
          >
            Mayen des Tsabloz
            <br />
            <span style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}>
              c/o Jean-Marc Studer, St-Maurice
            </span>
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="lt-mono text-[10px] text-[var(--lt-ink-mute)]">IBAN</span>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="lt-mono text-[18px] text-[var(--lt-ink)] tracking-wider select-all">
              {IBAN}
            </span>
            <button
              onClick={copyIban}
              className="lt-mono text-[11px] border border-[var(--lt-line)] px-2.5 py-1 bg-transparent cursor-pointer text-[var(--lt-ink-soft)] hover:text-[var(--lt-ink)] transition-colors"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/pricing-info.tsx
git commit -m "feat: add PricingInfo component with seasonal tables and IBAN block"
```

---

## Task 2: Wire the tab into `app/page.tsx`

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the import at the top of the file**

Add after the existing imports (around line 9):

```tsx
import { PricingInfo } from "@/components/pricing-info";
```

- [ ] **Step 2: Extend the tab union type and replace the tab array**

Change line 25:
```tsx
// Before
const [tab, setTab] = useState<"book" | "cabin">("book");

// After
const [tab, setTab] = useState<"book" | "cabin" | "tarifs">("book");
```

- [ ] **Step 3: Replace the hardcoded tab array in the nav**

Replace lines 88–116 (the `{(["book", "cabin"] as const).map(...)` block) with:

```tsx
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
      onClick={() => setTab(id)}
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
```

- [ ] **Step 4: Replace the main render block to handle the three tabs**

Replace lines 119–137 (the `<main>` block) with:

```tsx
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
```

- [ ] **Step 5: Verify the dev server compiles without errors**

Run: `npm run dev`  
Expected: No TypeScript or module errors. Open `http://localhost:3000` and confirm Tab 03 "Tarifs" appears in the nav.

- [ ] **Step 6: Manual smoke test**

Checklist:
- [ ] Tabs 01, 02, 03 all appear with correct `lt-mono` numbering
- [ ] Active tab underline in `--lt-moss` switches correctly between all three
- [ ] Tab 03 shows the editorial header "Ce que coûte un séjour."
- [ ] Both tables render side-by-side on desktop, stacked on mobile
- [ ] Cells with `null` show `—` in muted color; "Semaine" column is bold
- [ ] IBAN displays as `CH03 8060 6000 0003 9698 6`; "Copier" button changes to "Copié !" for 2 s after click
- [ ] Clipboard contains `CH0380606000000396986` (no spaces) after copy

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add Tarifs tab (Tab 03) to home page navigation"
```
