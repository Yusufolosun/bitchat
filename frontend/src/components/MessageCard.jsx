import React from 'react'
import { formatAddress, timeAgo, sanitizeMessage } from '../utils/formatters'
import './MessageCard.css'

function MessageCard({ message, messageId, userAddress, onPin, onReact }) {
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
        {sanitizeMessage(content)}
      </div>
      
      <div className="message-footer">
        <div className="message-stats">
          {pinned && <span className="pin-badge">📌 Pinned</span>}
          <span className="reaction-count">❤️ {reactionCount}</span>
        </div>
        
        <div className="message-actions">
          <button 
            className="btn-action" 
            onClick={() => onReact(messageId)}
            title="React to message"
          >
            ❤️ React
          </button>
          
          {isAuthor && !pinned && (
            <button 
              className="btn-action btn-pin" 
              onClick={() => onPin(messageId)}
              title="Pin this message"
            >
              📌 Pin
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageCard
