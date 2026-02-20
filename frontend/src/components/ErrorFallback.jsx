import React from 'react'
import './ErrorFallback.css'

/**
 * Full-page fallback shown when the ErrorBoundary catches a render crash.
 * Gives the user a clear message and a way to recover without refreshing.
 */
function ErrorFallback({ error, resetError }) {
  return (
    <div className="error-fallback" role="alert">
      <div className="error-fallback-card">
        <span className="error-fallback-icon" aria-hidden="true">⚠</span>
        <h2 className="error-fallback-title">Something went wrong</h2>
        <p className="error-fallback-message">
          The app ran into an unexpected error. This is usually temporary — try
          reloading or click the button below.
        </p>

        {error?.message && (
          <details className="error-fallback-details">
            <summary>Technical details</summary>
            <code>{error.message}</code>
          </details>
        )}

        <div className="error-fallback-actions">
          <button className="btn btn-primary" onClick={resetError}>
            Try again
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback
