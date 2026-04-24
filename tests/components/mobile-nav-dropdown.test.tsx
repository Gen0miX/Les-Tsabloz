import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MobileNavDropdown } from '@/components/mobile-nav-dropdown'

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
    expect(screen.queryAllByText('Le chalet')).toHaveLength(1)
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
