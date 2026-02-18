import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { postMessage } from '../utils/contractCalls'
import { parseClarityError } from '../utils/errors'
import { MAX_MESSAGE_LENGTH } from '../utils/constants'
import './PostMessage.css'

function PostMessage({ onMessagePosted, showToast }) {
  const [content, setContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const { isAuthenticated, address } = useWallet()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    setIsPosting(true)
    
    try {
      await postMessage(content, address)
      setContent('')
      if (showToast) showToast('Message submitted — waiting for confirmation.', 'success')
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
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind? (max 280 characters)"
        maxLength={MAX_MESSAGE_LENGTH}
        rows={4}
        disabled={isPosting}
      />
      <div className="post-actions">
        <span className="char-count">
          {content.length}/{MAX_MESSAGE_LENGTH}
        </span>
        <button 
          type="submit" 
          className="btn btn-post" 
          disabled={!content.trim() || isPosting}
        >
          {isPosting ? 'Posting...' : 'Post Message'}
        </button>
      </div>
    </form>
  )
}

export default PostMessage
