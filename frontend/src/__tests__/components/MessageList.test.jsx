import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import MessageList from '../../components/MessageList'

const mockMessages = [
  {
    id: 2,
    author: 'SP_USER_A',
    content: 'Second message',
    timestamp: Math.floor(Date.now() / 1000) - 120,
    pinned: false,
    reactionCount: 3,
  },
  {
    id: 1,
    author: 'SP_USER_B',
    content: 'First message',
    timestamp: Math.floor(Date.now() / 1000) - 300,
    pinned: true,
    reactionCount: 10,
  },
]

describe('MessageList', () => {
  it('renders skeleton when loading', () => {
    const { container } = render(
      <MessageList
        messages={[]}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
        isLoading={true}
        isLoadingMore={false}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )
    expect(container.querySelector('.skeleton-card')).toBeInTheDocument()
  })

  it('shows empty state when no messages', () => {
    render(
      <MessageList
        messages={[]}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
        isLoading={false}
        isLoadingMore={false}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
  })

  it('renders all messages', () => {
    render(
      <MessageList
        messages={mockMessages}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
        isLoading={false}
        isLoadingMore={false}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )
    expect(screen.getByText('Second message')).toBeInTheDocument()
    expect(screen.getByText('First message')).toBeInTheDocument()
  })

  it('shows load more button when hasMore is true', () => {
    render(
      <MessageList
        messages={mockMessages}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
        isLoading={false}
        isLoadingMore={false}
        hasMore={true}
        onLoadMore={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /load older/i })).toBeInTheDocument()
  })

  it('hides load more button when hasMore is false', () => {
    render(
      <MessageList
        messages={mockMessages}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
        isLoading={false}
        isLoadingMore={false}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )
    expect(screen.queryByRole('button', { name: /load older/i })).not.toBeInTheDocument()
  })

  it('disables load more button while loading more', () => {
    render(
      <MessageList
        messages={mockMessages}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
        isLoading={false}
        isLoadingMore={true}
        hasMore={true}
        onLoadMore={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()
  })

  it('handles null messages gracefully', () => {
    render(
      <MessageList
        messages={null}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
        isLoading={false}
        isLoadingMore={false}
        hasMore={false}
        onLoadMore={vi.fn()}
      />
    )
    expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
  })
})
