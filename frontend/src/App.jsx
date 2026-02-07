import React from 'react'
import WalletConnect from './components/WalletConnect'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Bitchat</h1>
            <p>On-Chain Message Board</p>
          </div>
          <WalletConnect />
        </div>
      </header>
      <main className="app-main">
        {/* Message components will be added here */}
      </main>
    </div>
  )
}

export default App
