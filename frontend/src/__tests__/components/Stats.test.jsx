import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Stats from '../../components/Stats'

describe('Stats', () => {
  it('renders total messages', () => {
    render(<Stats totalMessages={42} totalFees={5000000} isLoading={false} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders formatted fees in STX', () => {
    render(<Stats totalMessages={10} totalFees={1000000} isLoading={false} />)
    expect(screen.getByText('1.000000 STX')).toBeInTheDocument()
  })

  it('shows zero when totalMessages is null', () => {
    render(<Stats totalMessages={null} totalFees={null} isLoading={false} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0.000000 STX')).toBeInTheDocument()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(<Stats totalMessages={0} totalFees={0} isLoading={true} />)
    expect(container.querySelector('.skeleton-stats')).toBeInTheDocument()
  })

  it('does not render skeleton when not loading', () => {
    const { container } = render(<Stats totalMessages={0} totalFees={0} isLoading={false} />)
    expect(container.querySelector('.skeleton-stats')).not.toBeInTheDocument()
  })

  it('shows stat labels', () => {
    render(<Stats totalMessages={10} totalFees={0} isLoading={false} />)
    expect(screen.getByText('Total Messages')).toBeInTheDocument()
    expect(screen.getByText('Fees Generated')).toBeInTheDocument()
  })

  it('handles large fee values', () => {
    render(<Stats totalMessages={1} totalFees={999999999} isLoading={false} />)
    expect(screen.getByText('999.999999 STX')).toBeInTheDocument()
  })
})
