import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchMessage, fetchTotalMessages } from '../utils/contractReads'

const PAGE_SIZE = 20

export const useMessages = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const oldestLoadedId = useRef(null)

  /**
   * Fetch the newest PAGE_SIZE messages by counting backwards from
   * the total message count. Subsequent calls load the next older page.
   */
  const loadMessages = useCallback(async (startFromId = null) => {
    const isInitial = startFromId === null

    if (isInitial) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }

    setError(null)

    try {
      const total = await fetchTotalMessages()
      setTotalCount(total)

      if (total === 0) {
        setMessages([])
        setHasMore(false)
        return
      }

      // Calculate the range of IDs to fetch
      const highId = isInitial ? total - 1 : startFromId - 1
      const lowId = Math.max(0, highId - PAGE_SIZE + 1)

      if (highId < 0) {
        setHasMore(false)
        return
      }

      // Fetch the batch in parallel
      const ids = []
      for (let i = highId; i >= lowId; i--) {
        ids.push(i)
      }

      const results = await Promise.all(ids.map((id) => fetchMessage(id)))
      const fetched = results.filter(Boolean).filter((msg) => !msg.deleted)

      oldestLoadedId.current = lowId

      if (isInitial) {
        setMessages(fetched)
      } else {
        setMessages((prev) => [...prev, ...fetched])
      }

      setHasMore(lowId > 0)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(err.message || 'Failed to load messages')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || oldestLoadedId.current === null) return
    loadMessages(oldestLoadedId.current)
  }, [isLoadingMore, hasMore, loadMessages])

  const refreshMessages = useCallback(() => {
    oldestLoadedId.current = null
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    refreshMessages,
  }
}
