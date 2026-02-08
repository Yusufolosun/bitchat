# Complete Testnet Testing Guide - message-board-v2

**Contract Address**: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2`  
**Network**: Stacks Testnet  
**Explorer**: https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2?chain=testnet

---

## 📋 Contract Overview

### Public Functions (Write - Costs Gas)
1. `post-message` - Create a new message
2. `pin-message` - Pin your own message
3. `react-to-message` - React to any message

### Read-Only Functions (Read - FREE)
4. `get-message` - Fetch message details
5. `get-user-stats` - Get user statistics
6. `get-total-messages` - Total message count
7. `get-total-fees-collected` - Total fees (virtual for now)
8. `get-message-nonce` - Current message counter
9. `has-user-reacted` - Check if user reacted

---

## 🧪 Function 1: post-message

**Purpose**: Post a new message to the board

**Signature**: `(post-message (content (string-utf8 280)))`

### Parameters

| Parameter | Type | Min | Max | Description |
|-----------|------|-----|-----|-------------|
| `content` | string-utf8 | 1 char | 280 chars | Your message content |

### Validation Rules
- ✅ Content length: 1-280 characters
- ✅ UTF-8 encoding (emojis allowed!)
- ❌ Empty strings rejected → `(err u103)`
- ❌ >280 characters rejected → `(err u103)`

### Test Cases with Expected Results

#### ✅ Test 1: Basic Message
**Input**:
```
content: Hello from testnet!
```

**Expected Output**:
```clarity
(ok u0)
```
*Returns message ID 0 (first message)*

**Verification**:
- Check with `get-message u0`
- Should return message data with your content

---

#### ✅ Test 2: Message with Emojis
**Input**:
```
content: GM! ☀️ Testing BitChat 🚀
```

**Expected Output**:
```clarity
(ok u1)
```

---

#### ✅ Test 3: Maximum Length Message
**Input**:
```
content: Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit
```
*(Exactly 280 characters)*

**Expected Output**:
```clarity
(ok u2)
```

---

#### ✅ Test 4: Single Character
**Input**:
```
content: x
```

**Expected Output**:
```clarity
(ok u3)
```

---

#### ❌ Test 5: Empty Message (Error Case)
**Input**:
```
content: 
```
*(Empty string)*

**Expected Output**:
```clarity
(err u103)
```
*Error code 103 = ERR_INVALID_INPUT*

---

#### ❌ Test 6: Too Long Message (Error Case)
**Input**:
```
content: [281+ character string]
```

**Expected Output**:
```clarity
(err u103)
```

---

### How to Test on Explorer

1. **Open Contract**: https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2?chain=testnet

2. **Go to Functions Tab**

3. **Find `post-message`** under "Write Functions"

4. **Enter in content field**:
   ```
   Hello from testnet!
   ```
   *(No quotes needed in Explorer UI)*

5. **Click "Call Function"**

6. **Confirm in Hiro Wallet**

7. **Wait ~1-2 minutes** for confirmation

8. **Check result**: Should show `(ok u0)` or next message ID

---

## 🧪 Function 2: pin-message

**Purpose**: Pin your own message for extended visibility

**Signature**: `(pin-message (message-id uint) (duration uint))`

### Parameters

| Parameter | Type | Valid Values | Description |
|-----------|------|--------------|-------------|
| `message-id` | uint | Any existing message ID | Message to pin |
| `duration` | uint | `144` or `432` | Pin duration in blocks |

### Duration Values

| Value | Blocks | Time | Fee (Virtual) |
|-------|--------|------|---------------|
| `144` | 144 | ~24 hours | 0.00005 STX |
| `432` | 432 | ~72 hours | 0.0001 STX |

### Validation Rules
- ✅ Message must exist
- ✅ Sender must be message author
- ✅ Duration must be exactly `144` or `432`
- ❌ Cannot pin others' messages → `(err u102)`
- ❌ Invalid duration → `(err u103)`
- ❌ Non-existent message → `(err u101)`

### Test Cases with Expected Results

#### ✅ Test 1: Pin for 24 Hours
**Prerequisites**: You must have posted message ID 0

**Input**:
```
message-id: 0
duration: 144
```

**Expected Output**:
```clarity
(ok true)
```

**Verification**:
```clarity
(get-message u0)
→ Should show pinned: true, pin-expires-at: [block number]
```

---

#### ✅ Test 2: Pin for 72 Hours
**Prerequisites**: You must have posted message ID 1

**Input**:
```
message-id: 1
duration: 432
```

**Expected Output**:
```clarity
(ok true)
```

---

#### ❌ Test 3: Pin Someone Else's Message (Error)
**Prerequisites**: Message 0 was posted by another user

**Input**:
```
message-id: 0
duration: 144
```

**Expected Output**:
```clarity
(err u102)
```
*Error code 102 = ERR_UNAUTHORIZED*

---

#### ❌ Test 4: Invalid Duration (Error)
**Input**:
```
message-id: 0
duration: 100
```
*(Not 144 or 432)*

**Expected Output**:
```clarity
(err u103)
```

---

#### ❌ Test 5: Non-Existent Message (Error)
**Input**:
```
message-id: 999
duration: 144
```

**Expected Output**:
```clarity
(err u101)
```
*Error code 101 = ERR_NOT_FOUND*

---

### How to Test on Explorer

1. **First post a message** to get a message ID

2. **Find `pin-message`** under "Write Functions"

3. **Enter**:
   ```
   message-id: 0
   duration: 144
   ```

4. **Click "Call Function"**

5. **Confirm in wallet**

6. **Expected**: `(ok true)`

---

## 🧪 Function 3: react-to-message

**Purpose**: React to any message (like/upvote)

**Signature**: `(react-to-message (message-id uint))`

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `message-id` | uint | ID of message to react to |

### Validation Rules
- ✅ Message must exist
- ✅ Each user can react once per message
- ❌ Non-existent message → `(err u101)`
- ❌ Already reacted → `(err u105)`

### Test Cases with Expected Results

#### ✅ Test 1: First Reaction
**Prerequisites**: Message 0 exists

**Input**:
```
message-id: 0
```

**Expected Output**:
```clarity
(ok true)
```

**Verification**:
```clarity
(get-message u0)
→ Should show reaction-count: u1

(has-user-reacted u0 <your-address>)
→ Should return true
```

---

#### ✅ Test 2: React to Different Message
**Input**:
```
message-id: 1
```

**Expected Output**:
```clarity
(ok true)
```

---

#### ❌ Test 3: Duplicate Reaction (Error)
**Prerequisites**: You already reacted to message 0

**Input**:
```
message-id: 0
```

**Expected Output**:
```clarity
(err u105)
```
*Error code 105 = ERR_ALREADY_REACTED*

---

#### ❌ Test 4: React to Non-Existent Message
**Input**:
```
message-id: 999
```

**Expected Output**:
```clarity
(err u101)
```

---

### How to Test on Explorer

1. **Find `react-to-message`** under "Write Functions"

2. **Enter**:
   ```
   message-id: 0
   ```

3. **Click "Call Function"**

4. **Confirm in wallet**

5. **Expected**: `(ok true)` (first time), `(err u105)` (if already reacted)

---

## 📖 Function 4: get-message (Read-Only)

**Purpose**: Retrieve message details

**Signature**: `(get-message (message-id uint))`

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `message-id` | uint | ID of message to retrieve |

### Test Cases

#### ✅ Test 1: Get Existing Message
**Input**:
```
message-id: 0
```

**Expected Output**:
```clarity
(some {
  author: ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0,
  content: "Hello from testnet!",
  timestamp: u123456,
  block-height: u234567,
  expires-at: u234711,
  pinned: false,
  pin-expires-at: u0,
  reaction-count: u0
})
```

**Field Descriptions**:
- `author`: Principal who posted the message
- `content`: The message text (1-280 chars)
- `timestamp`: Bitcoin block height when posted
- `block-height`: Stacks block height when posted
- `expires-at`: Stacks block when message expires (24hr default)
- `pinned`: Boolean - is message currently pinned
- `pin-expires-at`: Block when pin expires (0 if not pinned)
- `reaction-count`: Total number of reactions

---

#### ✅ Test 2: Get Pinned Message
**Prerequisites**: Message 0 is pinned

**Input**:
```
message-id: 0
```

**Expected Output**:
```clarity
(some {
  author: ST...,
  content: "...",
  pinned: true,
  pin-expires-at: u234855,
  ...
})
```

---

#### ❌ Test 3: Non-Existent Message
**Input**:
```
message-id: 999
```

**Expected Output**:
```clarity
none
```

---

### How to Test on Explorer

1. **Find `get-message`** under "Read-Only Functions"

2. **Enter**:
   ```
   message-id: 0
   ```

3. **Click "Run"** (instant, no wallet needed!)

4. **Expected**: Message data or `none`

---

## 📖 Function 5: get-user-stats (Read-Only)

**Purpose**: Get statistics for a specific user

**Signature**: `(get-user-stats (user principal))`

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `user` | principal | User's wallet address |

### Test Cases

#### ✅ Test 1: Get Your Stats
**Input**:
```
user: ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0
```
*(Replace with YOUR address from Hiro Wallet)*

**Expected Output**:
```clarity
(some {
  messages-posted: u2,
  total-spent: u20000,
  last-post-block: u234567
})
```

**Field Descriptions**:
- `messages-posted`: Total messages posted by user
- `total-spent`: Total fees paid (in microSTX, virtual for now)
- `last-post-block`: Last block when user posted

---

#### ❌ Test 2: User with No Activity
**Input**:
```
user: ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
```
*(An address that hasn't interacted)*

**Expected Output**:
```clarity
none
```

---

### How to Test on Explorer

1. **Copy your wallet address** from Hiro Wallet

2. **Find `get-user-stats`** under "Read-Only Functions"

3. **Paste your address**:
   ```
   user: ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0
   ```

4. **Click "Run"**

5. **Expected**: Your stats or `none`

---

## 📖 Function 6: get-total-messages (Read-Only)

**Purpose**: Get total number of messages posted

**Signature**: `(get-total-messages)`

### Parameters
*None*

### Test Cases

#### ✅ Test 1: Get Total Count
**Input**: *None required*

**Expected Output**:
```clarity
(ok u3)
```
*If 3 messages have been posted*

**Verification**: This number should increment after each `post-message` call

---

### How to Test on Explorer

1. **Find `get-total-messages`** under "Read-Only Functions"

2. **Click "Run"** (no input needed)

3. **Expected**: `(ok uN)` where N is the count

---

## 📖 Function 7: get-total-fees-collected (Read-Only)

**Purpose**: Get virtual total fees collected

**Signature**: `(get-total-fees-collected)`

### Parameters
*None*

### Test Cases

#### ✅ Test 1: Get Fee Total
**Input**: *None required*

**Expected Output**:
```clarity
(ok u25000)
```

**Note**: Fees are currently **virtual** (not actually collected). The counter increments but no STX is transferred.

**Fee Amounts**:
- Post message: +10,000 microSTX
- Pin 24hr: +50,000 microSTX
- Pin 72hr: +100,000 microSTX
- Reaction: +5,000 microSTX

---

## 📖 Function 8: get-message-nonce (Read-Only)

**Purpose**: Get the next message ID that will be assigned

**Signature**: `(get-message-nonce)`

### Parameters
*None*

### Test Cases

#### ✅ Test 1: Get Current Nonce
**Input**: *None required*

**Expected Output**:
```clarity
(ok u3)
```

**Meaning**: The next `post-message` will create message ID `u3`

---

## 📖 Function 9: has-user-reacted (Read-Only)

**Purpose**: Check if a specific user has reacted to a message

**Signature**: `(has-user-reacted (message-id uint) (user principal))`

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `message-id` | uint | Message to check |
| `user` | principal | User address to check |

### Test Cases

#### ✅ Test 1: User Has Reacted
**Prerequisites**: You reacted to message 0

**Input**:
```
message-id: 0
user: ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0
```

**Expected Output**:
```clarity
true
```

---

#### ✅ Test 2: User Has Not Reacted
**Input**:
```
message-id: 0
user: ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
```

**Expected Output**:
```clarity
false
```

---

## 🎯 Complete Testing Workflow

Follow this sequence to test all functionality:

### Step 1: Post Your First Message
```
Function: post-message
Input: Hello from BitChat testnet!
Expected: (ok u0)
```

### Step 2: Verify the Message
```
Function: get-message (read-only)
Input: 0
Expected: (some {...}) with your content
```

### Step 3: Check Total Messages
```
Function: get-total-messages (read-only)
Expected: (ok u1)
```

### Step 4: React to Your Message
```
Function: react-to-message
Input: 0
Expected: (ok true)
```

### Step 5: Verify Reaction
```
Function: get-message (read-only)
Input: 0
Expected: reaction-count: u1
```

### Step 6: Check Reaction Status
```
Function: has-user-reacted (read-only)
Input: message-id=0, user=<your-address>
Expected: true
```

### Step 7: Pin Your Message
```
Function: pin-message
Input: message-id=0, duration=144
Expected: (ok true)
```

### Step 8: Verify Pin Status
```
Function: get-message (read-only)
Input: 0
Expected: pinned: true, pin-expires-at: <block-number>
```

### Step 9: Check Your Stats
```
Function: get-user-stats (read-only)
Input: <your-address>
Expected: {messages-posted: u1, total-spent: u65000, last-post-block: ...}
```

### Step 10: Post Second Message
```
Function: post-message
Input: This is my second message! 🚀
Expected: (ok u1)
```

### Step 11: Try Duplicate Reaction (Should Fail)
```
Function: react-to-message
Input: 0
Expected: (err u105) - Already reacted
```

### Step 12: Try Invalid Duration (Should Fail)
```
Function: pin-message
Input: message-id=1, duration=100
Expected: (err u103) - Invalid input
```

---

## 📊 Error Code Reference

| Code | Constant | Meaning | Common Causes |
|------|----------|---------|---------------|
| `u100` | ERR_OWNER_ONLY | Owner-only function | Not used in current contract |
| `u101` | ERR_NOT_FOUND | Message not found | Wrong message ID |
| `u102` | ERR_UNAUTHORIZED | Not authorized | Trying to pin others' messages |
| `u103` | ERR_INVALID_INPUT | Invalid input | Empty message, wrong duration, too long |
| `u104` | ERR_MESSAGE_EXPIRED | Message expired | Not used in current contract |
| `u105` | ERR_ALREADY_REACTED | Duplicate reaction | User already reacted to this message |

---

## 🔗 Quick Links

**Contract Explorer**:
```
https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2?chain=testnet
```

**View Your Transactions**:
```
https://explorer.hiro.so/address/<YOUR_ADDRESS>?chain=testnet
```

**Testnet Faucet** (Get STX for gas):
```
https://explorer.hiro.so/sandbox/faucet?chain=testnet
```

---

## 💡 Pro Testing Tips

1. **Test with Multiple Wallets**: Create 2-3 testnet addresses to test reactions and authorization

2. **Track Message IDs**: Keep a list of message IDs you create for testing

3. **Verify After Each Action**: Always use read-only functions to confirm state changes

4. **Test Error Cases**: Don't just test success - verify errors work as expected

5. **Check Explorer History**: Review all transactions in the contract's transaction history

6. **Monitor Block Heights**: Compare `expires-at` and `pin-expires-at` with current block

7. **Test Edge Cases**:
   - Empty message
   - 280-character message
   - Duplicate reactions
   - Invalid durations
   - Non-existent messages

---

## 🐛 Common Issues & Solutions

### Issue: Transaction Rejected
**Solution**: Ensure you have testnet STX for gas fees

### Issue: Message Not Found  
**Solution**: Check message ID - use `get-message-nonce` to see next ID

### Issue: ERR_UNAUTHORIZED
**Solution**: You can only pin your own messages

### Issue: ERR_INVALID_INPUT
**Solution**: Check message length (1-280) or duration (144/432)

### Issue: ERR_ALREADY_REACTED
**Solution**: Each user can only react once per message

---

## 📝 Test Result Template

Use this template to document your testing:

```markdown
### Test Session: [Date]

**Wallet Address**: ST...

#### Test 1: Post Message
- Input: "Hello testnet!"
- Expected: (ok u0)
- Actual: (ok u0)
- Status: ✅ PASS

#### Test 2: React to Message
- Input: message-id=0
- Expected: (ok true)
- Actual: (ok true)
- Status: ✅ PASS

[Continue for all tests...]

#### Summary
- Total Tests: 12
- Passed: 12
- Failed: 0
- Notes: All functions working as expected
```

---

**Happy Testing! 🎉**

If you encounter any unexpected behavior, document it with:
1. Function called
2. Exact input values
3. Expected output
4. Actual output
5. Transaction ID (from Explorer)
