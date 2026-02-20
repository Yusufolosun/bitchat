import React from 'react'
import WalletConnect from './components/WalletConnect'
import PostMessage from './components/PostMessage'
import MessageList from './components/MessageList'
import Stats from './components/Stats'
import Footer from './components/Footer'
import Toast from './components/Toast'
import ThemeToggle from './components/ThemeToggle'
import { useWallet } from './hooks/useWallet'
import { useMessages } from './hooks/useMessages'
import { useStats } from './hooks/useStats'
import { useToast } from './hooks/useToast'
import { useTheme } from './hooks/useTheme'
import { useTransactionTracker } from './hooks/useTransactionTracker'
import { pinMessage, reactToMessage } from './utils/contractCalls'
import { invalidateReadCache } from './utils/contractReads'
import { parseClarityError } from './utils/errors'
import './App.css'

function App() {
  const { isAuthenticated, address, userSession } = useWallet()
  const { messages, isLoading, isLoadingMore, error, hasMore, loadMore, refreshMessages } = useMessages()
  const { totalMessages, totalFees, isLoading: statsLoading, error: statsError, refreshStats } = useStats()
  const { toast, showToast, hideToast } = useToast()
  const { theme, toggleTheme } = useTheme()

  const handleRefresh = () => {
    invalidateReadCache()
    refreshMessages()
    refreshStats()
  }

  const { pendingTxs, track } = useTransactionTracker({
    onConfirmed: () => handleRefresh(),
    showToast,
  })

  const handlePin = async (messageId) => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet first.', 'error')
      return
    }
    
    try {
      const duration24hr = confirm('Pin for 24 hours? (Cancel for 72 hours)')
      const txId = await pinMessage(messageId, duration24hr, address)
      showToast('Pin transaction submitted — tracking confirmation.', 'info')
      track(txId, 'Pin')
    } catch (err) {
      const msg = parseClarityError(err)
      if (msg) showToast(msg, 'error')
    }
  }

  const handleReact = async (messageId) => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet first.', 'error')
      return
    }
    
    try {
      const txId = await reactToMessage(messageId, address)
      showToast('Reaction submitted — tracking confirmation.', 'info')
      track(txId, 'Reaction')
    } catch (err) {
      const msg = parseClarityError(err)
      if (msg) showToast(msg, 'error')
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
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>
      <main className="app-main">
        <Stats totalMessages={totalMessages} totalFees={totalFees} isLoading={statsLoading} error={statsError} onRetry={refreshStats} />
        <PostMessage onMessagePosted={handleRefresh} showToast={showToast} onTxSubmitted={track} />
        <MessageList
          messages={messages}
          userAddress={address}
          onPin={handlePin}
          onReact={handleReact}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </main>
      <Footer />
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />
    </div>
  )
}

export default App
