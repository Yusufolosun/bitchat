import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorFallback from '../../components/ErrorFallback'

describe('ErrorFallback', () => {
  const defaultProps = {
    error: new Error('Test render crash'),
    resetError: vi.fn(),
  }

  it('renders the main heading', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('has role="alert" for screen readers', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows the error message inside the technical details', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByText('Test render crash')).toBeInTheDocument()
  })

  it('renders "Try again" and "Reload page" buttons', () => {
    render(<ErrorFallback {...defaultProps} />)
    expect(screen.getByText('Try again')).toBeInTheDocument()
    expect(screen.getByText('Reload page')).toBeInTheDocument()
  })

  it('calls resetError when "Try again" is clicked', () => {
    const resetError = vi.fn()
    render(<ErrorFallback error={defaultProps.error} resetError={resetError} />)
    fireEvent.click(screen.getByText('Try again'))
    expect(resetError).toHaveBeenCalledOnce()
  })

  it('reloads the page when "Reload page" is clicked', () => {
    // Mock window.location.reload
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
    })

    render(<ErrorFallback {...defaultProps} />)
    fireEvent.click(screen.getByText('Reload page'))
    expect(reloadMock).toHaveBeenCalledOnce()
  })

  it('hides technical details when error has no message', () => {
    render(<ErrorFallback error={{}} resetError={vi.fn()} />)
    expect(screen.queryByText('Technical details')).not.toBeInTheDocument()
  })
})
