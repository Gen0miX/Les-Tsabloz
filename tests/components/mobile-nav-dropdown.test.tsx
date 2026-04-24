import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// On importe directement la fonction composant exportée depuis page.tsx
// après l'avoir extraite (step 3). Pour l'instant on valide l'interface.

// Composant minimal de référence pour le test
function MobileNavDropdown({
  tab,
  onTabChange,
}: {
  tab: 'book' | 'cabin' | 'tarifs'
  onTabChange: (t: 'book' | 'cabin' | 'tarifs') => void
}) {
  const tabs = [
    { id: 'book' as const, label: 'Réserver un séjour' },
    { id: 'cabin' as const, label: 'Le chalet' },
    { id: 'tarifs' as const, label: 'Tarifs' },
  ]
  const [open, setOpen] = require('react').useState(false)
  const active = tabs.find((t) => t.id === tab)!
  return (
    <div>
      <button onClick={() => setOpen((o: boolean) => !o)} data-testid="nav-toggle">
        {active.label}
      </button>
      {open &&
        tabs
          .filter((t) => t.id !== tab)
          .map((t) => (
            <button
              key={t.id}
              onClick={() => { onTabChange(t.id); setOpen(false) }}
            >
              {t.label}
            </button>
          ))}
    </div>
  )
}

describe('MobileNavDropdown', () => {
  it('affiche le nom de la section active', () => {
    render(<MobileNavDropdown tab="book" onTabChange={vi.fn()} />)
    expect(screen.getByTestId('nav-toggle')).toHaveTextContent('Réserver un séjour')
  })

  it('ouvre la liste au clic sur le bouton', () => {
    render(<MobileNavDropdown tab="book" onTabChange={vi.fn()} />)
    expect(screen.queryByText('Le chalet')).toBeNull()
    fireEvent.click(screen.getByTestId('nav-toggle'))
    expect(screen.getByText('Le chalet')).toBeInTheDocument()
    expect(screen.getByText('Tarifs')).toBeInTheDocument()
  })

  it("n'affiche pas la section active dans la liste", () => {
    render(<MobileNavDropdown tab="cabin" onTabChange={vi.fn()} />)
    fireEvent.click(screen.getByTestId('nav-toggle'))
    expect(screen.queryAllByText('Le chalet')).toHaveLength(1) // seulement le bouton toggle
  })

  it('appelle onTabChange et ferme la liste au clic sur une option', () => {
    const onTabChange = vi.fn()
    render(<MobileNavDropdown tab="book" onTabChange={onTabChange} />)
    fireEvent.click(screen.getByTestId('nav-toggle'))
    fireEvent.click(screen.getByText('Tarifs'))
    expect(onTabChange).toHaveBeenCalledWith('tarifs')
    expect(screen.queryByText('Le chalet')).toBeNull()
  })
})
