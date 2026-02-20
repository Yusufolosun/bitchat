import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InlineError from '../../components/InlineError'

describe('InlineError', () => {
  it('renders the error message text', () => {
    render(<InlineError message="Network request failed" />)
    expect(screen.getByText('Network request failed')).toBeInTheDocument()
  })

  it('has role="alert" for accessibility', () => {
    render(<InlineError message="oops" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows a retry button when onRetry is provided', () => {
    const handleRetry = vi.fn()
    render(<InlineError message="oops" onRetry={handleRetry} />)
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('calls onRetry when the retry button is clicked', () => {
    const handleRetry = vi.fn()
    render(<InlineError message="oops" onRetry={handleRetry} />)
    fireEvent.click(screen.getByText('Retry'))
    expect(handleRetry).toHaveBeenCalledOnce()
  })

  it('does not render a retry button when onRetry is omitted', () => {
    render(<InlineError message="something broke" />)
    expect(screen.queryByText('Retry')).not.toBeInTheDocument()
  })

  it('shows the error icon', () => {
    const { container } = render(<InlineError message="err" />)
    expect(container.querySelector('.inline-error-icon')).toBeInTheDocument()
  })
})
