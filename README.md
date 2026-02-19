# Bitchat

> Decentralized message board on Stacks blockchain

[![Mainnet](https://img.shields.io/badge/Mainnet-Live-green)](https://explorer.hiro.so)
[![Tests](https://img.shields.io/badge/tests-204%20passing-brightgreen)](tests/)
[![Security](https://img.shields.io/badge/security-audited-blue)](docs/SECURITY_AUDIT.md)
[![Clarity](https://img.shields.io/badge/Clarity-2-orange)](contracts/)

## Overview

Bitchat is a decentralized message board where users post messages, pin important content, and react to posts—all on the Stacks blockchain. Every interaction is permanent and censorship-resistant.

## Live on Mainnet

**Contract:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4`  
**Explorer:** [View Contract](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4?chain=mainnet)

## Features

### Core Functionality
- **Post messages** — Share thoughts on-chain (0.01 STX fee)
- **Reply to messages** — Threaded conversations with parent tracking
- **Edit messages** — Update your posts with full edit history
- **Delete messages** — Author-only soft deletion
- **Pin messages** — Highlight content for 24h or 72h tiers
- **React to messages** — Basic likes and typed reactions (fire, laugh, etc.)
- **Display names** — Set a human-readable profile name
- **User statistics** — Track participation and spending
- **Platform metrics** — Total messages, edits, replies, deletions
- **Configurable fees** — Owner can adjust all fee parameters

### Security Features
- Emergency pause/unpause mechanism
- Fee withdrawal with explicit recipient
- Spam prevention (6-block cooldown)
- Two-step ownership transfer (propose → accept)
- Event logging on all state changes
- Pin expiry validation
- Message expiry detection

## Tech Stack

**Smart Contract:**
- Clarity 2 (Epoch 2.1+)
- Stacks Mainnet
- 47 functions (18 public, 29 read-only)
- 204 comprehensive tests across 3 test suites

**Frontend:**
- React 18
- Vite
- @stacks/connect
- @stacks/transactions

## Project Structure

```
bitchat/
├── contracts/
│   └── message-board-v4.clar
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
3. Visit contract on [Stacks Explorer](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4?chain=mainnet)
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
| Post Message | 0.01 | 10,000 |
| Reply to Message | 0.01 | 10,000 |
| Pin 24 Hours | 0.05 | 50,000 |
| Pin 72 Hours | 0.1 | 100,000 |
| React | 0.005 | 5,000 |
| Edit Message | Free | 0 |
| Delete Message | Free | 0 |
| Set Display Name | Free | 0 |

## Contract Functions

### Public Functions (18)
- `post-message` — Create a new message
- `reply-to-message` — Reply to an existing message
- `edit-message` — Edit your own message (preserves history)
- `delete-message` — Soft-delete your own message
- `pin-message` — Pin a message (24h or 72h tier)
- `react-to-message` — Basic like reaction
- `react-to-message-typed` — Typed reaction (fire, laugh, etc.)
- `set-display-name` — Set user profile name
- `set-fee-post-message` — Update post fee (owner)
- `set-fee-pin-24hr` — Update 24h pin fee (owner)
- `set-fee-pin-72hr` — Update 72h pin fee (owner)
- `set-fee-reaction` — Update reaction fee (owner)
- `withdraw-fees` — Withdraw collected fees (owner)
- `pause-contract` — Emergency pause (owner)
- `unpause-contract` — Resume operations (owner)
- `propose-ownership-transfer` — Initiate ownership transfer
- `accept-ownership` — Accept pending transfer
- `cancel-ownership-transfer` — Cancel pending transfer

### Read-Only Functions (29)
- `get-message` — Get message data by ID
- `get-user-stats` — Get user participation stats
- `get-total-messages` — Total message count
- `get-total-deleted` — Total deleted messages
- `get-total-edits` — Total edits across all messages
- `get-total-replies` — Total reply count
- `get-contract-stats` — Aggregated platform metrics
- `get-page-range` — Paginated message retrieval
- `get-reply-parent` — Get parent of a reply
- `is-reply` — Check if message is a reply
- `get-edit-history` — Get specific edit revision
- `get-total-fees-collected` — Total fees collected
- `get-message-nonce` — Next message ID
- `has-user-reacted` — Check if user reacted
- `get-user-reaction-type` — Get user's reaction type
- `get-reaction-count-by-type` — Count reactions by type
- `is-contract-paused` — Check pause status
- `get-contract-owner` — Get owner address
- `is-message-pinned` — Check pin status
- `is-message-deleted` — Check deletion status
- `is-message-expired` — Check message expiry
- `get-active-message` — Get non-deleted message
- `get-user-profile` — Get full user profile
- `get-display-name` — Get user display name
- `get-fee-post-message` — Current post fee
- `get-fee-pin-24hr` — Current 24h pin fee
- `get-fee-pin-72hr` — Current 72h pin fee
- `get-fee-reaction` — Current reaction fee

## Security

**Audit Status:** Complete
- 15 vulnerabilities identified and fixed
- All critical and high-priority issues resolved
- See [SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md)

**Testing:** 204/204 tests passing
- Core functionality tests (message-board.test.ts)
- Edge case coverage (edge-cases.test.ts)
- Mainnet readiness & security validation (mainnet-readiness.test.ts)

## Documentation

- [Contract API](docs/CONTRACT_API.md) — Complete function reference (v4)
- [Security Audit](docs/SECURITY_AUDIT.md) — Security analysis and remediation
- [User Guide](docs/USER_GUIDE.md) — How to use Bitchat
- [Post-Launch Monitoring](docs/POST_LAUNCH_MONITORING.md) — Operational runbook

## Status

**Version:** 4.0  
**Contract:** `message-board-v4` (942 lines)  
**Mainnet:** Live ✅

## Links

- **Mainnet Contract:** [SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4?chain=mainnet)
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
