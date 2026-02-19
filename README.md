# Bitchat

> Decentralized message board on Stacks blockchain

[![Mainnet](https://img.shields.io/badge/Mainnet-Live-green)](https://explorer.hiro.so)
[![Tests](https://img.shields.io/badge/tests-48%2F48%20passing-brightgreen)](tests/)
[![Security](https://img.shields.io/badge/security-audited-blue)](docs/SECURITY_AUDIT.md)
[![Clarity](https://img.shields.io/badge/Clarity-2-orange)](contracts/)

## Overview

Bitchat is a decentralized message board where users post messages, pin important content, and react to posts—all on the Stacks blockchain. Every interaction is permanent and censorship-resistant.

## Live on Mainnet

**Contract:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v3`  
**Explorer:** [View Contract](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v3?chain=mainnet)

## Features

### Core Functionality
- **Post messages** - Share thoughts on-chain (0.00001 STX)
- **Pin messages** - Highlight content for 24-72 hours (0.00005-0.0001 STX)
- **React to messages** - On-chain engagement (0.000005 STX)
- **User statistics** - Track participation and spending
- **Platform metrics** - Total messages and fees

### Security Features
- Emergency pause mechanism
- Fee withdrawal system (owner only)
- Spam prevention (6-block cooldown)
- Transferable ownership
- Event logging
- Pin expiry validation

## Tech Stack

**Smart Contract:**
- Clarity 2 (Epoch 2.1+)
- Stacks Mainnet
- 16 functions (7 public, 9 read-only)
- 48 comprehensive tests

**Frontend:**
- React 18
- Vite
- @stacks/connect
- @stacks/transactions

## Project Structure

```
bitchat/
├── contracts/
│   └── message-board.clar
├── tests/
│   ├── message-board.test.ts
│   └── edge-cases.test.ts
├── frontend/
│   └── src/
├── docs/
└── scripts/
```

## Getting Started

### For Users

1. Install a Stacks wallet (Hiro, Xverse, or Leather)
2. Get STX from an exchange
3. Visit contract on [Stacks Explorer](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v3?chain=mainnet)
4. Connect wallet and start posting

### For Developers

```bash
# Check contract
clarinet check

# Run tests
npm test

# Deploy to testnet
clarinet deployments generate --testnet
clarinet deployments apply --testnet

# Deploy to mainnet
./scripts/deploy-mainnet.sh
```

## Fee Structure

| Action | Fee (STX) | Fee (µSTX) |
|--------|-----------|-----------|
| Post Message | 0.00001 | 10,000 |
| Pin 24 Hours | 0.00005 | 50,000 |
| Pin 72 Hours | 0.0001 | 100,000 |
| React | 0.000005 | 5,000 |

## Contract Functions

### Public Functions
- `post-message` - Create a new message
- `pin-message` - Pin a message for visibility
- `react-to-message` - React to a message
- `withdraw-fees` - Withdraw collected fees (owner)
- `pause-contract` - Emergency pause (owner)
- `unpause-contract` - Resume operations (owner)
- `transfer-ownership` - Transfer contract ownership

### Read-Only Functions
- `get-message` - Get message data
- `get-user-stats` - Get user statistics
- `get-total-messages` - Get message count
- `get-total-fees-collected` - Get total fees
- `get-message-nonce` - Get next message ID
- `has-user-reacted` - Check reaction status
- `is-message-pinned` - Check pin status
- `is-contract-paused` - Check pause status
- `get-contract-owner` - Get owner address

## Security

**Audit Status:** Complete
- 15 vulnerabilities identified and fixed
- All critical and high-priority issues resolved
- See [SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)

**Testing:** 48/48 tests passing
- Unit tests for all functions
- Edge case coverage
- Security feature validation

## Documentation

- [Contract API](docs/CONTRACT_API.md) - Function reference
- [Security Audit](docs/SECURITY_AUDIT.md) - Security analysis
- [Deployment Guide](docs/DEPLOYMENT_GUIDE_V3.md) - Deploy instructions
- [User Guide](docs/USER_GUIDE.md) - How to use Bitchat

## Status

**Version:** 3.0  
**Mainnet:** Live ✅  
**Testnet:** Available for testing

## Links

- **Mainnet Contract:** [SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v3](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v3?chain=mainnet)
- **GitHub:** [github.com/Yusufolosun/bitchat](https://github.com/Yusufolosun/bitchat)

## Contributing

Contributions welcome! Please:
- Report bugs via GitHub Issues
- Submit feature requests
- Follow code style guidelines
- Include tests with PRs

## License

MIT License - See [LICENSE](LICENSE) for details

---

**Decentralized communication on Stacks blockchain** 
