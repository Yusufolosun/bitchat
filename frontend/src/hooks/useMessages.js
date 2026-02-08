import { useState, useEffect } from 'react'

export const useMessages = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data for now - will integrate with contract later
    const mockMessages = [
      {
        author: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        content: 'Welcome to Bitchat! This is the first message on the blockchain.',
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        pinned: true,
        pinExpiresAt: Math.floor(Date.now() / 1000) + 86400,
        reactionCount: 5,
      },
      {
        author: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        content: 'Loving this decentralized message board!',
        timestamp: Math.floor(Date.now() / 1000) - 1800,
        pinned: false,
        pinExpiresAt: 0,
        reactionCount: 2,
      },
    ]

    setTimeout(() => {
      setMessages(mockMessages)
      setIsLoading(false)
    }, 1000)
  }, [])

  const refreshMessages = () => {
    setIsLoading(true)
    // Will implement actual refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return {
    messages,
    isLoading,
    refreshMessages,
  }
}
