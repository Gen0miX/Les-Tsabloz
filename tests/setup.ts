import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Resend module to prevent API key requirement during tests
vi.mock('resend', () => {
  const mockResend = class {
    emails = {
      send: vi.fn().mockResolvedValue({ id: 'mocked' }),
    }
  }
  return {
    Resend: mockResend,
  }
})

// Set a dummy API key for tests
process.env.RESEND_API_KEY = 'test-api-key'
