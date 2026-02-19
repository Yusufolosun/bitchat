import { describe, it, expect } from 'vitest'
import { CLARITY_ERROR_MESSAGES, parseClarityError } from '../../utils/errors'

describe('CLARITY_ERROR_MESSAGES', () => {
  it('contains all expected error codes', () => {
    const codes = ['u100', 'u101', 'u102', 'u103', 'u104', 'u105', 'u106', 'u107', 'u108', 'u109', 'u110']
    codes.forEach((code) => {
      expect(CLARITY_ERROR_MESSAGES).toHaveProperty(code)
      expect(typeof CLARITY_ERROR_MESSAGES[code]).toBe('string')
    })
  })
})

describe('parseClarityError', () => {
  it('returns unknown error for null', () => {
    expect(parseClarityError(null)).toBe('An unknown error occurred.')
  })

  it('returns null for user rejection (string)', () => {
    expect(parseClarityError('UserRejected')).toBeNull()
  })

  it('returns null for user cancellation', () => {
    expect(parseClarityError({ message: 'User cancelled the request' })).toBeNull()
  })

  it('maps (err u106) to cooldown message', () => {
    const result = parseClarityError('Transaction failed with (err u106)')
    expect(result).toBe(CLARITY_ERROR_MESSAGES.u106)
  })

  it('maps bare u103 to invalid length message', () => {
    const result = parseClarityError({ message: 'got u103' })
    expect(result).toBe(CLARITY_ERROR_MESSAGES.u103)
  })

  it('maps u100 to owner-only message', () => {
    expect(parseClarityError('error u100')).toBe(CLARITY_ERROR_MESSAGES.u100)
  })

  it('maps u107 to paused message', () => {
    expect(parseClarityError('u107')).toBe(CLARITY_ERROR_MESSAGES.u107)
  })

  it('returns raw message for unknown errors', () => {
    expect(parseClarityError('Something went wrong')).toBe('Something went wrong')
  })

  it('returns fallback for error object with no message', () => {
    expect(parseClarityError({})).toBe('Transaction failed. Please try again.')
  })
})
