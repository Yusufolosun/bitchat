# Manual Testing via Stacks Explorer

**Contract**: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board`  
**Network**: Testnet  
**Explorer Link**: https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet

---

## Prerequisites

1. **Install Hiro Wallet**: https://wallet.hiro.so/
2. **Switch to Testnet**: Settings → Network → Testnet
3. **Get Testnet STX**: https://explorer.hiro.so/sandbox/faucet?chain=testnet
   - Enter your wallet address
   - Request 500 STX (free testnet tokens)
   - Wait 30 seconds for confirmation

---

## Step-by-Step Testing Guide

### 🔗 Access the Contract

1. **Open Contract in Explorer**:
   ```
   https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet
   ```

2. **Navigate to Functions Tab**:
   - Click on the **"Functions"** tab
   - You'll see two sections:
     - **Write Functions** (require transactions)
     - **Read-Only Functions** (free queries)

---

## 📝 Test 1: Post a Message

**Function**: `post-message`

### Steps:

1. **Scroll to Write Functions** section
2. **Find `post-message`** in the list
3. **Click to expand** the function

### Input Fields:

| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `message` | string-utf8 500 | `Hello from Explorer!` | Your message (1-500 chars) |
| `duration` | uint | `24` | Hours to keep message (1-168) |

### How to Enter:

```
message: Hello from Explorer!
duration: 24
```

**Important**: Do NOT wrap strings in quotes in the Explorer UI. Just type the text directly.

### Execute:

4. **Click "Call Function"** button
5. **Hiro Wallet will pop up** asking for confirmation
6. **Review the transaction**:
   - Function: post-message
   - Fee: ~0.00001 STX + network fee
7. **Click "Confirm"** in wallet
8. **Wait for confirmation** (~30 seconds to 2 minutes)

### Expected Result:

- ✅ Transaction successful
- Returns: `(ok u1)` - This is your message ID
- Check the **Activity** tab to see transaction details

---

## 👍 Test 2: React to a Message

**Function**: `react-to-message`

### Steps:

1. **Find `react-to-message`** in Write Functions
2. **Click to expand**

### Input Fields:

| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `message-id` | uint | `1` | The message ID from Test 1 |
| `reaction` | string-utf8 10 | `👍` | Emoji or text (1-10 chars) |

### How to Enter:

```
message-id: 1
reaction: 👍
```

**Pro Tip**: You can copy/paste emojis directly:
- 👍 ❤️ 🔥 😂 🎉 👀 💯

### Execute:

3. **Click "Call Function"**
4. **Confirm in Hiro Wallet**
5. **Wait for confirmation**

### Expected Result:

- ✅ Transaction successful
- Returns: `(ok true)`
- Fee: ~0.000005 STX + network fee

---

## 📌 Test 3: Pin Your Message

**Function**: `pin-message`

### Steps:

1. **Find `pin-message`** in Write Functions
2. **Click to expand**

### Input Fields:

| Field | Type | Example Value | Description |
|-------|------|---------------|-------------|
| `message-id` | uint | `1` | Your message ID (you must own it) |
| `duration` | uint | `24` | Hours to pin (1-168) |

### How to Enter:

```
message-id: 1
duration: 24
```

### Execute:

3. **Click "Call Function"**
4. **Confirm in Hiro Wallet**
5. **Wait for confirmation**

### Expected Result:

- ✅ Transaction successful
- Returns: `(ok true)`
- Fee: ~0.00005 STX (for 1-24 hours) + network fee

**Fee Structure**:
- 1-24 hours: 0.00005 STX
- 24+ hours: 0.0001 STX

---

## 📖 Test 4: Read a Message (Free - No Transaction)

**Function**: `get-message`

### Steps:

1. **Scroll to Read-Only Functions** section
2. **Find `get-message`**
3. **Click to expand**

### Input Fields:

| Field | Type | Example Value |
|-------|------|---------------|
| `message-id` | uint | `1` |

### How to Enter:

```
message-id: 1
```

### Execute:

4. **Click "Run"** (no wallet confirmation needed - it's free!)

### Expected Result:

```clarity
(some {
  author: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM,
  content: "Hello from Explorer!",
  timestamp: u1707350400,
  reactions: u1,
  pinned-until: (some u1707437200)
})
```

**Fields Explained**:
- `author`: The principal who posted
- `content`: The message text
- `timestamp`: Unix timestamp when posted
- `reactions`: Total reaction count
- `pinned-until`: Expiration timestamp (or `none`)

---

## 📊 Test 5: Check Your Stats (Free - No Transaction)

**Function**: `get-user-stats`

### Steps:

1. **Find `get-user-stats`** in Read-Only Functions
2. **Click to expand**

### Input Fields:

| Field | Type | Example Value |
|-------|------|---------------|
| `user` | principal | Your wallet address |

### How to Enter:

**Get your address from Hiro Wallet** (starts with ST1, ST2, or ST3):

```
user: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
```

Replace with YOUR actual address from your wallet!

### Execute:

3. **Click "Run"**

### Expected Result:

```clarity
{
  messages-posted: u1,
  total-reactions: u0
}
```

---

## 🔢 Test 6: Get Total Messages (Free - No Transaction)

**Function**: `get-total-messages`

### Steps:

1. **Find `get-total-messages`** in Read-Only Functions
2. **Click to expand**
3. **No input required** - this function takes no parameters

### Execute:

4. **Click "Run"**

### Expected Result:

```clarity
u1
```

This shows the total number of messages posted to the contract.

---

## 🧪 Complete Testing Workflow

Follow these steps in order for a complete test:

### 1️⃣ Post Your First Message
```
Function: post-message
message: GM from the Stacks testnet! ☀️
duration: 24
```
→ Note the message ID returned (e.g., `u1`)

### 2️⃣ Verify the Message
```
Function: get-message (read-only)
message-id: 1
```
→ Confirm your message appears correctly

### 3️⃣ React to Your Message
```
Function: react-to-message
message-id: 1
reaction: 🔥
```

### 4️⃣ Verify Reaction Count
```
Function: get-message (read-only)
message-id: 1
```
→ Check that `reactions: u1`

### 5️⃣ Pin Your Message
```
Function: pin-message
message-id: 1
duration: 72
```

### 6️⃣ Verify Pin Status
```
Function: get-message (read-only)
message-id: 1
```
→ Check that `pinned-until: (some uXXXXXXXXX)`

### 7️⃣ Check Your Stats
```
Function: get-user-stats (read-only)
user: <YOUR_ADDRESS>
```
→ Should show `messages-posted: u1, total-reactions: u1`

### 8️⃣ Check Total Messages
```
Function: get-total-messages (read-only)
```
→ See total message count

---

## 🎨 Sample Test Data

### Messages to Try:
```
"Hello World! 🌍"
"BitChat is awesome"
"Testing the message board on Stacks testnet"
"GM! ☀️"
"This is my first smart contract interaction!"
"Web3 social is the future 🚀"
```

### Reactions to Try:
```
👍  ❤️  🔥  😂  🎉  👀  💯  🚀  ⭐  🙌
```

### Duration Examples:
```
1    - 1 hour
6    - 6 hours
24   - 1 day
72   - 3 days
168  - 7 days (maximum)
```

---

## ❌ Testing Error Cases

### Test Invalid Message (Too Short)
```
Function: post-message
message: (leave empty)
duration: 24
```
**Expected**: Transaction fails with `(err u400)` - ERR_INVALID_MESSAGE

### Test Invalid Duration
```
Function: post-message
message: Testing invalid duration
duration: 0
```
**Expected**: Transaction fails with `(err u402)` - ERR_INVALID_DURATION

### Test Pinning Someone Else's Message

**Note**: You'll need a second wallet/account for this test.

1. Post a message with Account A
2. Try to pin it with Account B
```
Function: pin-message (with Account B)
message-id: 1
duration: 24
```
**Expected**: Transaction fails with `(err u401)` - ERR_UNAUTHORIZED

### Test Duplicate Reaction

1. React to a message
2. Try to react with the same emoji again
```
Function: react-to-message
message-id: 1
reaction: 👍
```
**Second attempt Expected**: Transaction fails with `(err u405)` - ERR_DUPLICATE_REACTION

### Test Non-Existent Message
```
Function: get-message (read-only)
message-id: 999999
```
**Expected**: Returns `none`

---

## 📱 Viewing Transaction History

### Your Transactions:
1. **Click your wallet address** in the top-right of Explorer
2. Or visit: `https://explorer.hiro.so/address/<YOUR_ADDRESS>?chain=testnet`
3. See all your transactions in chronological order

### Contract Transactions:
1. Visit: https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet
2. Click **"Transactions"** tab
3. See all interactions with the contract

### Transaction Details:
Each transaction shows:
- ✅ Status (Success/Failure)
- 💰 Fee paid
- ⏰ Timestamp
- 📝 Function called
- 🔍 Arguments passed
- 📤 Return value
- 📊 Events emitted

---

## 🔍 Interpreting Results

### Success Responses:

| Function | Success Response |
|----------|-----------------|
| `post-message` | `(ok u1)` - Returns message ID |
| `react-to-message` | `(ok true)` |
| `pin-message` | `(ok true)` |
| `get-message` | `(some {...})` - Returns message data |
| `get-user-stats` | `{messages-posted: uX, total-reactions: uY}` |
| `get-total-messages` | `uN` - Total count |

### Error Responses:

| Error Code | Meaning |
|------------|---------|
| `(err u400)` | ERR_INVALID_MESSAGE - Message too short/long |
| `(err u401)` | ERR_UNAUTHORIZED - Not your message |
| `(err u402)` | ERR_INVALID_DURATION - Duration 0 or >168 |
| `(err u403)` | ERR_INVALID_REACTION - Reaction too short/long |
| `(err u404)` | ERR_MESSAGE_NOT_FOUND - Message doesn't exist |
| `(err u405)` | ERR_DUPLICATE_REACTION - Already reacted with this |

---

## 💡 Tips for Testing

1. **Wait for Confirmations**: Testnet can be slow. Give transactions 1-2 minutes.

2. **Check Wallet Balance**: Each transaction costs testnet STX. If low, request more from faucet.

3. **Use Read-Only First**: Before calling write functions, use `get-message` to check state.

4. **Copy Message IDs**: Keep track of message IDs from `post-message` responses.

5. **Test Incrementally**: Start with simple tests, then try edge cases.

6. **Check Transaction History**: If something fails, review the transaction in Explorer.

7. **Try Different Wallets**: Use multiple accounts to test authorization and reactions.

8. **Emoji Support**: The Explorer supports direct emoji input - just paste them in!

---

## ⚠️ Troubleshooting

### "Transaction Failed" in Wallet

**Possible Causes**:
- Insufficient testnet STX balance
- Invalid input parameters
- Contract validation failed (check error code)

**Solution**: Check the transaction on Explorer to see the error code.

### "Waiting for Transaction..." Stuck

**Solution**: Testnet can be slow. Wait 5 minutes, then refresh Explorer.

### "Cannot Find Contract"

**Solution**: Ensure you're on **Testnet** in both Hiro Wallet and Explorer.

### Wallet Not Connecting

**Solution**: 
1. Refresh the page
2. Disconnect and reconnect wallet in Hiro
3. Check that wallet is on Testnet network

---

## 🎯 Testing Checklist

- [ ] Post a message successfully
- [ ] Read the message back
- [ ] React to a message
- [ ] Pin your message
- [ ] Check your user stats
- [ ] Check total messages count
- [ ] Try posting a too-long message (error test)
- [ ] Try invalid duration (error test)
- [ ] Try reacting with same emoji twice (error test)
- [ ] Try reading non-existent message (returns none)
- [ ] Verify all transactions in history

---

## 🚀 Next Steps After Testing

1. ✅ **Share Your Results**: Document what worked and any issues found
2. 🐛 **Report Bugs**: If you find issues, create GitHub issues
3. 💡 **Suggest Features**: Ideas for improvements
4. 🌐 **Test Frontend**: Try the React app with the deployed contract
5. 📢 **Invite Others**: Share testnet link with friends to test multi-user scenarios

---

## 📚 Additional Resources

- **Contract Source Code**: [contracts/message-board.clar](../contracts/message-board.clar)
- **API Documentation**: [docs/CONTRACT_API.md](../docs/CONTRACT_API.md)
- **CLI Testing**: [testnet-testing-guide.md](testnet-testing-guide.md)
- **Quick Examples**: [quick-test-examples.md](quick-test-examples.md)

---

**Happy Testing! 🎉**

Contract Explorer: https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet
