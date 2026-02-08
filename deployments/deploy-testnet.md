# Testnet Deployment Guide

## Prerequisites

1. Install Stacks CLI:
```bash
npm install -g @stacks/cli
```

2. Create testnet wallet:
```bash
stx make_keychain -t
```

3. Get testnet STX from faucet:
- Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
- Enter your testnet address
- Request STX

## Deployment Steps

### 1. Verify Contract

```bash
clarinet check
npm test
```

### 2. Deploy Contract

```bash
clarinet deploy --testnet
```

Or manually:

```bash
stx deploy_contract contracts/message-board.clar message-board \
  -t \
  --private-key <YOUR_PRIVATE_KEY>
```

### 3. Note Contract Address

After deployment, save the contract principal:
```
Format: <deployer-address>.message-board
Example: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.message-board
```

### 4. Update Frontend Constants

Update `frontend/src/utils/constants.js`:

```javascript
export const CONTRACT_ADDRESS = 'YOUR_TESTNET_ADDRESS'
export const CONTRACT_NAME = 'message-board'
export const NETWORK = 'testnet'
```

## Verification

1. Check deployment on explorer:
   - https://explorer.hiro.so/?chain=testnet

2. Test contract functions:
```bash
stx call_contract \
  <CONTRACT_ADDRESS> \
  message-board \
  post-message \
  -t \
  --private-key <YOUR_KEY>
```

## Post-Deployment

1. Update README with contract address
2. Update docs/CONTRACT_API.md with deployed address
3. Test frontend integration
4. Monitor initial transactions
