import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../../hooks/useToast'

describe('useToast', () => {
  it('starts with empty message', () => {
    const { result } = renderHook(() => useToast())
    expect(result.current.toast.message).toBe('')
    expect(result.current.toast.type).toBe('info')
  })

  it('showToast sets message and type', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Saved!', 'success')
    })

    expect(result.current.toast.message).toBe('Saved!')
    expect(result.current.toast.type).toBe('success')
  })

  it('defaults to info type', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Note')
    })

    expect(result.current.toast.type).toBe('info')
  })

  it('hideToast clears the message', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Error', 'error')
    })
    expect(result.current.toast.message).toBe('Error')

    act(() => {
      result.current.hideToast()
    })
    expect(result.current.toast.message).toBe('')
    expect(result.current.toast.type).toBe('info')
  })

  it('can show multiple toasts in sequence', () => {
    const { result } = renderHook(() => useToast())

    act(() => result.current.showToast('First', 'info'))
    expect(result.current.toast.message).toBe('First')

    act(() => result.current.showToast('Second', 'error'))
    expect(result.current.toast.message).toBe('Second')
    expect(result.current.toast.type).toBe('error')
  })
})
