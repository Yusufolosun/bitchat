import React, { useEffect } from 'react'
import './Toast.css'

/**
 * Toast notification component.
 *
 * @param {Object} props
 * @param {string} props.message  - Text to display
 * @param {'success'|'error'|'info'} props.type - Visual variant
 * @param {Function} props.onClose - Called when the toast should disappear
 * @param {number} [props.duration=5000] - Auto-dismiss time in ms
 */
function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onClose])

  if (!message) return null

  return (
    <div className={`toast toast-${type}`} role="alert" aria-live="polite">
      <span className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'info' && 'ℹ'}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}

export default Toast
