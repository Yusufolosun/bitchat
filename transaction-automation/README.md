# Bitchat Transaction Automation

Automated transaction generator for the Bitchat message board smart contract on Stacks mainnet.

## 🎯 Purpose

This tool executes 40 automated transactions to the `message-board-v3` contract deployed at:
```
SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v3
```

## ⚠️ CRITICAL WARNINGS

- **REAL MONEY**: This executes transactions on **Stacks MAINNET** using **real STX**
- **IRREVERSIBLE**: Transactions cannot be undone once broadcasted
- **NON-REFUNDABLE**: Transaction fees are spent regardless of success/failure
- **SECURITY**: Never commit `.env` to git - it contains your private credentials
- **SEPARATE WALLET**: Do NOT use the contract deployer wallet

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd transaction-automation
npm install
```

### 2. Configure Environment

Copy the example configuration:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```env
# Use EITHER private key OR mnemonic
MNEMONIC=your twelve or twenty four word mnemonic phrase here
# or
PRIVATE_KEY=your64characterhexprivatekeyhere

# Configure function to call
FUNCTION_NAME=post-message

# For post-message
MESSAGE_TEMPLATE=Automated test message #{number}

# Transaction settings
TOTAL_TRANSACTIONS=40
MAX_BUDGET_STX=2.5
DELAY_BETWEEN_TX=5
NETWORK=mainnet
```

### 3. Test with Dry Run (RECOMMENDED)

Always test first without broadcasting transactions:
```bash
npm run dry-run
```

This will:
- ✅ Validate your configuration
- ✅ Check wallet balance
- ✅ Build all 40 transactions
- ✅ Calculate fees
- ❌ NOT broadcast to the network

### 4. Execute Live Transactions

Once dry-run succeeds:
```bash
npm start
```

⚠️ You'll have a 5-second countdown to cancel with `Ctrl+C`

### 5. Verify Transaction Status

After execution, check transaction confirmation status:
```bash
npm run verify
```

## 📋 Supported Functions

### post-message
Creates new messages on the message board.

**Configuration:**
```env
FUNCTION_NAME=post-message
MESSAGE_TEMPLATE=Your message template #{number}
```

The `#{number}` placeholder is replaced with: 1, 2, 3, ..., 40

**Example messages:**
- "Automated test message 1"
- "Automated test message 2"
- etc.

### pin-message
Pins existing messages on the board.

**Configuration:**
```env
FUNCTION_NAME=pin-message
PIN_MESSAGE_IDS=0,1,2,3,4,5,6,7,8,9
PIN_DURATION=144
```

**Notes:**
- Provide exactly 40 message IDs (or fewer if repeating is acceptable)
- `PIN_DURATION` is in blocks (144 blocks ≈ 24 hours)
- Messages must already exist on-chain

### react-to-message
Add reactions to existing messages.

**Configuration:**
```env
FUNCTION_NAME=react-to-message
REACT_MESSAGE_IDS=0,1,2,3,4,5,6,7,8,9
```

**Notes:**
- Provide message IDs to react to
- Messages must already exist on-chain

## 💰 Cost Estimation

**Estimated costs (approximate):**
- Post message: ~0.001 - 0.002 STX per transaction
- Pin message: ~0.001 - 0.002 STX per transaction
- React to message: ~0.001 - 0.002 STX per transaction

**For 40 transactions:**
- Typical cost: 0.04 - 0.08 STX
- Max budget: 2.5 STX (safety limit)

**Actual costs vary based on:**
- Network congestion
- Transaction complexity
- Stacks blockchain fee market

## 📁 Project Structure

```
transaction-automation/
├── .env                    # Your credentials (DO NOT COMMIT)
├── .env.example            # Configuration template
├── .gitignore              # Protects .env from git
├── package.json            # Dependencies and scripts
├── README.md               # This file
├── logs/                   # Transaction logs (auto-generated)
│   └── transactions-*.json
└── src/
    ├── config.js           # Configuration loader
    ├── utils.js            # Utility functions
    ├── transaction-generator.js  # Main script
    └── verify-transactions.js    # Verification script
```

## 🔒 Security Best Practices

### ✅ DO:
- Use a separate wallet from the contract deployer
- Keep `.env` secure and never share it
- Test with dry-run before live execution
- Verify you have sufficient STX balance
- Monitor transactions in Stacks Explorer
- Keep backups of transaction logs

### ❌ DON'T:
- Commit `.env` to version control
- Share your private key or mnemonic
- Use the contract deployer wallet
- Run without testing dry-run first
- Ignore error messages
- Delete transaction logs immediately

## 📊 Transaction Logs

All executions create detailed JSON logs in `logs/`:

```json
{
  "summary": {
    "total": 40,
    "successful": 40,
    "failed": 0,
    "network": "mainnet",
    "contractAddress": "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193",
    "contractName": "message-board-v3",
    "functionName": "post-message"
  },
  "transactions": [
    {
      "index": 1,
      "txId": "0x...",
      "status": "broadcasted",
      "explorerLink": "https://explorer.hiro.so/txid/...",
      "timestamp": "2026-02-10T..."
    }
  ]
}
```

## 🔧 Advanced Configuration

### Fee Multiplier
Adjust fee estimation multiplier (default: 1.2):
```env
FEE_MULTIPLIER=1.5
```

### Retry Settings
Configure retry behavior for failed broadcasts:
```env
MAX_RETRIES=3
RETRY_DELAY=5
```

### Custom API Endpoint
Use a different Stacks API endpoint:
```env
STACKS_API_URL=https://api.mainnet.hiro.so
```

### Network Selection
Switch between mainnet and testnet:
```env
NETWORK=mainnet  # or testnet
```

## 📖 Example Usage Scenarios

### Scenario 1: Create 40 Test Messages
```env
FUNCTION_NAME=post-message
MESSAGE_TEMPLATE=Load test message #{number} - timestamp 2026-02-10
TOTAL_TRANSACTIONS=40
DELAY_BETWEEN_TX=5
```

### Scenario 2: Pin Top 40 Messages
```env
FUNCTION_NAME=pin-message
PIN_MESSAGE_IDS=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39
PIN_DURATION=144
TOTAL_TRANSACTIONS=40
```

### Scenario 3: React to Messages
```env
FUNCTION_NAME=react-to-message
REACT_MESSAGE_IDS=5,10,15,20,25,30,35,40,45,50
TOTAL_TRANSACTIONS=40
```

## 🐛 Troubleshooting

### Error: "Invalid mnemonic phrase"
- Check that your mnemonic has 12 or 24 words
- Ensure no extra spaces or typos
- Words should be space-separated

### Error: "Insufficient balance"
- Check wallet balance: https://explorer.hiro.so
- Ensure you have at least 0.5 STX
- Consider reducing `MAX_BUDGET_STX`

### Error: "Missing required environment variables"
- Verify `.env` file exists
- Check all required variables are set
- Copy from `.env.example` if needed

### Transactions stuck in "pending"
- Wait 10-30 minutes for blockchain confirmation
- Check Stacks mempool status
- Run `npm run verify` to check status
- View in Explorer: https://explorer.hiro.so

### Rate limiting errors
- Increase `DELAY_BETWEEN_TX` to 10+ seconds
- Reduce `MAX_RETRIES`
- Use a custom API endpoint

## 📞 Support

- **Stacks Explorer**: https://explorer.hiro.so
- **Stacks API**: https://api.mainnet.hiro.so
- **Contract**: `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v3`

## ⚖️ License

MIT License - See main project LICENSE file

---

**Remember**: Always run `npm run dry-run` first! 🧪
