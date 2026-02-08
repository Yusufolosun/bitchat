import React, { useState, useEffect } from 'react'
import WalletConnect from './components/WalletConnect'
import PostMessage from './components/PostMessage'
import MessageList from './components/MessageList'
import Stats from './components/Stats'
import { useWallet } from './hooks/useWallet'
import { useMessages } from './hooks/useMessages'
import { pinMessage, reactToMessage } from './utils/contractCalls'
import './App.css'

function App() {
  const { isAuthenticated, address, userSession } = useWallet()
  const { messages, isLoading, refreshMessages } = useMessages()
  const [totalMessages, setTotalMessages] = useState(0)
  const [totalFees, setTotalFees] = useState(0)

  useEffect(() => {
    // Mock stats for now - will integrate with contract
    setTotalMessages(messages.length)
    setTotalFees(150000) // Mock 0.15 STX in fees
  }, [messages])

  const handlePin = async (messageId) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first')
      return
    }
    
    try {
      const duration24hr = confirm('Pin for 24 hours? (Cancel for 72 hours)')
      await pinMessage(messageId, duration24hr, userSession)
      setTimeout(refreshMessages, 2000)
    } catch (error) {
      console.error('Failed to pin message:', error)
    }
  }

  const handleReact = async (messageId) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first')
      return
    }
    
    try {
      await reactToMessage(messageId, userSession)
      setTimeout(refreshMessages, 2000)
    } catch (error) {
      console.error('Failed to react to message:', error)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Bitchat</h1>
            <p>On-Chain Message Board</p>
          </div>
          <WalletConnect />
        </div>
      </header>
      <main className="app-main">
        <Stats totalMessages={totalMessages} totalFees={totalFees} />
        <PostMessage onMessagePosted={refreshMessages} />
        <MessageList
          messages={messages}
          userAddress={address}
          onPin={handlePin}
          onReact={handleReact}
          isLoading={isLoading}
        />
      </main>
    </div>
  )
}

export default App
