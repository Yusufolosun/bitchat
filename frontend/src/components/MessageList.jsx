import React from 'react'
import MessageCard from './MessageCard'
import InlineError from './InlineError'
import { SkeletonMessageList } from './Skeleton'
import './MessageList.css'

function MessageList({ messages, userAddress, onPin, onReact, onEdit, onDelete, onReply, isLoading, isLoadingMore, error, onRetry, hasMore, onLoadMore }) {

  if (isLoading) {
    return (
      <div className="message-list">
        <SkeletonMessageList count={4} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="message-list">
        <InlineError message={error} onRetry={onRetry} />
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
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
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
