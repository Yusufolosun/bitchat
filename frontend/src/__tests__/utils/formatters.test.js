import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  microSTXToSTX,
  stxToMicroSTX,
  formatAddress,
  formatTimestamp,
  timeAgo,
  sanitizeMessage,
} from '../../utils/formatters'

describe('microSTXToSTX', () => {
  it('converts 1 million micro to 1 STX', () => {
    expect(microSTXToSTX(1000000)).toBe('1.000000')
  })

  it('converts zero correctly', () => {
    expect(microSTXToSTX(0)).toBe('0.000000')
  })

  it('converts small amounts', () => {
    expect(microSTXToSTX(10000)).toBe('0.010000')
  })

  it('converts large amounts', () => {
    expect(microSTXToSTX(5000000000)).toBe('5000.000000')
  })

  it('preserves decimal precision to 6 places', () => {
    expect(microSTXToSTX(1)).toBe('0.000001')
  })
})

describe('stxToMicroSTX', () => {
  it('converts 1 STX to 1 million micro', () => {
    expect(stxToMicroSTX(1)).toBe(1000000)
  })

  it('floors fractional microSTX', () => {
    expect(stxToMicroSTX(0.0000001)).toBe(0)
  })

  it('converts decimal STX', () => {
    expect(stxToMicroSTX(0.5)).toBe(500000)
  })
})

describe('formatAddress', () => {
  it('shortens a long principal', () => {
    const addr = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193'
    expect(formatAddress(addr)).toBe('SP1M46W6...DYG193')
  })

  it('returns empty string for null', () => {
    expect(formatAddress(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatAddress(undefined)).toBe('')
  })

  it('returns short addresses unchanged', () => {
    expect(formatAddress('SP1234')).toBe('SP1234')
  })

  it('handles addresses exactly at boundary (16 chars)', () => {
    const addr = '1234567890123456'
    expect(formatAddress(addr)).toBe(addr)
  })

  it('shortens addresses longer than 16 chars', () => {
    const addr = '12345678901234567'
    expect(formatAddress(addr)).toBe('12345678...234567')
  })

  it('returns empty for empty string', () => {
    expect(formatAddress('')).toBe('')
  })
})

describe('formatTimestamp', () => {
  it('returns a string from a unix timestamp', () => {
    const result = formatTimestamp(1700000000)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('handles zero timestamp', () => {
    const result = formatTimestamp(0)
    expect(typeof result).toBe('string')
  })
})

describe('timeAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'))
  })

  it('returns "just now" for very recent timestamps', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(now - 30)).toBe('just now')
  })

  it('returns minutes for timestamps under an hour', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(now - 300)).toBe('5m ago')
  })

  it('returns hours for timestamps under a day', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(now - 7200)).toBe('2h ago')
  })

  it('returns days for timestamps over a day', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(now - 172800)).toBe('2d ago')
  })

  it('returns "just now" for current timestamp', () => {
    const now = Math.floor(Date.now() / 1000)
    expect(timeAgo(now)).toBe('just now')
  })

  afterEach(() => {
    vi.useRealTimers()
  })
})

describe('sanitizeMessage', () => {
  it('returns empty string for null input', () => {
    expect(sanitizeMessage(null)).toBe('')
  })

  it('returns empty string for undefined input', () => {
    expect(sanitizeMessage(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(sanitizeMessage('')).toBe('')
  })

  it('passes through normal text', () => {
    expect(sanitizeMessage('Hello world')).toBe('Hello world')
  })

  it('strips HTML tags', () => {
    expect(sanitizeMessage('<script>alert("xss")</script>')).toBe('alert("xss")')
  })

  it('removes nested HTML', () => {
    expect(sanitizeMessage('<div><b>bold</b></div>')).toBe('bold')
  })

  it('removes javascript: URIs', () => {
    expect(sanitizeMessage('click javascript:alert(1)')).toBe('click alert(1)')
  })

  it('removes javascript: URIs case-insensitively', () => {
    expect(sanitizeMessage('JAVASCRIPT:void(0)')).toBe('void(0)')
  })

  it('removes data: URIs', () => {
    const input = 'check data:text/html,<h1>hi</h1>'
    const result = sanitizeMessage(input)
    expect(result).not.toContain('data:')
  })

  it('collapses excessive newlines', () => {
    expect(sanitizeMessage('a\n\n\n\n\nb')).toBe('a\n\nb')
  })

  it('trims whitespace', () => {
    expect(sanitizeMessage('  hello  ')).toBe('hello')
  })
})
