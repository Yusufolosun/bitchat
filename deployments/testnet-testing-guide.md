# Testnet Contract Testing Guide

**Deployed Contract**: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board`  
**Network**: Stacks Testnet  
**Explorer**: https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet

---

## Prerequisites

1. **Get Testnet STX**:
   - Visit the [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet?chain=testnet)
   - Request testnet STX tokens for your wallet address

2. **Install Stacks CLI** (optional, for command-line testing):
   ```bash
   npm install -g @stacks/cli
   ```

3. **Connect Hiro Wallet**:
   - Install [Hiro Wallet](https://wallet.hiro.so/)
   - Switch to Testnet mode in settings
   - Ensure you have testnet STX

---

## Function Testing Examples

### 1. post-message

**Function Signature**:
```clarity
(define-public (post-message (message (string-utf8 500)) (duration uint)))
```

**Example Inputs**:

| Test Case | Message | Duration | Expected Result |
|-----------|---------|----------|-----------------|
| Valid post | "Hello, Stacks community!" | `u1` | Success (ok u1) |
| Long message | "This is a longer message that tests the character limit..." | `u24` | Success (ok u2) |
| Edge case | "x" | `u1` | Success (ok u3) |
| Too short | "" | `u1` | Error (err u400) - ERR_INVALID_MESSAGE |
| Too long | [501 character string] | `u1` | Error (err u400) - ERR_INVALID_MESSAGE |
| Invalid duration | "Valid message" | `u0` | Error (err u402) - ERR_INVALID_DURATION |
| Max duration | "Testing max duration" | `u168` | Success (ok u4) |
| Exceeded duration | "Too long duration" | `u169` | Error (err u402) - ERR_INVALID_DURATION |

**Using Stacks CLI**:
```bash
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name post-message \
  --function_args '["u\"Hello, Stacks!\"", "u1"]' \
  --fee 2000
```

**Expected Output** (Success):
```clarity
(ok u1)  ;; Returns message ID
```

**Transaction Details**:
- **Fee**: 0.00001 STX (platform fee) + network fee
- **Post Conditions**: STX transfer from sender to contract
- **Events**: `message-posted` event emitted

---

### 2. pin-message

**Function Signature**:
```clarity
(define-public (pin-message (message-id uint) (duration uint)))
```

**Example Inputs**:

| Test Case | Message ID | Duration | Expected Result |
|-----------|------------|----------|-----------------|
| Pin own message | `u1` | `u24` | Success (ok true) |
| Pin for 1 hour | `u1` | `u1` | Success (ok true) |
| Pin for max duration | `u1` | `u168` | Success (ok true) |
| Non-existent message | `u999` | `u24` | Error (err u404) - ERR_MESSAGE_NOT_FOUND |
| Pin others' message | `u1` | `u24` | Error (err u401) - ERR_UNAUTHORIZED |
| Invalid duration | `u1` | `u0` | Error (err u402) - ERR_INVALID_DURATION |
| Exceeded duration | `u1` | `u169` | Error (err u402) - ERR_INVALID_DURATION |

**Using Stacks CLI**:
```bash
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name pin-message \
  --function_args '["u1", "u24"]' \
  --fee 2000
```

**Expected Output** (Success):
```clarity
(ok true)
```

**Transaction Details**:
- **Fee**: 0.00005 STX (1-24 hours) or 0.0001 STX (24+ hours) + network fee
- **Post Conditions**: STX transfer from sender to contract
- **Events**: `message-pinned` event emitted

---

### 3. react-to-message

**Function Signature**:
```clarity
(define-public (react-to-message (message-id uint) (reaction (string-utf8 10))))
```

**Example Inputs**:

| Test Case | Message ID | Reaction | Expected Result |
|-----------|------------|----------|-----------------|
| Valid reaction | `u1` | "👍" | Success (ok true) |
| Heart reaction | `u1` | "❤️" | Success (ok true) |
| Text reaction | `u1` | "cool" | Success (ok true) |
| Max length reaction | `u1` | "1234567890" | Success (ok true) |
| Non-existent message | `u999` | "👍" | Error (err u404) - ERR_MESSAGE_NOT_FOUND |
| Empty reaction | `u1` | "" | Error (err u403) - ERR_INVALID_REACTION |
| Too long reaction | `u1` | "12345678901" | Error (err u403) - ERR_INVALID_REACTION |
| Duplicate reaction | `u1` | "👍" | Error (err u405) - ERR_DUPLICATE_REACTION |

**Using Stacks CLI**:
```bash
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name react-to-message \
  --function_args '["u1", "u\"👍\""]' \
  --fee 2000
```

**Expected Output** (Success):
```clarity
(ok true)
```

**Transaction Details**:
- **Fee**: 0.000005 STX + network fee
- **Post Conditions**: STX transfer from sender to contract
- **Events**: `reaction-added` event emitted

---

## Read-Only Functions

### 4. get-message

**Function Signature**:
```clarity
(define-read-only (get-message (message-id uint)))
```

**Example Inputs**:

| Test Case | Message ID | Expected Result |
|-----------|------------|-----------------|
| Existing message | `u1` | (some {author: ..., content: "Hello...", ...}) |
| Non-existent | `u999` | none |

**Using Stacks CLI**:
```bash
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-message \
  --function_args '["u1"]'
```

**Expected Output** (Success):
```clarity
(some {
  author: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
  content: "Hello, Stacks community!",
  timestamp: u1707350400,
  reactions: u0,
  pinned-until: none
})
```

---

### 5. get-user-stats

**Function Signature**:
```clarity
(define-read-only (get-user-stats (user principal)))
```

**Example Inputs**:

| Test Case | User | Expected Result |
|-----------|------|-----------------|
| Active user | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM` | {messages-posted: u5, total-reactions: u10} |
| New user | `ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG` | {messages-posted: u0, total-reactions: u0} |

**Using Stacks CLI**:
```bash
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-user-stats \
  --function_args '["ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"]'
```

**Expected Output**:
```clarity
{
  messages-posted: u3,
  total-reactions: u5
}
```

---

### 6. get-total-messages

**Function Signature**:
```clarity
(define-read-only (get-total-messages))
```

**Example Input**: None (no parameters)

**Using Stacks CLI**:
```bash
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-total-messages
```

**Expected Output**:
```clarity
u42  ;; Total number of messages posted
```

---

## Testing Workflow

### Complete Testing Scenario

**Step 1**: Post a message
```bash
# Post your first message
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name post-message \
  --function_args '["u\"My first message on BitChat!\"", "u24"]' \
  --fee 2000
```
**Expected**: `(ok u1)` - Message ID 1 created

---

**Step 2**: Verify the message
```bash
# Read the message back
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-message \
  --function_args '["u1"]'
```
**Expected**: Message data with your content

---

**Step 3**: React to the message
```bash
# Add a reaction
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name react-to-message \
  --function_args '["u1", "u\"👍\""]' \
  --fee 2000
```
**Expected**: `(ok true)` - Reaction added

---

**Step 4**: Pin the message
```bash
# Pin for 24 hours
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name pin-message \
  --function_args '["u1", "u24"]' \
  --fee 2000
```
**Expected**: `(ok true)` - Message pinned

---

**Step 5**: Check your stats
```bash
# Get user statistics
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-user-stats \
  --function_args '["<YOUR_PRINCIPAL>"]'
```
**Expected**: `{messages-posted: u1, total-reactions: u1}`

---

## Error Codes Reference

| Code | Constant | Description |
|------|----------|-------------|
| `u400` | ERR_INVALID_MESSAGE | Message too short (<1) or too long (>500) |
| `u401` | ERR_UNAUTHORIZED | Trying to pin someone else's message |
| `u402` | ERR_INVALID_DURATION | Duration is 0 or exceeds 168 hours |
| `u403` | ERR_INVALID_REACTION | Reaction too short (<1) or too long (>10) |
| `u404` | ERR_MESSAGE_NOT_FOUND | Message ID doesn't exist |
| `u405` | ERR_DUPLICATE_REACTION | User already reacted with this emoji |

---

## Frontend Testing

**Using Hiro Wallet + Frontend**:

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open http://localhost:5173 in your browser

3. Connect Hiro Wallet (ensure it's on testnet mode)

4. **Post a message**:
   - Enter message: "Testing from frontend!"
   - Select duration: 24 hours
   - Click "Post Message"
   - Approve transaction in Hiro Wallet
   - Wait for confirmation (~10 minutes)

5. **React to messages**:
   - Click reaction button on any message
   - Select emoji: 👍, ❤️, 🔥, etc.
   - Approve transaction
   - Wait for confirmation

6. **Pin your message**:
   - Find your message in the list
   - Click "Pin" button
   - Select duration
   - Approve transaction
   - Wait for confirmation

---

## Verification

**Check transactions on Explorer**:
- Visit: https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet
- View all contract calls
- Verify transaction status
- Check event logs

**Monitor contract state**:
```bash
# Check total messages
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-total-messages
```

---

## Sample Test Data

### Valid Messages (Copy/Paste Ready)

```
"Hello from the Stacks testnet!"
"BitChat is awesome! 🚀"
"Testing message pinning functionality"
"This is a longer message to test the character limits and ensure everything works as expected in production"
"GM! ☀️"
"Just deployed my first smart contract!"
"Web3 social is the future"
```

### Valid Reactions (Copy/Paste Ready)

```
"👍"
"❤️"
"🔥"
"😂"
"🎉"
"👀"
"💯"
"cool"
"nice"
"WAGMI"
```

### Test Principals (Testnet Addresses)

```
ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
ST3PF13W7Z0RRM42A8VZRVFQ75SV1K26RXEP8YGKJ
```

---

## Troubleshooting

**Issue**: Transaction fails with "Insufficient balance"
- **Solution**: Get more testnet STX from faucet

**Issue**: "Message not found" error
- **Solution**: Verify the message ID exists using `get-message`

**Issue**: "Unauthorized" error when pinning
- **Solution**: You can only pin your own messages

**Issue**: Transaction pending for too long
- **Solution**: Testnet can be slow; wait ~10-15 minutes or check explorer

**Issue**: CLI commands not working
- **Solution**: Ensure Stacks CLI is installed: `npm install -g @stacks/cli`

---

## Next Steps

1. **Test all functions** using the examples above
2. **Document any bugs** or unexpected behavior
3. **Test frontend integration** with real transactions
4. **Gather user feedback** from testnet testing
5. **Prepare for mainnet deployment** once testing is complete

---

**Happy Testing! 🚀**

For issues or questions, check the [Contract API Documentation](../docs/CONTRACT_API.md)
