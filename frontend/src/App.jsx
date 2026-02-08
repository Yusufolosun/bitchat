import React from 'react'
import WalletConnect from './components/WalletConnect'
import PostMessage from './components/PostMessage'
import MessageList from './components/MessageList'
import { useWallet } from './hooks/useWallet'
import { useMessages } from './hooks/useMessages'
import { pinMessage, reactToMessage } from './utils/contractCalls'
import './App.css'

function App() {
  const { isAuthenticated, address, userSession } = useWallet()
  const { messages, isLoading, refreshMessages } = useMessages()

  const handlePin = async (messageId) => {
    if (!isAuthenticated) {
      alert('Please connect your wallet first')
      return
    }
    
    try {
      const duration24hr = confirm('Pin for 24 hours? (Cancel for 72 hours)')
      await pinMessage(messageId, duration24hr, userSession)
      setTimeout(refreshMessages, 2000) // Refresh after transaction likely confirmed
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
