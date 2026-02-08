import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { MAX_MESSAGE_LENGTH } from '../utils/constants'
import './PostMessage.css'

function PostMessage() {
  const [content, setContent] = useState('')
  const { isAuthenticated } = useWallet()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Will add contract call
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
      />
      <div className="post-actions">
        <span className="char-count">
          {content.length}/{MAX_MESSAGE_LENGTH}
        </span>
        <button type="submit" className="btn btn-post" disabled={!content.trim()}>
          Post Message
        </button>
      </div>
    </form>
  )
}

export default PostMessage
