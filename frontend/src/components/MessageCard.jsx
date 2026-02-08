import React from 'react'
import { formatAddress, timeAgo } from '../utils/formatters'
import './MessageCard.css'

function MessageCard({ message, userAddress }) {
  const {
    author,
    content,
    timestamp,
    pinned,
    reactionCount,
  } = message

  const isAuthor = userAddress === author

  return (
    <div className={`message-card ${pinned ? 'pinned' : ''}`}>
      <div className="message-header">
        <div className="message-author">
          <span className="author-address">{formatAddress(author)}</span>
          {isAuthor && <span className="author-badge">You</span>}
        </div>
        <span className="message-time">{timeAgo(timestamp)}</span>
      </div>
      
      <div className="message-content">
        {content}
      </div>
      
      <div className="message-footer">
        <div className="message-stats">
          {pinned && <span className="pin-badge">📌 Pinned</span>}
          <span className="reaction-count">❤️ {reactionCount}</span>
        </div>
        {/* Action buttons will be added */}
      </div>
    </div>
  )
}

export default MessageCard
