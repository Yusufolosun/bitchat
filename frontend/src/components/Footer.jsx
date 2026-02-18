import React from 'react'
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from '../utils/constants'
import './Footer.css'

function Footer() {
  const contractPrincipal = `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`
  const explorerUrl = `https://explorer.hiro.so/txid/${contractPrincipal}?chain=${NETWORK}`

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-contract">
          <span className="footer-label">Contract</span>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link contract-link"
          >
            {contractPrincipal}
          </a>
        </div>
        <div className="footer-meta">
          <span className="footer-network">{NETWORK}</span>
          <a
            href="https://github.com/Yusufolosun/bitchat"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
