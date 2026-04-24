import { formatSwissDate } from '@/lib/format'

describe('formatSwissDate', () => {
  it('formats a date as DD.MM.YYYY', () => {
    expect(formatSwissDate('2026-04-24')).toBe('24.04.2026')
  })

  it('zero-pads single-digit day and month', () => {
    expect(formatSwissDate('2026-01-05')).toBe('05.01.2026')
  })

  it('does not shift the date due to UTC offset', () => {
    // '2026-12-31' must not become '30.12.2026' due to UTC parsing
    expect(formatSwissDate('2026-12-31')).toBe('31.12.2026')
  })
})
