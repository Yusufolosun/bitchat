# Quick Test Examples - BitChat Contract

**Contract**: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board`  
**Network**: Testnet

---

## 🚀 Quick CLI Tests

### 1. Post a Message

```bash
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name post-message \
  --function_args '["u\"Hello Stacks!\"", "u24"]' \
  --fee 2000
```
**Returns**: `(ok u1)` - Message ID

---

### 2. React to Message

```bash
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name react-to-message \
  --function_args '["u1", "u\"👍\""]' \
  --fee 2000
```
**Returns**: `(ok true)`

---

### 3. Pin Message (24 hours)

```bash
stacks call_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name pin-message \
  --function_args '["u1", "u24"]' \
  --fee 2000
```
**Returns**: `(ok true)`

---

### 4. Get Message (Read-Only)

```bash
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-message \
  --function_args '["u1"]'
```
**Returns**: Message data

---

### 5. Get User Stats (Read-Only)

```bash
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-user-stats \
  --function_args '["<YOUR_PRINCIPAL>"]'
```
**Returns**: `{messages-posted: uX, total-reactions: uY}`

---

### 6. Get Total Messages (Read-Only)

```bash
stacks call_read_only_contract_func \
  --network testnet \
  --contract_address ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 \
  --contract_name message-board \
  --function_name get-total-messages
```
**Returns**: `uN` - Total count

---

## 📊 Test Data

### Sample Messages
```
"Hello from testnet!"
"GM! ☀️"
"BitChat rocks! 🚀"
"Testing the message board"
```

### Sample Reactions
```
"👍"  "❤️"  "🔥"  "😂"  "🎉"
```

### Duration Examples
```
u1   - 1 hour
u24  - 24 hours (1 day)
u72  - 72 hours (3 days)
u168 - 168 hours (7 days, max)
```

---

## 🔍 Verify on Explorer

**Contract Explorer**:  
https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board?chain=testnet

**Your Transactions**:  
https://explorer.hiro.so/address/<YOUR_ADDRESS>?chain=testnet

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| `u400` | Invalid message (too short/long) |
| `u401` | Unauthorized (not your message) |
| `u402` | Invalid duration (0 or >168) |
| `u403` | Invalid reaction (too short/long) |
| `u404` | Message not found |
| `u405` | Duplicate reaction |

---

## 💰 Fee Structure

- **Post Message**: 0.00001 STX + network fee
- **Pin (1-24h)**: 0.00005 STX + network fee
- **Pin (24h+)**: 0.0001 STX + network fee
- **React**: 0.000005 STX + network fee

---

**Need more details?** See [Full Testing Guide](testnet-testing-guide.md)
