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

---

## Error Codes

- `u100`: Owner only
- `u101`: Not found
- `u102`: Unauthorized
- `u103`: Invalid input
- `u104`: Message expired
