import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkeletonCard, SkeletonStats, SkeletonMessageList } from '../../components/Skeleton'

describe('SkeletonCard', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders skeleton lines', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelectorAll('.skeleton-line').length).toBeGreaterThan(0)
  })
})

describe('SkeletonStats', () => {
  it('renders with aria-hidden', () => {
    const { container } = render(<SkeletonStats />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders two stat items', () => {
    const { container } = render(<SkeletonStats />)
    expect(container.querySelectorAll('.skeleton-stat-item')).toHaveLength(2)
  })
})

describe('SkeletonMessageList', () => {
  it('renders default 4 skeleton cards', () => {
    const { container } = render(<SkeletonMessageList />)
    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(4)
  })

  it('renders custom count of skeleton cards', () => {
    const { container } = render(<SkeletonMessageList count={2} />)
    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(2)
  })

  it('has status role for loading indicator', () => {
    render(<SkeletonMessageList />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
