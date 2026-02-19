import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTheme } from '../../hooks/useTheme'

describe('useTheme', () => {
  let mockStorage = {}

  beforeEach(() => {
    mockStorage = {}
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] || null)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value
    })
    // Mock matchMedia to prefer dark
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('defaults to dark theme when no preference stored', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')
  })

  it('reads stored theme preference', () => {
    mockStorage['bitchat-theme'] = 'light'
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })

  it('toggles from dark to light', () => {
    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('light')
  })

  it('toggles from light to dark', () => {
    mockStorage['bitchat-theme'] = 'light'
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })
    expect(result.current.theme).toBe('dark')
  })

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme())

    act(() => {
      result.current.toggleTheme()
    })

    expect(localStorage.setItem).toHaveBeenCalledWith('bitchat-theme', 'light')
  })

  it('sets data-theme attribute on document', () => {
    renderHook(() => useTheme())
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('respects OS light preference when no stored value', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: light)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))

    const { result } = renderHook(() => useTheme())
    expect(result.current.theme).toBe('light')
  })
})
