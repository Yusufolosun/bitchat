# Bitchat

> **On-chain message board built on Stacks blockchain**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Stacks-Blockchain-5546FF)](https://www.stacks.co/)

---

## 📖 Overview

Bitchat is a fully decentralized message board where users can post messages, pin important content, and react to posts—all recorded permanently on the Stacks blockchain.

Every interaction generates a transaction fee, making this a fee-generating dApp built for the **Talent Protocol Stacks Builder Rewards** program.

---

## 🚀 Deployed Contract

**Testnet**: [`ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board`](https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet)

**Contract Functions**: See [Contract API Documentation](docs/CONTRACT_API.md)

---

## ✨ Features

- 📝 **Post Messages** — Share thoughts on-chain (0.00001 STX)
- 📌 **Pin Messages** — Highlight important content for 24-72 hours (0.00005-0.0001 STX)
- ❤️ **React to Messages** — Show appreciation (0.000005 STX)
- ⏰ **Time-based Expiry** — Pins automatically expire after duration
- 🏆 **User Stats** — Track total spending and engagement
- 📊 **Platform Analytics** — View total messages and fees collected

---

## 🛠️ Tech Stack

### Smart Contracts
- **Language:** Clarity
- **Blockchain:** Stacks Mainnet
- **Development:** Clarinet

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Wallet:** @stacks/connect
- **Blockchain:** @stacks/transactions

---

## 📁 Project Structure

```
bitchat/
│
├── contracts/
│   └── message-board.clar       # Main smart contract
│
├── tests/
│   └── message-board.test.ts    # Contract tests
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── WalletConnect.jsx
│   │   │   ├── PostMessage.jsx
│   │   │   ├── MessageCard.jsx
│   │   │   ├── MessageList.jsx
│   │   │   └── Stats.jsx
│   │   ├── hooks/               # Custom hooks
│   │   │   ├── useWallet.js
│   │   │   └── useMessages.js
│   │   ├── utils/               # Utilities
│   │   │   ├── contractCalls.js
│   │   │   ├── formatters.js
│   │   │   ├── network.js
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md                # Frontend documentation
│
├── docs/
│   └── CONTRACT_API.md          # Contract API reference
│
├── Clarinet.toml                # Clarinet configuration
├── package.json                 # Root dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Clarinet](https://docs.hiro.so/clarinet/installation)
- [Hiro Wallet](https://wallet.hiro.so/) (for testing)

### Smart Contract Development

```bash
# Check contract syntax
clarinet check

# Run contract tests
npm test

# Deploy to testnet
clarinet deploy --testnet
```

### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 💰 Fee Structure

| Action           | Fee (STX) | Fee (µSTX) | Description                    |
|------------------|-----------|------------|--------------------------------|
| Post Message     | 0.00001   | 10,000     | Create new message             |
| Pin (24 Hours)   | 0.00005   | 50,000     | Pin message for 1 day          |
| Pin (72 Hours)   | 0.0001    | 100,000    | Pin message for 3 days         |
| React            | 0.000005  | 5,000      | React to existing message      |

---

## 📊 Project Status

**🟢 Active Development**

- [x] Smart contracts developed and tested
- [x] Frontend application complete
- [x] Wallet integration implemented
- [x] Testnet deployment ✅
- [ ] Mainnet deployment
- [ ] Production launch

---

## 📚 Documentation

- 📘 [**Contract API Reference**](./docs/CONTRACT_API.md) — Complete contract documentation
- 📗 [**Frontend Guide**](./frontend/README.md) — Frontend setup and components

---

## 🔗 Links

- **Smart Contract:** [View on Explorer](#) *(Coming soon)*
- **Live App:** [bitchat.app](#) *(Coming soon)*
- **Talent Protocol:** [Builder Profile](#) *(Coming soon)*

---

## 👨‍💻 Development

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:report

# Watch mode
npm run test:watch
```

### Contract Deployment

See [Deployment Guide](deployments/deploy-testnet.md) for detailed instructions.

```bash
# Generate deployment plan
clarinet deployments generate --testnet --medium-cost

# Deploy to testnet (✅ DEPLOYED)
clarinet deployments apply --testnet

# Deploy to mainnet (when ready)
clarinet deployments apply --mainnet
```

**Testnet Contract**: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Powered by:
- [Stacks Blockchain](https://www.stacks.co/)
- [Hiro Clarinet](https://docs.hiro.so/clarinet)
- [React](https://react.dev/)
