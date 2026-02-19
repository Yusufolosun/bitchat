import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostMessage from '../../components/PostMessage'

// Mock hooks and utils
vi.mock('../../hooks/useWallet', () => ({
  useWallet: vi.fn(),
}))

vi.mock('../../hooks/useCooldown', () => ({
  useCooldown: vi.fn(),
}))

vi.mock('../../utils/contractCalls', () => ({
  postMessage: vi.fn(),
}))

import { useWallet } from '../../hooks/useWallet'
import { useCooldown } from '../../hooks/useCooldown'
import { postMessage } from '../../utils/contractCalls'

describe('PostMessage', () => {
  const defaultWallet = {
    isAuthenticated: true,
    address: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
  }

  const defaultCooldown = {
    canPost: true,
    blocksRemaining: 0,
    minutesRemaining: 0,
    refresh: vi.fn(),
  }

  beforeEach(() => {
    useWallet.mockReturnValue(defaultWallet)
    useCooldown.mockReturnValue(defaultCooldown)
    postMessage.mockReset()
  })

  it('shows auth message when not connected', () => {
    useWallet.mockReturnValue({ isAuthenticated: false, address: null })
    useCooldown.mockReturnValue(defaultCooldown)

    render(<PostMessage />)
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument()
  })

  it('renders textarea when authenticated', () => {
    render(<PostMessage />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('disables submit button when textarea is empty', () => {
    render(<PostMessage />)
    const btn = screen.getByRole('button', { name: /post message/i })
    expect(btn).toBeDisabled()
  })

  it('enables submit button when textarea has content', async () => {
    const user = userEvent.setup()
    render(<PostMessage />)

    await user.type(screen.getByRole('textbox'), 'Hello!')
    const btn = screen.getByRole('button', { name: /post message/i })
    expect(btn).toBeEnabled()
  })

  it('shows character count', async () => {
    const user = userEvent.setup()
    render(<PostMessage />)

    await user.type(screen.getByRole('textbox'), 'Hi')
    expect(screen.getByText(/2\/280/)).toBeInTheDocument()
  })

  it('calls postMessage on submit', async () => {
    const user = userEvent.setup()
    postMessage.mockResolvedValue('tx123')

    render(
      <PostMessage
        onMessagePosted={vi.fn()}
        showToast={vi.fn()}
        onTxSubmitted={vi.fn()}
      />
    )

    await user.type(screen.getByRole('textbox'), 'Test message')
    await user.click(screen.getByRole('button', { name: /post message/i }))

    expect(postMessage).toHaveBeenCalledWith(
      'Test message',
      'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193'
    )
  })

  it('clears textarea after successful post', async () => {
    const user = userEvent.setup()
    postMessage.mockResolvedValue('tx123')

    render(
      <PostMessage
        onMessagePosted={vi.fn()}
        showToast={vi.fn()}
        onTxSubmitted={vi.fn()}
      />
    )

    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test message')
    await user.click(screen.getByRole('button', { name: /post message/i }))

    expect(textarea).toHaveValue('')
  })

  it('shows cooldown info when cooldown is active', () => {
    useCooldown.mockReturnValue({
      canPost: false,
      blocksRemaining: 3,
      minutesRemaining: 30,
      refresh: vi.fn(),
    })

    render(<PostMessage />)
    expect(screen.getByText(/cooldown.*min.*blocks/i)).toBeInTheDocument()
  })

  it('disables submit during cooldown', () => {
    useCooldown.mockReturnValue({
      canPost: false,
      blocksRemaining: 3,
      minutesRemaining: 30,
      refresh: vi.fn(),
    })

    render(<PostMessage />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('shows error toast on failed post', async () => {
    const user = userEvent.setup()
    const showToast = vi.fn()
    postMessage.mockRejectedValue(new Error('u108'))

    render(<PostMessage showToast={showToast} />)

    await user.type(screen.getByRole('textbox'), 'Test')
    await user.click(screen.getByRole('button', { name: /post message/i }))

    expect(showToast).toHaveBeenCalledWith(expect.any(String), 'error')
  })
})
