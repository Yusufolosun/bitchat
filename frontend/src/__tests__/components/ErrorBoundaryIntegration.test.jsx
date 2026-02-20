import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'
import ErrorFallback from '../../components/ErrorFallback'

// Simulates a child that crashes on first render, then recovers
let shouldThrow = true
function UnstableWidget() {
  if (shouldThrow) {
    throw new Error('Widget crashed')
  }
  return <p>Widget loaded</p>
}

describe('ErrorBoundary + ErrorFallback integration', () => {
  beforeEach(() => {
    shouldThrow = true
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('shows ErrorFallback when a child crashes and recovers on retry', () => {
    const { rerender } = render(
      <ErrorBoundary
        fallback={({ error, resetError }) => (
          <ErrorFallback error={error} resetError={resetError} />
        )}
      >
        <UnstableWidget />
      </ErrorBoundary>
    )

    // The fallback should be showing
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Widget crashed')).toBeInTheDocument()

    // Fix the underlying problem
    shouldThrow = false

    // Click "Try again" to reset the boundary
    fireEvent.click(screen.getByText('Try again'))

    rerender(
      <ErrorBoundary
        fallback={({ error, resetError }) => (
          <ErrorFallback error={error} resetError={resetError} />
        )}
      >
        <UnstableWidget />
      </ErrorBoundary>
    )

    expect(screen.getByText('Widget loaded')).toBeInTheDocument()
  })

  it('falls back to the default UI when no fallback prop is passed', () => {
    render(
      <ErrorBoundary>
        <UnstableWidget />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })
})
