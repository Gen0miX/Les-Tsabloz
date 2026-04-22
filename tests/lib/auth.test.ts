/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll } from 'vitest'

beforeAll(() => {
  process.env.COOKIE_SECRET = 'test-secret-that-is-at-least-32-characters-long'
})

// Dynamic import so env is set before module loads
const getModule = () => import('@/lib/auth')

describe('signGuestToken', () => {
  it('returns a non-empty JWT string', async () => {
    const { signGuestToken } = await getModule()
    const token = await signGuestToken()
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3)
  })
})

describe('verifyGuestToken', () => {
  it('returns true for a token produced by signGuestToken', async () => {
    const { signGuestToken, verifyGuestToken } = await getModule()
    const token = await signGuestToken()
    expect(await verifyGuestToken(token)).toBe(true)
  })

  it('returns false for a tampered token', async () => {
    const { verifyGuestToken } = await getModule()
    expect(await verifyGuestToken('bad.token.value')).toBe(false)
  })

  it('returns false for an empty string', async () => {
    const { verifyGuestToken } = await getModule()
    expect(await verifyGuestToken('')).toBe(false)
  })
})
