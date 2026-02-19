import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Footer from '../../components/Footer'

describe('Footer', () => {
  it('renders the contract principal', () => {
    render(<Footer />)
    expect(
      screen.getByText(/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193\.message-board-v4/)
    ).toBeInTheDocument()
  })

  it('links to the explorer', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    const explorerLink = links.find((l) => l.href.includes('explorer.hiro.so'))
    expect(explorerLink).toBeDefined()
  })

  it('links to the GitHub repo', () => {
    render(<Footer />)
    const githubLink = screen.getByText('GitHub')
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Yusufolosun/bitchat')
  })

  it('shows the network name', () => {
    render(<Footer />)
    expect(screen.getByText('mainnet')).toBeInTheDocument()
  })

  it('uses noopener noreferrer on external links', () => {
    render(<Footer />)
    const links = screen.getAllByRole('link')
    links.forEach((link) => {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
