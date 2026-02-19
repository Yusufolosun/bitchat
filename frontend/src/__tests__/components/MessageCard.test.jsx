import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MessageCard from '../../components/MessageCard'

const baseMessage = {
  author: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
  content: 'Hello from Bitchat!',
  timestamp: Math.floor(Date.now() / 1000) - 60,
  pinned: false,
  reactionCount: 5,
}

describe('MessageCard', () => {
  it('renders message content', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByText('Hello from Bitchat!')).toBeInTheDocument()
  })

  it('renders shortened author address', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByText('SP1M46W6...DYG193')).toBeInTheDocument()
  })

  it('shows "You" badge when user is the author', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress="SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193"
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('does not show "You" badge for other users', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress="SP_OTHER_ADDRESS_HERE"
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.queryByText('You')).not.toBeInTheDocument()
  })

  it('shows pin badge for pinned messages', () => {
    const pinnedMessage = { ...baseMessage, pinned: true }
    render(
      <MessageCard
        message={pinnedMessage}
        messageId={1}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByText(/Pinned/)).toBeInTheDocument()
  })

  it('displays reaction count', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('calls onReact when react button is clicked', async () => {
    const user = userEvent.setup()
    const onReact = vi.fn()

    render(
      <MessageCard
        message={baseMessage}
        messageId={42}
        userAddress={null}
        onPin={vi.fn()}
        onReact={onReact}
      />
    )

    await user.click(screen.getByRole('button', { name: /react to message/i }))
    expect(onReact).toHaveBeenCalledWith(42)
  })

  it('shows pin button only for the author on unpinned messages', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress="SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193"
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByRole('button', { name: /pin this message/i })).toBeInTheDocument()
  })

  it('hides pin button for non-authors', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress="SP_OTHER"
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /pin this message/i })).not.toBeInTheDocument()
  })

  it('hides pin button when message is already pinned', () => {
    const pinnedMessage = { ...baseMessage, pinned: true }
    render(
      <MessageCard
        message={pinnedMessage}
        messageId={1}
        userAddress="SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193"
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.queryByRole('button', { name: /pin this message/i })).not.toBeInTheDocument()
  })

  it('has article role with accessible label', () => {
    render(
      <MessageCard
        message={baseMessage}
        messageId={1}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByRole('article')).toHaveAttribute(
      'aria-label',
      expect.stringContaining('SP1M46W6')
    )
  })

  it('sanitizes HTML in message content', () => {
    const xssMessage = { ...baseMessage, content: '<img onerror=alert(1)>Safe text' }
    render(
      <MessageCard
        message={xssMessage}
        messageId={1}
        userAddress={null}
        onPin={vi.fn()}
        onReact={vi.fn()}
      />
    )

    expect(screen.getByText('Safe text')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })
})
