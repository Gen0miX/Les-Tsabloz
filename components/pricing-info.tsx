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
              type="button"
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
