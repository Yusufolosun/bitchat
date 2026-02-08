# Bitchat Frontend

> **React application for the Bitchat on-chain message board**

---

## 📖 Overview

The Bitchat frontend is a modern React application that provides a beautiful, responsive interface for interacting with the Bitchat smart contract on the Stacks blockchain.

---

## ✨ Features

- 🔐 **Wallet Integration** — Seamless Stacks wallet connection
- 📝 **Post Messages** — Create messages directly on blockchain
- 📌 **Pin Messages** — Highlight important content
- ❤️ **React to Messages** — Engage with community posts
- 📊 **Live Statistics** — Real-time platform metrics
- 🎨 **Dark Theme** — Modern, sleek UI design

---

## 🛠️ Tech Stack

- **React** 18.3
- **Vite** 6.0 — Lightning-fast build tool
- **@stacks/connect** — Wallet authentication
- **@stacks/transactions** — Blockchain interactions

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Development

```bash
# Start development server (http://localhost:3000)
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

---

## ⚙️ Configuration

Before running the application, update the contract configuration in `src/utils/constants.js`:

```javascript
// Contract deployment details
export const CONTRACT_ADDRESS = 'YOUR_CONTRACT_ADDRESS_HERE'
export const CONTRACT_NAME = 'message-board'

// Network configuration
export const NETWORK = 'testnet' // or 'mainnet'
```

---

## 📁 Project Structure

```
frontend/
│
├── src/
│   ├── components/              # React components
│   │   ├── WalletConnect.jsx   # Wallet authentication
│   │   ├── PostMessage.jsx     # Message composition
│   │   ├── MessageCard.jsx     # Individual message
│   │   ├── MessageList.jsx     # Message feed
│   │   └── Stats.jsx           # Platform stats
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useWallet.js        # Wallet connection
│   │   └── useMessages.js      # Message management
│   │
│   ├── utils/                   # Utility functions
│   │   ├── contractCalls.js    # Contract interactions
│   │   ├── formatters.js       # Data formatting
│   │   ├── network.js          # Network config
│   │   └── constants.js        # App constants
│   │
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # App styles
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
│
├── public/                      # Static assets
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
└── .eslintrc.cjs               # ESLint config
```

---

## 🧩 Components

### `<App />`
Main application component that orchestrates all features.

### `<WalletConnect />`
Handles Stacks wallet authentication with connect/disconnect functionality.

### `<PostMessage />`
Message composition form with character count and validation.

### `<MessageCard />`
Displays individual messages with author, content, timestamp, and actions (pin, react).

### `<MessageList />`
Renders list of all messages with loading and empty states.

### `<Stats />`
Shows platform statistics including total messages and fees collected.

---

## 🪝 Custom Hooks

### `useWallet()`
Manages wallet connection state and authentication.

**Returns:**
- `isAuthenticated` — Boolean wallet status
- `address` — User's Stacks address
- `connect()` — Function to connect wallet
- `disconnect()` — Function to disconnect wallet
- `userSession` — Stacks user session object

### `useMessages()`
Manages message fetching and state.

**Returns:**
- `messages` — Array of message objects
- `isLoading` — Boolean loading state
- `refreshMessages()` — Function to refresh messages

---

## 🔧 Utilities

### `contractCalls.js`
- `postMessage(content, userSession)` — Post new message
- `pinMessage(messageId, duration24hr, userSession)` — Pin a message
- `reactToMessage(messageId, userSession)` — React to message

### `formatters.js`
- `formatAddress(principal)` — Shorten wallet addresses
- `microSTXToSTX(microStx)` — Convert µSTX to STX
- `timeAgo(timestamp)` — Format relative time

### `network.js`
- `getNetwork()` — Get Stacks network instance
- `getExplorerUrl(txId)` — Generate explorer URL

---

## 🎨 Styling

The application uses a custom dark theme with:
- **Primary Color:** Orange gradient (#ff6b00 → #ff8c00)
- **Background:** Dark (#0f0f0f)
- **CSS Modules:** Component-scoped styles
- **Responsive Design:** Mobile-first approach

---

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

---

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# The dist/ folder contains production-ready files
# Deploy to your preferred hosting service:
# - Vercel
# - Netlify
# - GitHub Pages
# - etc.
```

---

## 🔗 Related Documentation

- [Main Project README](../README.md)
- [Contract API Documentation](../docs/CONTRACT_API.md)

---

## 📄 License

MIT
