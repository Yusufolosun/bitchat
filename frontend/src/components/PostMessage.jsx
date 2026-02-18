import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { postMessage } from '../utils/contractCalls'
import { parseClarityError } from '../utils/errors'
import { MAX_MESSAGE_LENGTH } from '../utils/constants'
import './PostMessage.css'

function PostMessage({ onMessagePosted, showToast, onTxSubmitted }) {
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const { isAuthenticated, address } = useWallet()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    setIsPosting(true)
    
    try {
      const txId = await postMessage(content, address)
      setContent('')
      if (showToast) showToast('Message submitted — tracking confirmation.', 'info')
      if (onTxSubmitted) onTxSubmitted(txId, 'Post')
      if (onMessagePosted) {
        onMessagePosted()
      }
    } catch (error) {
      const msg = parseClarityError(error)
      if (msg && showToast) showToast(msg, 'error')
    } finally {
      setIsPosting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="post-message">
        <p className="auth-required">Connect wallet to post messages</p>
      </div>
    )
  }

  return (
    <form className="post-message" onSubmit={handleSubmit}>
      <label htmlFor="message-input" className="sr-only">Message content</label>
      <textarea
        id="message-input"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? (max 280 characters)"
        maxLength={MAX_MESSAGE_LENGTH}
        rows={4}
        disabled={isPosting}
        aria-describedby="char-count"
      />
      <div className="post-actions">
        <span className="char-count" id="char-count" aria-live="polite">
          {content.length}/{MAX_MESSAGE_LENGTH}
        </span>
        <button 
          type="submit" 
          className="btn btn-post" 
          disabled={!content.trim() || isPosting}
          aria-label={isPosting ? 'Posting message' : 'Post message'}
        >
          {isPosting ? 'Posting...' : 'Post Message'}
        </button>
      </div>
    </form>
  )
}

export default PostMessage
