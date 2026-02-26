import React from 'react'
import WalletConnect from './components/WalletConnect'
import PostMessage from './components/PostMessage'
import MessageList from './components/MessageList'
import Stats from './components/Stats'
import Footer from './components/Footer'
import Toast from './components/Toast'
import ThemeToggle from './components/ThemeToggle'
import Modal from './components/Modal'
import { useWallet } from './hooks/useWallet'
import { useMessages } from './hooks/useMessages'
import { useStats } from './hooks/useStats'
import { useToast } from './hooks/useToast'
import { useTheme } from './hooks/useTheme'
import { useTransactionTracker } from './hooks/useTransactionTracker'
import {
  pinMessage,
  reactToMessage,
  editMessage,
  deleteMessage,
  replyToMessage,
  setDisplayName
} from './utils/contractCalls'
import { invalidateReadCache } from './utils/contractReads'
import { parseClarityError } from './utils/errors'
import './App.css'

function App() {
  const { isAuthenticated, address, userSession } = useWallet()
  const { messages, isLoading, isLoadingMore, error, hasMore, loadMore, refreshMessages } = useMessages()
  const { totalMessages, totalFees, isLoading: statsLoading, error: statsError, refreshStats } = useStats()
  const { toast, showToast, hideToast } = useToast()
  const { theme, toggleTheme } = useTheme()

  // Modal State
  const [modal, setModal] = React.useState({
    isOpen: false,
    title: '',
    content: null,
    onConfirm: () => { },
    confirmText: 'Confirm',
    confirmVariant: 'primary'
  })

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }))

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

    setModal({
      isOpen: true,
      title: 'Pin Message',
      content: (
        <div>
          <p>How long would you like to pin this message?</p>
          <p className="modal-note">Pinning makes your message stay at the top of the board.</p>
        </div>
      ),
      confirmText: '24 Hours',
      confirmVariant: 'primary',
      onConfirm: async () => {
        try {
          const txId = await pinMessage(messageId, true, address)
          showToast('Pin transaction submitted — tracking confirmation.', 'info')
          track(txId, 'Pin')
          closeModal()
        } catch (err) {
          const msg = parseClarityError(err)
          if (msg) showToast(msg, 'error')
        }
      }
    })
  }

  const handleEdit = (messageId, currentContent) => {
    let newContent = currentContent
    setModal({
      isOpen: true,
      title: 'Edit Message',
      content: (
        <textarea
          className="modal-input"
          defaultValue={currentContent}
          onChange={(e) => newContent = e.target.value}
          placeholder="Enter new content..."
          maxLength={280}
        />
      ),
      confirmText: 'Save Changes',
      confirmVariant: 'primary',
      onConfirm: async () => {
        try {
          if (!newContent || newContent === currentContent) return closeModal()
          const txId = await editMessage(messageId, newContent)
          showToast('Edit submitted — tracking confirmation.', 'info')
          track(txId, 'Edit')
          closeModal()
        } catch (err) {
          const msg = parseClarityError(err)
          if (msg) showToast(msg, 'error')
        }
      }
    })
  }

  const handleDelete = (messageId) => {
    setModal({
      isOpen: true,
      title: 'Delete Message',
      content: (
        <p>Are you sure you want to delete this message? This action is permanent (on-chain soft delete).</p>
      ),
      confirmText: 'Delete Forever',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const txId = await deleteMessage(messageId)
          showToast('Deletion submitted — tracking confirmation.', 'info')
          track(txId, 'Delete')
          closeModal()
        } catch (err) {
          const msg = parseClarityError(err)
          if (msg) showToast(msg, 'error')
        }
      }
    })
  }

  const handleReply = (parentId) => {
    let replyContent = ''
    setModal({
      isOpen: true,
      title: `Reply to Message #${parentId}`,
      content: (
        <textarea
          className="modal-input"
          onChange={(e) => replyContent = e.target.value}
          placeholder="Write your reply..."
          maxLength={280}
        />
      ),
      confirmText: 'Post Reply',
      confirmVariant: 'primary',
      onConfirm: async () => {
        try {
          if (!replyContent) return showToast('Reply cannot be empty', 'error')
          const txId = await replyToMessage(parentId, replyContent, address)
          showToast('Reply submitted — tracking confirmation.', 'info')
          track(txId, 'Reply')
          closeModal()
        } catch (err) {
          const msg = parseClarityError(err)
          if (msg) showToast(msg, 'error')
        }
      }
    })
  }

  const handleSetDisplayName = () => {
    let newName = ''
    setModal({
      isOpen: true,
      title: 'Set Display Name',
      content: (
        <input
          type="text"
          className="modal-input"
          onChange={(e) => newName = e.target.value}
          placeholder="Display Name (max 50 chars)"
          maxLength={50}
        />
      ),
      confirmText: 'Update Name',
      confirmVariant: 'primary',
      onConfirm: async () => {
        try {
          if (!newName) return showToast('Name cannot be empty', 'error')
          const txId = await setDisplayName(newName)
          showToast('Name update submitted — tracking confirmation.', 'info')
          track(txId, 'Profile Update')
          closeModal()
        } catch (err) {
          const msg = parseClarityError(err)
          if (msg) showToast(msg, 'error')
        }
      }
    })
  }

  const handleReact = (messageId) => {
    if (!isAuthenticated) {
      showToast('Please connect your wallet first.', 'error')
      return
    }

    const emojis = [
      { type: 1, char: '❤️', label: 'Like' },
      { type: 2, char: '🔥', label: 'Fire' },
      { type: 3, char: '😂', label: 'Laugh' },
      { type: 4, char: '😢', label: 'Sad' },
      { type: 5, char: '👎', label: 'Dislike' },
    ]

    setModal({
      isOpen: true,
      title: 'React to Message',
      content: (
        <div className="emoji-picker">
          {emojis.map((emoji) => (
            <button
              key={emoji.type}
              className="btn-emoji"
              onClick={async () => {
                try {
                  const txId = await reactToMessageTyped(messageId, emoji.type, address)
                  showToast(`${emoji.char} Reaction submitted — tracking confirmation.`, 'info')
                  track(txId, 'Reaction')
                  closeModal()
                } catch (err) {
                  const msg = parseClarityError(err)
                  if (msg) showToast(msg, 'error')
                }
              }}
              title={emoji.label}
            >
              <span className="emoji-char">{emoji.char}</span>
              <span className="emoji-label">{emoji.label}</span>
            </button>
          ))}
        </div>
      ),
      confirmText: 'Cancel',
      confirmVariant: 'cancel',
      onConfirm: closeModal
    })
  }


  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <img src="/logo.png" alt="Bitchat Logo" className="header-logo" />
            <h1>Bitchat</h1>
            <p>On-Chain Message Board</p>
          </div>
          <div className="header-actions">
            {isAuthenticated && (
              <button className="btn-profile" onClick={handleSetDisplayName} title="Set Display Name">
                👤 Profile
              </button>
            )}
            <WalletConnect />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReply={handleReply}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          error={error}
          onRetry={refreshMessages}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </main>
      <Footer />
      <Toast message={toast.message} type={toast.type} onClose={hideToast} />

      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        confirmVariant={modal.confirmVariant}
      >
        {modal.content}
      </Modal>
    </div>
  )
}

export default App
