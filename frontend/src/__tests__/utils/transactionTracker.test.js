import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { trackTransaction, TX_STATUS } from '../../utils/transactionTracker'

describe('TX_STATUS', () => {
  it('has all expected status values', () => {
    expect(TX_STATUS.PENDING).toBe('pending')
    expect(TX_STATUS.SUCCESS).toBe('success')
    expect(TX_STATUS.FAILED).toBe('abort_by_response')
    expect(TX_STATUS.DROPPED).toBe('dropped_replace_by_fee')
  })
})

describe('trackTransaction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('calls onSuccess when transaction succeeds', async () => {
    const onSuccess = vi.fn()
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ tx_status: 'success', tx_id: 'abc' }),
    })

    trackTransaction('abc', { onSuccess })
    await vi.runAllTimersAsync()

    expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ tx_status: 'success' }))
  })

  it('calls onFail when transaction fails', async () => {
    const onFail = vi.fn()
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ tx_status: 'abort_by_response', tx_id: 'abc' }),
    })

    trackTransaction('abc', { onFail })
    await vi.runAllTimersAsync()

    expect(onFail).toHaveBeenCalledWith(expect.objectContaining({ tx_status: 'abort_by_response' }))
  })

  it('calls onPending and continues polling while pending', async () => {
    const onPending = vi.fn()
    const onSuccess = vi.fn()

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tx_status: 'pending' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tx_status: 'success' }),
      })

    trackTransaction('abc', { onPending, onSuccess }, 1000, 5)

    // First poll - pending
    await vi.advanceTimersByTimeAsync(0)
    expect(onPending).toHaveBeenCalledTimes(1)

    // Second poll - success
    await vi.advanceTimersByTimeAsync(1000)
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('returns a cancel function that stops polling', async () => {
    const onPending = vi.fn()
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tx_status: 'pending' }),
    })

    const cancel = trackTransaction('abc', { onPending }, 1000, 100)

    await vi.advanceTimersByTimeAsync(0)
    expect(onPending).toHaveBeenCalledTimes(1)

    cancel()

    await vi.advanceTimersByTimeAsync(5000)
    // Should not have been called again after cancel
    expect(onPending).toHaveBeenCalledTimes(1)
  })

  it('retries on fetch error', async () => {
    const onSuccess = vi.fn()

    global.fetch
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tx_status: 'success' }),
      })

    trackTransaction('abc', { onSuccess }, 1000, 5)

    // First poll - error
    await vi.advanceTimersByTimeAsync(0)
    expect(onSuccess).not.toHaveBeenCalled()

    // Second poll - success
    await vi.advanceTimersByTimeAsync(1000)
    expect(onSuccess).toHaveBeenCalled()
  })

  it('retries on non-ok response', async () => {
    const onSuccess = vi.fn()

    global.fetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tx_status: 'success' }),
      })

    trackTransaction('abc', { onSuccess }, 1000, 5)

    await vi.advanceTimersByTimeAsync(0)
    expect(onSuccess).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1000)
    expect(onSuccess).toHaveBeenCalled()
  })
})
