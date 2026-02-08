# Bitchat

> **On-chain message board built on Stacks blockchain — Now with enterprise-grade security!**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Stacks-Blockchain-5546FF)](https://www.stacks.co/)
[![Security: Enhanced](https://img.shields.io/badge/Security-Enhanced-green.svg)](docs/SECURITY_AUDIT.md)
[![Mainnet Ready: 85%](https://img.shields.io/badge/Mainnet_Ready-85%25-yellow.svg)](docs/V3_COMPLETION_SUMMARY.md)

---

## 📖 Overview

Bitchat is a fully decentralized message board where users can post messages, pin important content, and react to posts—all recorded permanently on the Stacks blockchain.

**Version 3** brings comprehensive security enhancements including spam prevention, emergency controls, working fee collection, and admin functionality for a production-ready platform.

Every interaction generates a transaction fee, making this a sustainable, fee-generating dApp built for the **Talent Protocol Stacks Builder Rewards** program.

---

## 🚀 Deployed Contracts

### Version 3 (Security Enhanced) — **🎉 LIVE ON TESTNET**

**Contract**: [`ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v3`](https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet)

- **Deployment Date**: February 8, 2026
- **Status**: ✅ **Testing Phase (7-14 days)**
- **Clarity Version**: 2 (Epoch 2.1+)
- **Security Features**: ✅ All Active
- **Mainnet Readiness**: **85-90%**

**🧪 Start Testing**: See [TESTNET_LIVE.md](TESTNET_LIVE.md) for quick testing guide

**📚 Full Documentation**:
- [Security Audit Report](docs/SECURITY_AUDIT.md)
- [V3 Completion Summary](docs/V3_COMPLETION_SUMMARY.md)
- [Testnet Results](docs/TESTNET_RESULTS.md)

### Version 2 (Previous Testnet)

**Contract**: [`ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2`](https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2?chain=testnet)
- Status: ⚠️ **Deprecated** (fees disabled, replaced by v3)
- Purpose: Initial testnet validation

### Mainnet Deployment

**Status**: 🚧 **Pending Testnet Validation**
- Expected: After 7-14 day testnet testing period
- See: [Mainnet Checklist](docs/MAINNET_CHECKLIST.md)

---

## ✨ Features

### Core Functionality
- 📝 **Post Messages** — Share thoughts on-chain (0.01 STX)
- 📌 **Pin Messages** — Highlight important content for 24-72 hours (0.05-0.10 STX)
- ❤️ **React to Messages** — Show appreciation (0.005 STX)
- ⏰ **Time-based Expiry** — Pins automatically expire after duration
- 🏆 **User Stats** — Track total spending and engagement
- 📊 **Platform Analytics** — View total messages and fees collected

### Security Features (v3) 🔒
- 🛡️ **Spam Prevention** — 6-block cooldown between posts per user
- ⏸️ **Emergency Pause** — Contract owner can pause/unpause operations
- 💰 **Fee Withdrawal** — Collected fees can be withdrawn by owner
- 👑 **Ownership Transfer** — Transferable ownership for DAO governance
- 📋 **Event Logging** — All major operations emit events for indexing
- ⏱️ **Pin Expiry Enforcement** — Expired pins automatically removed

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

## 💰 Fee Structure (v3)

| Action           | Fee (STX) | Fee (µSTX) | Description                    |
|------------------|-----------|------------|--------------------------------|
| Post Message     | 0.01      | 10,000     | Create new message             |
| Pin (24 Hours)   | 0.05      | 50,000     | Pin message for 144 blocks     |
| Pin (72 Hours)   | 0.10      | 100,000    | Pin message for 432 blocks     |
| React            | 0.005     | 5,000      | React to existing message      |

**Note**: Gas fees (~0.0001 STX) are additional and paid to miners.

---

## 📊 Project Status

**🟡 v3 Security Enhanced — Ready for Testing**

### Version History
- ✅ **v1**: Initial deployment (DEPRECATED - fee collection bug)
- ✅ **v2**: Testing version (fees disabled) — All functions verified working
- ✅ **v3**: Security enhanced (code complete) — Pending testnet deployment

### v3 Completion Status
- [x] Smart contract security audit (800+ lines)
- [x] All critical vulnerabilities fixed
- [x] Spam prevention implemented (6-block cooldown)
- [x] Emergency pause mechanism added
- [x] Fee collection fixed and working
- [x] Fee withdrawal functionality added
- [x] Ownership transfer capability added
- [x] Comprehensive test suite (65 test cases)
- [x] Complete documentation suite (3,000+ lines)
- [ ] Testnet deployment (v3)
- [ ] Community testing (7+ days)
- [ ] Frontend integration with v3
- [ ] Mainnet deployment

**Mainnet Readiness**: **85-90%**

---

## 📚 Documentation

### For Users
- 📗 [**User Guide**](./docs/USER_GUIDE.md) — How to use BitChat (FAQs, troubleshooting)
- 🧪 [**Community Testing Guide**](./docs/COMMUNITY_TESTING_GUIDE.md) — Help test v3!

### For Developers
- 📘 [**Contract API Reference**](./docs/CONTRACT_API.md) — Complete contract documentation
- 🔒 [**Security Audit Report**](./docs/SECURITY_AUDIT.md) — Comprehensive security analysis
- 🚀 [**Deployment Guide v3**](./docs/DEPLOYMENT_GUIDE_V3.md) — Testnet & mainnet deployment
- 📊 [**V3 Completion Summary**](./docs/V3_COMPLETION_SUMMARY.md) — What's new in v3
- 📗 [**Frontend Guide**](./frontend/README.md) — Frontend setup and components
- 📋 [**Testnet Testing Documentation**](./deployments/TESTNET_TESTING.md) — v2 testing results

---

## 🔗 Links

- **Smart Contract:** [View on Explorer](#) *(Coming soon)*
- **Live App:** [bitchat.app](#) *(Coming soon)*
- **Talent Protocol:** [Builder Profile](#) *(Coming soon)*

---

## 👨‍💻 Development

### Running Tests

---

## 🆕 What's New in v3

### Critical Fixes
- ✅ **Fee Collection Working**: Fixed `as-contract` implementation — fees now properly collected
- ✅ **Fee Withdrawal**: Contract owner can withdraw collected fees
- ✅ **Spam Prevention**: 6-block cooldown between posts prevents abuse

### New Security Features
- 🛡️ **Emergency Pause**: Owner can pause all operations in case of emergency
- 🔄 **Ownership Transfer**: Contract ownership can be transferred to DAO/multi-sig
- 📋 **Event Logging**: All operations emit events for off-chain indexing
- ⏱️ **Pin Expiry Validation**: `is-message-pinned` now enforces expiry timestamps

### New Functions
**Admin Functions** (owner-only):
- `withdraw-fees(amount, recipient)` — Withdraw collected STX
- `pause-contract()` — Emergency stop all operations
- `unpause-contract()` — Resume operations
- `transfer-ownership(new-owner)` — Transfer admin rights

**Read-Only Functions**:
- `is-contract-paused()` — Check pause status
- `get-contract-owner()` — Get current owner
- `is-message-pinned(message-id)` — Check pin status with expiry validation

### New Error Codes
- `u106` (err-too-soon) — Posted before cooldown expired
- `u107` (err-contract-paused) — Operation attempted while paused
- `u108` (err-insufficient-balance) — Withdrawal exceeds contract balance

See [V3 Completion Summary](docs/V3_COMPLETION_SUMMARY.md) for full details.

---

## 🔗 Links

- **v2 Testnet Contract:** [ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2](https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2?chain=testnet)
- **v3 Testnet Contract (LIVE):** [ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v3](https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet)
- **v3 Mainnet Contract**: Pending deployment (after testing)
- **Live App:** [bitchat.app](#) *(Coming soon)*
- **Talent Protocol:** [Builder Profile](#) *(Coming soon)*

---

## 👨‍💻 Development

### Running Tests

```bash
# Run all tests (28 existing + 37 edge cases = 65 total)
npm test

# Run specific test file
npm test -- edge-cases.test.ts

# Run with coverage
npm run test:report

# Watch mode
npm run test:watch
```

### Contract Validation

```bash
# Validate contract syntax and security
clarinet check

# Should output: ✓ contracts/message-board.clar (v3 - Security Enhanced)
```

### Contract Deployment

See [Deployment Guide v3](docs/DEPLOYMENT_GUIDE_V3.md) for detailed instructions.

```bash
# Generate deployment plan
clarinet deployments generate --testnet --medium-cost

# Deploy to testnet
clarinet deployments apply --testnet

# Deploy to mainnet (after thorough testing)
clarinet deployments apply --mainnet
```

**Deployed Contracts**:
- v2 (Current): `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2`
- v3: Pending deployment

---

## 🧪 Testing & Community

Want to help test BitChat v3? Check out our [Community Testing Guide](docs/COMMUNITY_TESTING_GUIDE.md)!

**Testing Rewards:**
- 🥉 Bronze Tester: 5+ scenarios completed
- 🥈 Silver Tester: 15+ scenarios + bug reports
- 🥇 Gold Tester: 25+ scenarios + multiple bugs
- 💎 Platinum Tester: All scenarios + critical bug found

Join the testing effort and earn rewards while helping make BitChat more secure!

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Powered by:
- [Stacks Blockchain](https://www.stacks.co/)
- [Hiro Clarinet](https://docs.hiro.so/clarinet)
- [React](https://react.dev/)
