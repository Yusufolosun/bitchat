import { useState, useEffect, useCallback } from 'react'
import { fetchAllMessages } from '../utils/contractReads'

export const useMessages = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMessages = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const onChainMessages = await fetchAllMessages()
      setMessages(onChainMessages)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setError(err.message || 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const refreshMessages = useCallback(() => {
    loadMessages()
  }, [loadMessages])

  return {
    messages,
    isLoading,
    error,
    refreshMessages,
  }
}
