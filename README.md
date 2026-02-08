# Bitchat

> On-chain message board built on Stacks blockchain

## Overview

Bitchat is a decentralized message board where users post messages, pin important content, and react to posts—all on the Stacks blockchain.

## Features

- Post messages to global board (0.00001 STX)
- Pin messages for visibility (0.00005-0.0001 STX)
- React to messages (0.000005 STX)
- Automatic message expiry (24-72 hours)
- User leaderboard tracking
- Platform statistics (messages, fees)

## Tech Stack

**Smart Contracts:**
- Clarity
- Stacks Mainnet

**Frontend:**
- React 18
- Vite
- @stacks/connect
- @stacks/transactions

## Project Structure

\`\`\`
bitchat/
├── contracts/          # Clarity smart contracts
│   └── message-board.clar
├── tests/             # Contract tests
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── docs/              # Documentation
│   └── CONTRACT_API.md
├── Clarinet.toml      # Clarinet config
└── README.md
\`\`\`

## Getting Started

### Smart Contracts

\`\`\`bash
# Check contract syntax
clarinet check

# Run tests
npm test

# Deploy to testnet
clarinet deploy --testnet
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Fee Structure

| Action | Fee (STX) | Fee (µSTX) |
|--------|-----------|-----------|
| Post Message | 0.00001 | 10,000 |
| Pin 24 Hours | 0.00005 | 50,000 |
| Pin 72 Hours | 0.0001 | 100,000 |
| React | 0.000005 | 5,000 |

## Status

**Production Ready**

- [x] Smart contracts deployed
- [x] Frontend deployed  
- [x] Mainnet live
- [ ] Testnet testing
- [ ] Mainnet deployment

## Documentation

- [Contract API Documentation](./docs/CONTRACT_API.md)
- [Frontend README](./frontend/README.md)

## Links

- **Contract**: [View on Explorer](#)
- **Frontend**: [bitchat.app](#)
- **Talent Protocol**: [Builder Profile](#)

## License

MIT

---

Built for [Talent Protocol Stacks Builder Rewards](https://talentprotocol.com)
