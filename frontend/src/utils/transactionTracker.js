import { NETWORK } from './constants'

const API_BASE = NETWORK === 'mainnet'
  ? 'https://api.hiro.so'
  : 'https://api.testnet.hiro.so'

/**
 * Transaction status values returned by the Stacks API.
 */
export const TX_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'abort_by_response',
  DROPPED: 'dropped_replace_by_fee',
}

/**
 * Poll the Stacks API for a transaction's status until it confirms or fails.
 *
 * @param {string} txId - The transaction ID to track
 * @param {Object} callbacks
 * @param {Function} callbacks.onPending  - Called while tx is still in the mempool
 * @param {Function} callbacks.onSuccess  - Called when tx is confirmed
 * @param {Function} callbacks.onFail     - Called when tx is rejected / dropped
 * @param {number} [intervalMs=15000]     - Polling interval (default 15s)
 * @param {number} [maxAttempts=40]       - Stop after this many polls (~10 min)
 * @returns {Function} cancel - Call to stop polling early
 */
export const trackTransaction = (txId, callbacks, intervalMs = 15000, maxAttempts = 40) => {
  let attempts = 0
  let cancelled = false

  const poll = async () => {
    if (cancelled) return

    attempts += 1

    try {
      const res = await fetch(`${API_BASE}/extended/v1/tx/${txId}`)
      if (!res.ok) {
        // Transaction may not have propagated yet — keep trying
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs)
        }
        return
      }

      const data = await res.json()
      const status = data.tx_status

      if (status === TX_STATUS.SUCCESS) {
        callbacks.onSuccess?.(data)
        return
      }

      if (status === TX_STATUS.FAILED || status === TX_STATUS.DROPPED) {
        callbacks.onFail?.(data)
        return
      }

      // Still pending
      callbacks.onPending?.(data)

      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs)
      } else {
        // Timed out – treat as stale pending
        callbacks.onFail?.({ tx_status: 'timeout', tx_id: txId })
      }
    } catch (err) {
      console.error('Transaction poll error:', err)
      if (attempts < maxAttempts) {
        setTimeout(poll, intervalMs)
      }
    }
  }

  // Start polling immediately
  poll()

  return () => { cancelled = true }
}
