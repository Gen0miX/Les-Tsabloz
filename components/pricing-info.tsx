// components/pricing-info.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    <div className="rounded-(--lt-radius-lg) border border-(--lt-line) bg-(--lt-surface) p-5 overflow-x-auto">
      <div className="flex flex-col gap-1 mb-5">
        <div className="flex items-baseline gap-2.5">
          <span className="lt-numeral">{numeral}</span>

          <span className="lt-mono">{label}</span>
        </div>
        <h2 className="lt-display text-[22px] m-0 text-(--lt-ink)">{range}</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b-0 hover:bg-transparent">
            <TableHead className="lt-mono text-[9px] text-(--lt-moss) py-2 pr-4 pl-0 h-auto font-normal">
              Pers.
            </TableHead>
            {COLS.map((col, i) => (
              <TableHead
                key={col}
                className="lt-mono text-[9px] text-(--lt-moss) text-right py-2 pl-4 pr-0 h-auto"
                style={{ fontWeight: i === 5 ? 600 : 400 }}
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.persons}
              className="border-b border-(--lt-line-soft) last:border-0 hover:bg-transparent"
            >
              <TableCell className="lt-mono text-(--lt-moss) py-3 pr-4 pl-0 text-sm">
                {row.persons} pers.
              </TableCell>
              {row.nights.map((val, ci) => (
                <TableCell
                  key={ci}
                  className="py-3 pl-4 pr-0 text-right text-[15px]"
                  style={{
                    color:
                      val === null ? "var(--lt-ink-mute)" : "var(--lt-ink)",
                    fontWeight: ci === 5 ? 600 : 400,
                  }}
                >
                  {val === null ? "—" : `${val}.-`}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function PricingInfo() {
  const [copied, setCopied] = useState(false);

  function copyIban() {
    navigator.clipboard
      .writeText(IBAN.replace(/\s/g, ""))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <div className="flex flex-col gap-11 max-w-6xl mx-auto">
      {/* Editorial header */}
      <div className="flex flex-col gap-2">
        <span className="lt-mono text-(--lt-moss)">✦ Tarifs · Saison 2026</span>
        <h2
          className="lt-display m-0 text-(--lt-ink)"
          style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 0.95 }}
        >
          Ce que coûte un séjour.
        </h2>
        <p className="lt-mono text-(--lt-ink-mute) m-0 text-sm">
          Les enfants de moins de 12 ans ne sont pas comptabilisés. Tarifs en
          CHF.
        </p>
      </div>

      {/* Pricing tables */}
      <div className="grid xl:grid-cols-2 gap-5 items-start">
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
      <div className="border border-(--lt-line) rounded-lg bg-(--lt-surface) p-6 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="lt-mono text-[9px] text-(--lt-moss) uppercase tracking-widest">
            Paiement par virement bancaire
          </span>
          <span
            className="lt-display text-(--lt-ink)"
            style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}
          >
            Banque Raiffeisen Massongex-St-Maurice-Verossaz
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="lt-mono text-[10px] text-(--lt-ink-mute)">
            Titulaire
          </span>
          <span
            className="lt-display text-(--lt-ink) leading-tight"
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
          <span className="lt-mono text-[10px] text-(--lt-ink-mute)">IBAN</span>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="lt-display text-(--lt-ink) tracking-wider select-all"
              style={{ fontSize: "clamp(14px, 1.8vw, 18px)" }}
            >
              {IBAN}
            </span>
            <button
              type="button"
              onClick={copyIban}
              className="font-mono uppercase tracking-[0.04em] text-[11px] border border-(--lt-moss-ink) px-2.5 py-1 bg-transparent cursor-pointer text-(--lt-moss-ink) hover:text-(--lt-moss) hover:border-(--lt-moss) transition-colors"
            >
              {copied ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
