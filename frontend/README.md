# Bitchat Frontend

React-based frontend for the Bitchat on-chain message board.

## Features

- 🔐 Stacks wallet integration
- 📝 Post messages to blockchain
- 📌 Pin messages for visibility
- ❤️ React to messages
- 📊 Platform statistics

## Tech Stack

- React 18
- Vite
- @stacks/connect
- @stacks/transactions

## Development

```bash
cd frontend
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Update `src/utils/constants.js` with:
- Contract address after deployment
- Network (testnet/mainnet)

## Components

- **App** - Main application component
- **WalletConnect** - Wallet authentication
- **PostMessage** - Message composition form
- **MessageCard** - Individual message display
- **MessageList** - List of all messages
- **Stats** - Platform statistics

## Hooks

- **useWallet** - Wallet connection and authentication
- **useMessages** - Message fetching and management

## Utils

- **contractCalls** - Contract interaction functions
- **formatters** - Data formatting utilities
- **network** - Network configuration
- **constants** - Contract constants
