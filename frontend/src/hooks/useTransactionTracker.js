import { useState, useCallback, useRef, useEffect } from 'react'
import { trackTransaction, TX_STATUS } from '../utils/transactionTracker'

/**
 * React hook for tracking pending transactions.
 *
 * Keeps a map of txId → status so the UI can show per-action
 * indicators (e.g. a spinner on the message card that was just reacted to).
 *
 * @param {Object} opts
 * @param {Function} opts.onConfirmed - Called with txId when a tx confirms
 * @param {Function} opts.showToast   - Toast function for feedback
 */
export const useTransactionTracker = ({ onConfirmed, showToast } = {}) => {
  const [pendingTxs, setPendingTxs] = useState({})
  const cancellers = useRef({})

  /**
   * Start tracking a transaction.
   * @param {string} txId
   * @param {string} [label] - Human label for toast messages (e.g. "post")
   */
  const track = useCallback((txId, label = 'Transaction') => {
    if (!txId) return

    setPendingTxs((prev) => ({ ...prev, [txId]: TX_STATUS.PENDING }))

    const cancel = trackTransaction(txId, {
      onPending: () => {
        setPendingTxs((prev) => ({ ...prev, [txId]: TX_STATUS.PENDING }))
      },
      onSuccess: () => {
        setPendingTxs((prev) => {
          const next = { ...prev }
          delete next[txId]
          return next
        })
        if (showToast) showToast(`${label} confirmed on-chain!`, 'success')
        onConfirmed?.(txId)
      },
      onFail: (data) => {
        setPendingTxs((prev) => {
          const next = { ...prev }
          delete next[txId]
          return next
        })
        const reason = data?.tx_status === 'timeout'
          ? 'timed out waiting for confirmation'
          : 'failed on-chain'
        if (showToast) showToast(`${label} ${reason}.`, 'error')
      },
    })

    cancellers.current[txId] = cancel
  }, [onConfirmed, showToast])

  const hasPending = Object.keys(pendingTxs).length > 0

  // Cleanup all pollers on unmount
  useEffect(() => {
    return () => {
      Object.values(cancellers.current).forEach((cancel) => cancel())
    }
  }, [])

  return { pendingTxs, hasPending, track }
}
