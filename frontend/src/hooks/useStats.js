import { useState, useEffect, useCallback } from 'react'
import { fetchTotalMessages, fetchTotalFees } from '../utils/contractReads'

export const useStats = () => {
  const [totalMessages, setTotalMessages] = useState(0)
  const [totalFees, setTotalFees] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [messages, fees] = await Promise.all([
        fetchTotalMessages(),
        fetchTotalFees(),
      ])
      setTotalMessages(messages)
      setTotalFees(fees)
    } catch (err) {
      console.error('Failed to load stats:', err)
      setError(err.message || 'Failed to load stats')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const refreshStats = useCallback(() => {
    loadStats()
  }, [loadStats])

  return {
    totalMessages,
    totalFees,
    isLoading,
    error,
    refreshStats,
  }
}
