# Message Board Contract API

## Contract: `message-board.clar`

### Public Functions

#### `post-message`
Post a new message to the board.

**Parameters:**
- `content` (string-utf8 280): Message content (1-280 characters)

**Returns:** `(response uint uint)`
- Success: Message ID
- Error codes: u103 (invalid input)

**Fee:** 0.00001 STX

**Example:**
```clarity
(contract-call? .message-board post-message u"Hello Bitchat!")
```

---

#### `pin-message`
Pin a message for extended visibility.

**Parameters:**
- `message-id` (uint): Message to pin
- `duration` (uint): Pin duration (144 for 24hr, 432 for 72hr)

**Returns:** `(response bool uint)`
- Success: true
- Error codes: u101 (not found), u102 (unauthorized), u103 (invalid input)

**Fees:**
- 24 hours: 0.00005 STX
- 72 hours: 0.0001 STX

**Requirements:**
- Sender must be message author
- Duration must be 144 or 432 blocks

**Example:**
```clarity
(contract-call? .message-board pin-message u0 u144)
```

---

#### `react-to-message`
React to a message (like/upvote).

**Parameters:**
- `message-id` (uint): Message to react to

**Returns:** `(response bool uint)`
- Success: true
- Error codes: u101 (not found), u105 (already reacted)

**Fee:** 0.000005 STX

**Requirements:**
- User cannot react to same message twice

**Example:**
```clarity
(contract-call? .message-board react-to-message u0)
```

---

### Read-Only Functions

#### `get-message`
Retrieve a message by ID.

**Parameters:**
- `message-id` (uint): Message identifier

**Returns:** `(optional {...})`
- Message data or none

#### `get-user-stats`
Get statistics for a user.

**Parameters:**
- `user` (principal): User address

**Returns:** `(optional {...})`
- User statistics or none

#### `get-total-messages`
Get total message count.

**Returns:** `(response uint uint)`

#### `get-total-fees-collected`
Get total fees collected by contract.

**Returns:** `(response uint uint)`

#### `get-message-nonce`
Get current message ID counter.

**Returns:** `(response uint uint)`

#### `has-user-reacted`
Check if user has reacted to a message.

**Parameters:**
- `message-id` (uint): Message identifier
- `user` (principal): User address

**Returns:** `bool`
- true if user has reacted, false otherwise

---

## Data Structures

### Message
```clarity
{
  author: principal,
  content: (string-utf8 280),
  timestamp: uint,
  block-height: uint,
  expires-at: uint,
  pinned: bool,
  pin-expires-at: uint,
  reaction-count: uint
}
```

### User Stats
```clarity
{
  messages-posted: uint,
  total-spent: uint,
  last-post-block: uint
}
```

### Reaction
```clarity
{
  reacted: bool
}
```

---

## Error Codes

- `u100`: Owner only
- `u101`: Not found
- `u102`: Unauthorized
- `u103`: Invalid input
- `u104`: Message expired
- `u105`: Already reacted

---

## Fee Summary

| Action | Fee (STX) | Fee (µSTX) |
|--------|-----------|-----------|
| Post Message | 0.00001 | 10,000 |
| Pin 24 Hours | 0.00005 | 50,000 |
| Pin 72 Hours | 0.0001 | 100,000 |
| React | 0.000005 | 5,000 |

---

## Transaction Types (Leaderboard Metrics)

The contract supports **3 distinct transaction types** for maximizing on-chain activity:

1. **post-message** - Core content creation
2. **pin-message** - Premium visibility feature
3. **react-to-message** - Engagement mechanism

All transactions generate fees tracked in `total-fees-collected`.

---

## Testing

### Running Tests

```bash
npm test
```

### Test Coverage

- ✅ Post message validation (length, fees, stats)
- ✅ Pin message authorization and fees
- ✅ Reaction duplicate prevention
- ✅ Read-only function accuracy
- ✅ Fee collection tracking
- ✅ User statistics updates

### Testnet Deployment

See [Testnet Deployment Guide](../deployments/deploy-testnet.md)

### Contract Address

**Testnet**: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2`
**Mainnet**: `[NOT YET DEPLOYED]`

**Testnet Explorer**: https://explorer.hiro.so/txid/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2?chain=testnet
