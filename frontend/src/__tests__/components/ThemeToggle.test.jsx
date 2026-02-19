import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThemeToggle from '../../components/ThemeToggle'

describe('ThemeToggle', () => {
  it('shows sun icon in dark mode', () => {
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('☀️')
  })

  it('shows moon icon in light mode', () => {
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveTextContent('🌙')
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<ThemeToggle theme="dark" onToggle={onToggle} />)

    await user.click(screen.getByRole('button'))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('has accessible label mentioning target mode', () => {
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to light mode'
    )
  })

  it('label switches when theme changes', () => {
    render(<ThemeToggle theme="light" onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Switch to dark mode'
    )
  })
})
