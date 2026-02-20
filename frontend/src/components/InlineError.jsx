import React from 'react'
import './InlineError.css'

/**
 * Non-blocking error banner for section-level failures.
 * Shows inline within the page layout instead of replacing the whole screen.
 */
function InlineError({ message, onRetry }) {
  return (
    <div className="inline-error" role="alert">
      <span className="inline-error-icon" aria-hidden="true">✕</span>
      <p className="inline-error-message">{message}</p>
      {onRetry && (
        <button className="inline-error-retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export default InlineError
