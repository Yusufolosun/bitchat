import { useState, useCallback } from 'react'

/**
 * Manages a single toast notification.
 *
 * Usage:
 *   const { toast, showToast, hideToast } = useToast()
 *   showToast('Saved!', 'success')
 */
export const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: 'info' })

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast({ message: '', type: 'info' })
  }, [])

  return { toast, showToast, hideToast }
}
