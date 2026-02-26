import React from 'react'
import { formatAddress, timeAgo, sanitizeMessage } from '../utils/formatters'
import './MessageCard.css'

function MessageCard({ message, messageId, userAddress, onPin, onReact, onEdit, onDelete, onReply }) {
  const {
    author,
    content,
    timestamp,
    pinned,
    reactionCount,
    authorDisplayName,
    edited,
    editCount,
    replyTo,
  } = message

  const isAuthor = userAddress === author
  const displayNameOrAuthor = authorDisplayName || formatAddress(author)

  return (
    <div className={`message-card ${pinned ? 'pinned' : ''}`} role="article" aria-label={`Message from ${displayNameOrAuthor}`}>
      <div className="message-header">
        <div className="message-author">
          <span className="author-address">{displayNameOrAuthor}</span>
          {authorDisplayName && <span className="author-handle">({formatAddress(author)})</span>}
          {isAuthor && <span className="author-badge">You</span>}
        </div>
        <span className="message-time">{timeAgo(timestamp)}</span>
      </div>

      {replyTo > 0 && (
        <div className="reply-indicator">
          Replying to #{replyTo}
        </div>
      )}

      <div className="message-content">
        {sanitizeMessage(content)}
        {edited && (
          <span className="edit-indicator" title={`Edited ${editCount} times`}>
            (edited)
          </span>
        )}
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
            aria-label={`React to message by ${displayNameOrAuthor}, current reactions: ${reactionCount}`}
          >
            ❤️ React
          </button>

          <button
            className="btn-action btn-reply"
            onClick={() => onReply(messageId)}
            title="Reply to message"
          >
            💬 Reply
          </button>

          {isAuthor && !pinned && (
            <button
              className="btn-action btn-pin"
              onClick={() => onPin(messageId)}
              title="Pin this message"
              aria-label="Pin this message"
            >
              📌 Pin
            </button>
          )}

          {isAuthor && (
            <>
              <button
                className="btn-action btn-edit"
                onClick={() => onEdit(messageId, content)}
                title="Edit message"
              >
                ✏️ Edit
              </button>
              <button
                className="btn-action btn-delete"
                onClick={() => onDelete(messageId)}
                title="Delete message"
              >
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageCard
