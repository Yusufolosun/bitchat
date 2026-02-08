import React from 'react'
import { useWallet } from '../hooks/useWallet'
import { formatAddress } from '../utils/formatters'
import './WalletConnect.css'

function WalletConnect() {
  const { isAuthenticated, address, connect, disconnect } = useWallet()

  if (isAuthenticated) {
    return (
      <div className="wallet-connect connected">
        <span className="wallet-address">{formatAddress(address)}</span>
        <button onClick={disconnect} className="btn btn-disconnect">
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="wallet-connect">
      <button onClick={connect} className="btn btn-connect">
        Connect Wallet
      </button>
    </div>
  )
}

export default WalletConnect
