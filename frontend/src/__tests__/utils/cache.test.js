import { describe, it, expect, vi, beforeEach } from 'vitest'
import ContractReadCache from '../../utils/cache'

describe('ContractReadCache', () => {
  let cache

  beforeEach(() => {
    cache = new ContractReadCache(100) // 100ms TTL for fast tests
  })

  it('fetches and caches a value', async () => {
    const fetcher = vi.fn().mockResolvedValue(42)

    const first = await cache.get('key', fetcher)
    const second = await cache.get('key', fetcher)

    expect(first).toBe(42)
    expect(second).toBe(42)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('re-fetches after TTL expires', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce('old')
      .mockResolvedValueOnce('new')

    await cache.get('key', fetcher)

    // Wait for TTL * 2 (stale window also expires)
    await new Promise((r) => setTimeout(r, 210))

    const result = await cache.get('key', fetcher)
    expect(result).toBe('new')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('returns stale data while revalidating', async () => {
    let resolveSecond
    const fetcher = vi.fn()
      .mockResolvedValueOnce('stale-value')
      .mockImplementationOnce(() => new Promise((r) => { resolveSecond = r }))

    await cache.get('key', fetcher)

    // Wait past TTL but within 2x TTL (stale window)
    await new Promise((r) => setTimeout(r, 110))

    const result = await cache.get('key', fetcher)
    expect(result).toBe('stale-value') // returns stale immediately
    expect(fetcher).toHaveBeenCalledTimes(2) // background fetch started

    // Resolve the background fetch
    resolveSecond('fresh-value')
    await new Promise((r) => setTimeout(r, 10))

    const fresh = await cache.get('key', fetcher)
    expect(fresh).toBe('fresh-value')
  })

  it('deduplicates concurrent requests for the same key', async () => {
    let resolvePromise
    const fetcher = vi.fn().mockImplementation(
      () => new Promise((r) => { resolvePromise = r })
    )

    const p1 = cache.get('key', fetcher)
    const p2 = cache.get('key', fetcher)

    resolvePromise('value')
    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1).toBe('value')
    expect(r2).toBe('value')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('returns stale data on fetch error', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce('cached')
      .mockRejectedValueOnce(new Error('network'))

    await cache.get('key', fetcher)

    // Wait for full expiry
    await new Promise((r) => setTimeout(r, 210))

    const result = await cache.get('key', fetcher)
    expect(result).toBe('cached') // fallback to stale
  })

  it('throws if no stale data and fetch fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('fail'))

    await expect(cache.get('key', fetcher)).rejects.toThrow('fail')
  })

  it('invalidate removes a specific key', async () => {
    const fetcher = vi.fn().mockResolvedValue('value')

    await cache.get('key', fetcher)
    expect(fetcher).toHaveBeenCalledTimes(1)

    cache.invalidate('key')

    await cache.get('key', fetcher)
    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('invalidatePrefix removes matching keys', async () => {
    const fetcher = vi.fn().mockResolvedValue('v')

    await cache.get('message:1', fetcher)
    await cache.get('message:2', fetcher)
    await cache.get('stats', fetcher)

    cache.invalidatePrefix('message:')

    expect(cache.size).toBe(1) // only 'stats' remains
  })

  it('invalidateAll clears everything', async () => {
    const fetcher = vi.fn().mockResolvedValue('v')

    await cache.get('a', fetcher)
    await cache.get('b', fetcher)
    await cache.get('c', fetcher)

    cache.invalidateAll()
    expect(cache.size).toBe(0)
  })

  it('size returns correct count', async () => {
    const fetcher = vi.fn().mockResolvedValue('v')

    expect(cache.size).toBe(0)

    await cache.get('x', fetcher)
    expect(cache.size).toBe(1)

    await cache.get('y', fetcher)
    expect(cache.size).toBe(2)
  })
})
