# Testnet Deployment Guide

## Prerequisites

1. **Get testnet STX from faucet:**
   - Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
   - Create or use existing Stacks wallet
   - Request testnet STX (you'll need this for deployment fees)

2. **Save your mnemonic (seed phrase)**
   - You'll need your 12/24-word recovery phrase
   - Keep it secure and never commit it to git

## Deployment Steps

### 1. Configure Testnet Settings

**Option A: Use Encrypted Mnemonic (Recommended)**

```bash
# Encrypt your mnemonic with a password
clarinet deployments encrypt

# Follow prompts:
# - Enter your 12/24-word seed phrase
# - Enter a password to encrypt it
# - Copy the encrypted output
```

Then update `settings/Testnet.toml` with the encrypted mnemonic - look for the section with instructions for encrypted mnemonics.

**Option B: Use Plain Mnemonic (Not Recommended for Production)**

Update `settings/Testnet.toml`:
```toml
[accounts.deployer]
mnemonic = "word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
```

⚠️ **Important:** Never commit your actual mnemonic to git! The file is already in `.gitignore` by default.

### 2. Verify Contract

```bash
clarinet check
npm test
```

### 3. Generate Deployment Plan

```bash
clarinet deployments generate --testnet --medium-cost
```

**Cost Strategy Options:**
- `--low-cost` - Minimize transaction fees (slower confirmation)
- `--medium-cost` - Balanced fees and speed (recommended)
- `--high-cost` - Higher fees for faster confirmation
- `--manual-cost` - Specify custom fee rate

You'll be prompted to enter the decryption password for your encrypted mnemonic.

This creates `deployments/default.testnet-plan.yaml` with deployment configuration.

### 4. Deploy to Testnet

```bash
clarinet deployments apply --testnet
```

You'll be prompted to enter the decryption password again.

**Expected Output:**
- Contract deployment transaction broadcast
- Transaction ID displayed
- Contract principal address shown

**Note:** The apply command uses the cost strategy from the generated plan. If you want to regenerate with a different cost strategy, run step 3 again with a different flag.

### 5. Note Contract Address

After successful deployment, save the contract principal:
```
Format: <deployer-address>.message-board
Example: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.message-board
```
Format: <deployer-address>.message-board
Example: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.message-board
```

### 6. Update Frontend Constants

Update `frontend/src/utils/constants.js`:

```javascript
export const CONTRACT_ADDRESS = 'YOUR_TESTNET_ADDRESS'
export const CONTRACT_NAME = 'message-board'
export const NETWORK = 'testnet'
```

## Verification

1. **Check deployment on explorer:**
   - https://explorer.hiro.so/?chain=testnet
   - Search for your contract address or transaction ID

2. **View deployment plan:**
   ```bash
   cat deployments/default.testnet-plan.yaml
   ```

3. **Check deployment status:**
   ```bash
   clarinet deployments check --testnet
   ```

## Troubleshooting

### Cost Strategy Not Specified
```
error: cost strategy not specified (--low-cost, --medium-cost, --high-cost, --manual-cost)
```
**Solution:** Add a cost strategy flag to the generate command. Use `--medium-cost` for balanced fees:
```bash
clarinet deployments generate --testnet --medium-cost
```

### Invalid Mnemonic Error
```
error: mnemonic is invalid: mnemonic has an invalid word count
```
**Solution:** Ensure your mnemonic in `settings/Testnet.toml` is a valid 12 or 24-word phrase.

### Insufficient Balance
```
error: insufficient balance for deployment
```
**Solution:** Get testnet STX from the faucet (step 1).

### Contract Already Exists
If contract already exists at this address, you'll need to either:
- Use a different deployer address
- Deploy with a different contract name

## Post-Deployment Checklist

- [x] Contract address recorded
- [x] Frontend constants updated
- [x] Contract verified on explorer
- [ ] Initial test transaction successful
- [x] Update README.md with contract address
- [x] Update docs/CONTRACT_API.md with deployed address

## Testing Your Deployed Contract

Now that your contract is deployed, test all functions to ensure they work correctly:

**Quick Start Testing**:
- 📋 [Quick Test Examples](quick-test-examples.md) - Copy/paste CLI commands
- 📖 [Complete Testing Guide](testnet-testing-guide.md) - Detailed examples with expected outputs

**Testing Workflow**:
1. Get testnet STX from [Stacks Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
2. Install Stacks CLI: `npm install -g @stacks/cli`
3. Run test commands from the quick examples guide
4. Verify transactions on [Explorer](https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet)

**Test Functions**:
- ✅ `post-message` - Post a test message
- ✅ `react-to-message` - Add reactions
- ✅ `pin-message` - Pin your message
- ✅ `get-message` - Read message data
- ✅ `get-user-stats` - Check your stats
- ✅ `get-total-messages` - Get message count

## Alternative: Manual Deployment with Stacks CLI

If you prefer using Stacks CLI directly:

```bash
# Install Stacks CLI
npm install -g @stacks/cli

# Deploy contract
stx deploy_contract contracts/message-board.clar message-board \
  -t \
  --mnemonic "your twelve word seed phrase here"
```

## Next Steps

1. Test contract functions on testnet
2. Update frontend to use deployed contract
3. Deploy frontend to hosting service (Vercel/Netlify)
4. Monitor initial user transactions
5. Prepare for mainnet deployment
