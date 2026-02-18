import { useState, useEffect, useCallback } from 'react'
import { fetchUserStats } from '../utils/contractReads'

const MIN_POST_GAP = 6 // blocks — matches contract min-post-gap
const AVG_BLOCK_MINUTES = 10 // Stacks average block time

/**
 * Tracks the on-chain cooldown for the current user.
 *
 * Returns:
 *  - canPost: whether the cooldown has elapsed
 *  - blocksRemaining: how many blocks until the cooldown expires
 *  - minutesRemaining: estimated wall-clock minutes (blocksRemaining * 10)
 *  - refresh: force re-fetch
 */
export function useCooldown(address) {
  const [blocksRemaining, setBlocksRemaining] = useState(0)
  const [canPost, setCanPost] = useState(true)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!address) {
      setCanPost(true)
      setBlocksRemaining(0)
      return
    }

    setLoading(true)
    try {
      // Fetch current block height from Stacks API
      const res = await fetch('https://api.hiro.so/v2/info')
      const info = await res.json()
      const currentBlock = info.stacks_tip_height

      const stats = await fetchUserStats(address)
      if (!stats || stats.lastPostBlock === 0) {
        setCanPost(true)
        setBlocksRemaining(0)
        return
      }

      const elapsed = currentBlock - stats.lastPostBlock
      const remaining = Math.max(0, MIN_POST_GAP - elapsed)

      setBlocksRemaining(remaining)
      setCanPost(remaining === 0)
    } catch (err) {
      // Fail open — don't block the user if this check errors
      console.error('Cooldown check failed', err)
      setCanPost(true)
      setBlocksRemaining(0)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    refresh()
  }, [refresh])

  const minutesRemaining = blocksRemaining * AVG_BLOCK_MINUTES

  return { canPost, blocksRemaining, minutesRemaining, loading, refresh }
}
