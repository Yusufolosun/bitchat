import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

// A component that throws on render so we can trigger the boundary
function Bomb({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('kaboom')
  }
  return <p>Child rendered fine</p>
}

describe('ErrorBoundary', () => {
  // Silence console.error from React's error logging during these tests
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <p>hello world</p>
      </ErrorBoundary>
    )
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })

  it('renders the default fallback when a child component throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders a custom fallback when provided', () => {
    const fallback = ({ error }) => (
      <div data-testid="custom-fallback">{error.message}</div>
    )

    render(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByTestId('custom-fallback')).toHaveTextContent('kaboom')
  })

  it('recovers when the user clicks "Try again"', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    )

    // We should be in error state
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Click the default try-again button
    fireEvent.click(screen.getByText('Try again'))

    // Rerender with a non-throwing child to prove recovery works
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Child rendered fine')).toBeInTheDocument()
  })

  it('passes resetError to the custom fallback', () => {
    const fallback = ({ resetError }) => (
      <button onClick={resetError}>Reset</button>
    )

    const { rerender } = render(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText('Reset'))

    rerender(
      <ErrorBoundary fallback={fallback}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('Child rendered fine')).toBeInTheDocument()
  })

  it('calls console.error when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>
    )
    expect(console.error).toHaveBeenCalled()
  })
})
