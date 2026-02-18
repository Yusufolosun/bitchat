import React from 'react'
import MessageCard from './MessageCard'
import './MessageList.css'

function MessageList({ messages, userAddress, onPin, onReact, isLoading, isLoadingMore, hasMore, onLoadMore }) {
  if (isLoading) {
    return (
      <div className="message-list">
        <p className="loading-message">Loading messages...</p>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="message-list">
        <p className="empty-message">No messages yet. Be the first to post!</p>
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <MessageCard
          key={message.id != null ? message.id : index}
          message={message}
          messageId={message.id != null ? message.id : index}
          userAddress={userAddress}
          onPin={onPin}
          onReact={onReact}
        />
      ))}

      {hasMore && (
        <div className="load-more-container">
          <button
            className="btn btn-load-more"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}
    </div>
  )
}

export default MessageList
