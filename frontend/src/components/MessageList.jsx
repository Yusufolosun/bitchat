import React from 'react'
import MessageCard from './MessageCard'
import './MessageList.css'

function MessageList({ messages, userAddress, onPin, onReact, isLoading }) {
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
          key={index}
          message={message}
          messageId={index}
          userAddress={userAddress}
          onPin={onPin}
          onReact={onReact}
        />
      ))}
    </div>
  )
}

export default MessageList
