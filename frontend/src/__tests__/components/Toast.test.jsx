import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Toast from '../../components/Toast'

describe('Toast', () => {
  it('renders message text', () => {
    render(<Toast message="Saved!" type="success" onClose={vi.fn()} />)
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('renders nothing when message is empty', () => {
    const { container } = render(<Toast message="" type="info" onClose={vi.fn()} />)
    expect(container.querySelector('.toast')).not.toBeInTheDocument()
  })

  it('renders nothing when message is falsy', () => {
    const { container } = render(<Toast message={null} type="info" onClose={vi.fn()} />)
    expect(container.querySelector('.toast')).not.toBeInTheDocument()
  })

  it('shows success icon for success type', () => {
    render(<Toast message="Done" type="success" onClose={vi.fn()} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows error icon for error type', () => {
    render(<Toast message="Failed" type="error" onClose={vi.fn()} />)
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('shows info icon for info type', () => {
    render(<Toast message="Note" type="info" onClose={vi.fn()} />)
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })

  it('calls onClose when dismiss button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<Toast message="Test" type="info" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('auto-dismisses after duration', async () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<Toast message="Auto" type="info" onClose={onClose} duration={3000} />)

    expect(onClose).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3000)
    expect(onClose).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('has alert role for accessibility', () => {
    render(<Toast message="Alert" type="error" onClose={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies type-specific CSS class', () => {
    const { container } = render(<Toast message="Err" type="error" onClose={vi.fn()} />)
    expect(container.querySelector('.toast-error')).toBeInTheDocument()
  })
})
