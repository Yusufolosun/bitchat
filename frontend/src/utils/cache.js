/**
 * In-memory cache for contract read calls.
 *
 * Uses a TTL (time-to-live) approach with stale-while-revalidate semantics:
 * - If data is fresh (< TTL), return it immediately.
 * - If data is stale (> TTL but < 2x TTL), return stale data and trigger
 *   a background revalidation.
 * - If data is expired (> 2x TTL), wait for a fresh fetch.
 *
 * Call `invalidate(key)` or `invalidateAll()` after the user submits a
 * transaction so the next read picks up the new on-chain state.
 */

const DEFAULT_TTL = 120_000 // 2 minutes (~1 Stacks block)

class ContractReadCache {
  constructor(ttl = DEFAULT_TTL) {
    this.ttl = ttl
    this.store = new Map()
    this.inflight = new Map()
  }

  /**
   * Get a cached value or fetch it.
   *
   * @param {string} key - Cache key (e.g. "message:5", "stats")
   * @param {Function} fetcher - Async function that returns the fresh value
   * @returns {Promise<any>} The cached or freshly fetched value
   */
  async get(key, fetcher) {
    const entry = this.store.get(key)
    const now = Date.now()

    if (entry) {
      const age = now - entry.timestamp

      // Fresh — return immediately
      if (age < this.ttl) {
        return entry.value
      }

      // Stale but not expired — return stale, revalidate in background
      if (age < this.ttl * 2) {
        this._revalidate(key, fetcher)
        return entry.value
      }
    }

    // Expired or missing — fetch synchronously
    return this._fetch(key, fetcher)
  }

  /**
   * Fetch and store a value. Deduplicates concurrent requests for the same key.
   */
  async _fetch(key, fetcher) {
    // Deduplicate inflight requests
    if (this.inflight.has(key)) {
      return this.inflight.get(key)
    }

    const promise = fetcher()
      .then((value) => {
        this.store.set(key, { value, timestamp: Date.now() })
        this.inflight.delete(key)
        return value
      })
      .catch((err) => {
        this.inflight.delete(key)
        // If we have stale data, return it on error
        const stale = this.store.get(key)
        if (stale) return stale.value
        throw err
      })

    this.inflight.set(key, promise)
    return promise
  }

  /**
   * Background revalidation — does not block the caller.
   */
  _revalidate(key, fetcher) {
    if (this.inflight.has(key)) return
    this._fetch(key, fetcher).catch(() => {
      // Swallow errors during background revalidation
    })
  }

  /**
   * Invalidate a specific cache entry.
   * @param {string} key
   */
  invalidate(key) {
    this.store.delete(key)
  }

  /**
   * Invalidate all entries matching a prefix.
   * @param {string} prefix - e.g. "message:" to clear all message entries
   */
  invalidatePrefix(prefix) {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Clear the entire cache. Use after a transaction confirms.
   */
  invalidateAll() {
    this.store.clear()
  }

  /**
   * Get the number of entries in the cache.
   */
  get size() {
    return this.store.size
  }
}

// Singleton instance for the app
export const contractCache = new ContractReadCache()

export default ContractReadCache
