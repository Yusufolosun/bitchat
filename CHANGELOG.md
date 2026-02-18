# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Transaction status tracking via Stacks API polling (#15)
- Toast notification system for success/error feedback (#13)
- Clarity error code mapping (u100–u110) to user-friendly messages (#13)
- Message pagination with "Load older messages" button (#14)
- Footer component with contract address and explorer link (#25)
- Loading skeleton states for message list (#24)
- Accessibility attributes on interactive elements (#23)
- Responsive layout for mobile viewports (#21)
- ESLint and Prettier config for frontend (#27)
- CI pipeline with Clarinet check and vitest (#26)
- CONTRIBUTING.md (#28)
- MIT LICENSE file (#29)

### Changed
- Replaced `PostConditionMode.Allow` with strict `Deny` + explicit STX post conditions (#11)
- Migrated colour scheme from orange to Stacks-native purple palette (#12)
- Contract call functions now return txId via Promise (#15)
- Message list uses stable message IDs as React keys (#14)

### Fixed
- Wallet address resolution now uses correct network (#10)
- Stats component reads live data instead of hardcoded values (#9)
- useMessages hook fetches on-chain state instead of mock data (#8)

## [3.0.0] - 2026-02-08

### Added
- Mainnet deployment of `message-board-v3`
- Pin message functionality (24hr and 72hr tiers)
- Reaction system for messages
- Reply/threading support with reply counts
- Message editing with edit history tracking
- Message deletion with author-only access control
- Fee collection with owner withdrawal
- Contract pause/unpause mechanism
- Two-step ownership transfer
- Event logging on withdraw-fees

### Changed
- Spam prevention updated to 6-block cooldown (`min-post-gap`)
- Maximum message length set to 280 characters

## [2.0.0] - 2026-01-15

### Added
- Enhanced message metadata (edit count, reply-to, reply-count)
- User stats tracking (messages posted, total spent, last post block)
- Pinning with configurable duration in blocks

## [1.0.0] - 2025-12-01

### Added
- Initial message board contract
- Post message with fee
- Basic message retrieval by ID
- Total message count read-only function
