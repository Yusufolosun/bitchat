import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WalletConnect from '../../components/WalletConnect'

// Mock the useWallet hook
vi.mock('../../hooks/useWallet', () => ({
  useWallet: vi.fn(),
}))

import { useWallet } from '../../hooks/useWallet'

describe('WalletConnect', () => {
  it('shows connect button when not authenticated', () => {
    useWallet.mockReturnValue({
      isAuthenticated: false,
      address: null,
      network: 'mainnet',
      connect: vi.fn(),
      disconnect: vi.fn(),
    })

    render(<WalletConnect />)
    expect(screen.getByRole('button', { name: /connect stacks wallet/i })).toBeInTheDocument()
  })

  it('does not show disconnect button when not authenticated', () => {
    useWallet.mockReturnValue({
      isAuthenticated: false,
      address: null,
      network: 'mainnet',
      connect: vi.fn(),
      disconnect: vi.fn(),
    })

    render(<WalletConnect />)
    expect(screen.queryByRole('button', { name: /disconnect/i })).not.toBeInTheDocument()
  })

  it('shows address and disconnect when authenticated', () => {
    useWallet.mockReturnValue({
      isAuthenticated: true,
      address: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      network: 'mainnet',
      connect: vi.fn(),
      disconnect: vi.fn(),
    })

    render(<WalletConnect />)
    expect(screen.getByText('SP1M46W6...DYG193')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disconnect/i })).toBeInTheDocument()
  })

  it('does not show connect button when authenticated', () => {
    useWallet.mockReturnValue({
      isAuthenticated: true,
      address: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      network: 'mainnet',
      connect: vi.fn(),
      disconnect: vi.fn(),
    })

    render(<WalletConnect />)
    expect(screen.queryByRole('button', { name: /connect stacks wallet/i })).not.toBeInTheDocument()
  })

  it('calls connect when connect button is clicked', async () => {
    const user = userEvent.setup()
    const connect = vi.fn()
    useWallet.mockReturnValue({
      isAuthenticated: false,
      address: null,
      network: 'mainnet',
      connect,
      disconnect: vi.fn(),
    })

    render(<WalletConnect />)
    await user.click(screen.getByRole('button', { name: /connect stacks wallet/i }))
    expect(connect).toHaveBeenCalledOnce()
  })

  it('calls disconnect when disconnect button is clicked', async () => {
    const user = userEvent.setup()
    const disconnect = vi.fn()
    useWallet.mockReturnValue({
      isAuthenticated: true,
      address: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      network: 'mainnet',
      connect: vi.fn(),
      disconnect,
    })

    render(<WalletConnect />)
    await user.click(screen.getByRole('button', { name: /disconnect/i }))
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('shows network badge', () => {
    useWallet.mockReturnValue({
      isAuthenticated: true,
      address: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
      network: 'mainnet',
      connect: vi.fn(),
      disconnect: vi.fn(),
    })

    render(<WalletConnect />)
    expect(screen.getByText('mainnet')).toBeInTheDocument()
  })
})
