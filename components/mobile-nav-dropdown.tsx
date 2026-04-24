"use client"

import { useState, useRef, useEffect } from "react"

export const NAV_TABS = [
  { id: 'book' as const, label: 'Réserver un séjour' },
  { id: 'cabin' as const, label: 'Le chalet' },
  { id: 'tarifs' as const, label: 'Tarifs' },
] as const

export type TabId = (typeof NAV_TABS)[number]['id']

export function MobileNavDropdown({
  tab,
  onTabChange,
}: {
  tab: TabId
  onTabChange: (t: TabId) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const activeIndex = NAV_TABS.findIndex((t) => t.id === tab)
  const active = NAV_TABS[activeIndex]

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={ref} className="relative md:hidden">
      <button
        type="button"
        data-testid="nav-toggle"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 py-3.5 px-5 bg-transparent border-none cursor-pointer -mb-px"
        style={{ borderBottom: '2px solid var(--lt-moss)' }}
      >
        <span className="lt-mono" style={{ fontSize: 9, color: 'var(--lt-moss)' }}>
          0{activeIndex + 1}
        </span>
        <span
          className="font-(--lt-font-ui) text-sm text-(--lt-ink) flex-1 text-left"
          style={{ fontWeight: 600 }}
        >
          {active.label}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            color: 'var(--lt-ink-mute)',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute top-full left-0 right-0 z-50 bg-(--lt-surface) border border-(--lt-line) shadow-lg">
          {NAV_TABS.filter((t) => t.id !== tab).map((t, i) => {
            const idx = NAV_TABS.findIndex((x) => x.id === t.id)
            return (
              <button
                type="button"
                key={t.id}
                role="menuitem"
                onClick={() => { onTabChange(t.id); setOpen(false) }}
                className="w-full flex items-center gap-2 py-3 px-5 bg-transparent border-none cursor-pointer hover:bg-(--lt-surface-2) transition-colors text-left"
                style={{
                  borderTop: i > 0 ? '1px solid var(--lt-line-soft)' : undefined,
                }}
              >
                <span className="lt-mono" style={{ fontSize: 9, color: 'var(--lt-ink-mute)' }}>
                  0{idx + 1}
                </span>
                <span className="font-(--lt-font-ui) text-sm text-(--lt-ink-soft)">
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
