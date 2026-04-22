// components/cabin-info.tsx
import { Placeholder } from '@/components/brand'

const HOUSE_RULES: [string, string][] = [
  ['Arrivée', 'à partir de 15h00'],
  ['Départ', 'avant 11h00'],
  ['Capacité', 'jusqu’à 6 personnes'],
  ['Animaux', 'acceptés sur accord préalable'],
  ['Tabac', 'interdit à l’intérieur du chalet'],
  ['Calme', 'silence de 22h00 à 08h00'],
]

export function CabinInfo() {
  return (
    <div className="flex flex-col gap-11">
      {/* Asymmetric gallery */}
      <div
        className="grid gap-2.5"
        style={{
          gridTemplateColumns: '1.6fr 1fr',
          gridTemplateRows: '200px 200px',
        }}
      >
        <Placeholder label="01 · extérieur du chalet" className="row-span-2 h-full" />
        <Placeholder label="02 · séjour" className="h-full" />
        <Placeholder label="03 · chambre" className="h-full" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Placeholder label="04 · cuisine" className="h-[140px]" />
        <Placeholder label="05 · terrasse" className="h-[140px]" />
        <Placeholder label="06 · vue" className="h-[140px]" />
      </div>

      <div className="grid md:grid-cols-[1fr_1.3fr] gap-14 items-start">
        <div>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-baseline gap-2.5">
              <span className="lt-numeral">✦</span>
              <span className="lt-mono">Le lieu</span>
            </div>
            <h2 className="lt-display text-[28px] m-0 text-[var(--lt-ink)]">
              Un refuge boisé, ancré dans la montagne.
            </h2>
          </div>
          <p className="text-[var(--lt-ink-soft)] text-[15px] leading-relaxed max-w-[42ch]">
            Les Tsabloz est un chalet familial niché à 1 412 mètres, au cœur du
            Val d’Anniviers. Construit en mélèze local, il accueille jusqu’à six
            voyageurs en quête de silence, de sentiers et d’étoiles visibles.
          </p>
          <div className="flex gap-6 mt-6 pt-5 border-t border-[var(--lt-line)]">
            {[
              ['6', 'voyageurs'],
              ['2', 'chambres'],
              ['1 412', 'mètres'],
            ].map(([n, l]) => (
              <div key={l}>
                <div className="lt-display text-[28px] text-[var(--lt-moss)]">{n}</div>
                <span className="lt-mono">{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-baseline gap-2.5">
              <span className="lt-numeral">§ 07</span>
              <span className="lt-mono">Règles de vie</span>
            </div>
            <h2 className="lt-display text-[28px] m-0 text-[var(--lt-ink)]">
              Quelques principes simples.
            </h2>
          </div>
          <ul className="list-none p-0 m-0 flex flex-col">
            {HOUSE_RULES.map(([k, v], i) => (
              <li
                key={k}
                className="grid grid-cols-[110px_1fr] py-3.5 items-baseline gap-5"
                style={{
                  borderTop:
                    i === 0 ? 'none' : '1px solid var(--lt-line-soft)',
                }}
              >
                <span className="lt-mono text-[var(--lt-moss)]">
                  {String(i + 1).padStart(2, '0')} · {k}
                </span>
                <span className="text-[var(--lt-ink)] text-[15px]">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
