# Bitchat Contract API Reference

Complete API documentation for the Bitchat message board smart contract on the Stacks blockchain.

## Contract Information

| Field | Value |
|-------|-------|
| **Contract Name** | `message-board-v4` |
| **Network** | Stacks Mainnet |
| **Contract Address** | `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4` |
| **Clarity Version** | 2 |
| **Max Message Length** | 280 characters (UTF-8) |
| **Default Expiry** | 144 blocks (~24 hours) |

## Table of Contents

- [Public Functions](#public-functions)
  - [post-message](#post-message)
  - [pin-message](#pin-message)
  - [react-to-message](#react-to-message)
  - [react-to-message-typed](#react-to-message-typed)
  - [reply-to-message](#reply-to-message)
  - [edit-message](#edit-message)
  - [delete-message](#delete-message)
  - [set-display-name](#set-display-name)
- [Owner Functions](#owner-functions)
  - [withdraw-fees](#withdraw-fees)
  - [pause-contract / unpause-contract](#pause-contract--unpause-contract)
  - [propose-ownership-transfer](#propose-ownership-transfer)
  - [accept-ownership](#accept-ownership)
  - [cancel-ownership-transfer](#cancel-ownership-transfer)
  - [Fee Setters](#fee-setters)
- [Read-Only Functions](#read-only-functions)
  - [get-message](#get-message)
  - [get-active-message](#get-active-message)
  - [is-message-expired](#is-message-expired)
  - [is-message-pinned](#is-message-pinned)
  - [is-message-deleted](#is-message-deleted)
  - [get-user-stats](#get-user-stats)
  - [get-user-profile](#get-user-profile)
  - [get-display-name](#get-display-name)
  - [get-total-messages](#get-total-messages)
  - [get-total-deleted](#get-total-deleted)
  - [get-total-edits](#get-total-edits)
  - [get-total-replies](#get-total-replies)
  - [get-total-fees-collected](#get-total-fees-collected)
  - [get-message-nonce](#get-message-nonce)
  - [get-contract-stats](#get-contract-stats)
  - [get-page-range](#get-page-range)
  - [has-user-reacted](#has-user-reacted)
  - [get-user-reaction-type](#get-user-reaction-type)
  - [get-reaction-count-by-type](#get-reaction-count-by-type)
  - [get-reply-parent / is-reply](#get-reply-parent--is-reply)
  - [get-edit-history](#get-edit-history)
  - [is-contract-paused](#is-contract-paused)
  - [get-contract-owner](#get-contract-owner)
  - [get-proposed-owner](#get-proposed-owner)
  - [Fee Getters](#fee-getters)
- [Data Structures](#data-structures)
- [Error Codes](#error-codes)
- [Constants](#constants)
- [Fee Structure](#fee-structure)
- [Integration Guide](#integration-guide)

---

## Public Functions

### post-message

Posts a new message to the board. Requires a fee payment in STX.

**Signature:**
```clarity
(define-public (post-message (content (string-utf8 280))))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `content` | `(string-utf8 280)` | Message content, 1-280 UTF-8 characters |

**Returns:** `(response uint uint)` -- the new message ID on success

**Behavior:**
- Validates content length (1-280 characters)
- Enforces spam cooldown (6 blocks between posts per user)
- Charges the current `fee-post-message` (default 10,000 uSTX)
- Sets expiry to `block-height + 144` (~24 hours by default)
- Increments `total-messages`, `message-nonce`, and the user's `messages-posted`
- Contract must not be paused

**Example (JavaScript):**
```javascript
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV } from '@stacks/transactions';

await openContractCall({
  contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
  contractName: 'message-board-v4',
  functionName: 'post-message',
  functionArgs: [stringUtf8CV('Hello Bitchat!')],
  postConditionMode: 0x01,
  onFinish: (data) => console.log('TX:', data.txId),
});
```

---

### pin-message

Pins an existing message. Only the message author or contract owner can pin.

**Signature:**
```clarity
(define-public (pin-message (message-id uint) (duration uint)))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `message-id` | `uint` | ID of the message to pin |
| `duration` | `uint` | `u144` for 24 hours, `u432` for 72 hours |

**Returns:** `(response bool uint)`

**Fees:**
- 24-hour pin (`u144`): `fee-pin-24hr` (default 50,000 uSTX)
- 72-hour pin (`u432`): `fee-pin-72hr` (default 100,000 uSTX)

---

### react-to-message

Reacts to a message with a default "like" reaction (type 1). Each user can react once per message.

**Signature:**
```clarity
(define-public (react-to-message (message-id uint)))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `message-id` | `uint` | ID of the message to react to |

**Returns:** `(response bool uint)`

**Fee:** `fee-reaction` (default 5,000 uSTX)

---

### react-to-message-typed

Reacts to a message with a specific reaction type. Each user can react once per message.

**Signature:**
```clarity
(define-public (react-to-message-typed (message-id uint) (rtype uint)))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `message-id` | `uint` | ID of the message to react to |
| `rtype` | `uint` | Reaction type: `u1`=like, `u2`=fire, `u3`=laugh, `u4`=sad, `u5`=dislike |

**Returns:** `(response bool uint)`

**Fee:** `fee-reaction` (default 5,000 uSTX)

**Example:**
```javascript
import { uintCV } from '@stacks/transactions';

// React with "fire" to message #5
await openContractCall({
  contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
  contractName: 'message-board-v4',
  functionName: 'react-to-message-typed',
  functionArgs: [uintCV(5), uintCV(2)],
  postConditionMode: 0x01,
  onFinish: (data) => console.log('TX:', data.txId),
});
```

---

### reply-to-message

Posts a reply to an existing message. Creates a new message linked to the parent.

**Signature:**
```clarity
(define-public (reply-to-message (parent-id uint) (content (string-utf8 280))))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `parent-id` | `uint` | ID of the message to reply to |
| `content` | `(string-utf8 280)` | Reply content, 1-280 UTF-8 characters |

**Returns:** `(response uint uint)` -- the new reply message ID

**Behavior:**
- Parent message must exist and not be deleted
- Same validation and fee as `post-message`
- Sets the reply's `reply-to` field to `parent-id`
- Increments the parent's `reply-count` and the global `total-replies`
- The spam cooldown applies the same as regular posts

---

### edit-message

Edits the content of an existing message. Only the author can edit.

**Signature:**
```clarity
(define-public (edit-message (message-id uint) (new-content (string-utf8 280))))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `message-id` | `uint` | ID of the message to edit |
| `new-content` | `(string-utf8 280)` | New content, 1-280 UTF-8 characters |

**Returns:** `(response bool uint)`

**Behavior:**
- Only the original author can edit their message
- Maximum of 10 edits per message (`max-edit-count`)
- Previous content is stored in `edit-history` map
- Sets `edited: true` and increments `edit-count` on the message
- Increments global `total-edits`
- Cannot edit deleted messages
- No fee charged for editing

---

### delete-message

Soft-deletes a message. Only the author or contract owner can delete.

**Signature:**
```clarity
(define-public (delete-message (message-id uint)))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `message-id` | `uint` | ID of the message to delete |

**Returns:** `(response bool uint)`

**Behavior:**
- Marks message as `deleted: true` (content remains on-chain)
- Cannot delete an already-deleted message (returns `err-already-deleted`)
- Increments global `total-deleted`
- No fee charged

---

### set-display-name

Sets a display name for the calling user.

**Signature:**
```clarity
(define-public (set-display-name (name (string-utf8 50))))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `name` | `(string-utf8 50)` | Display name, 1-50 UTF-8 characters |

**Returns:** `(response bool uint)`

**Behavior:**
- Contract must not be paused
- Cannot be empty
- Stored in the `user-profiles` map
- No fee charged

---

## Owner Functions

These functions can only be called by the contract owner.

### withdraw-fees

Withdraws collected fees from the contract.

**Signature:**
```clarity
(define-public (withdraw-fees (amount uint) (recipient principal)))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `amount` | `uint` | Amount in microSTX to withdraw |
| `recipient` | `principal` | Address to send the fees to |

---

### pause-contract / unpause-contract

Toggles the paused state of the contract. When paused, most public functions are disabled.

```clarity
(define-public (pause-contract))
(define-public (unpause-contract))
```

---

### propose-ownership-transfer

Proposes a new owner. The proposed owner must call `accept-ownership` to complete the transfer.

```clarity
(define-public (propose-ownership-transfer (new-owner principal)))
```

### accept-ownership

Called by the proposed owner to accept the ownership transfer.

```clarity
(define-public (accept-ownership))
```

### cancel-ownership-transfer

Cancels a pending ownership transfer.

```clarity
(define-public (cancel-ownership-transfer))
```

---

### Fee Setters

The contract owner can adjust fees within the allowed range (`u1000` to `u10000000` microSTX).

```clarity
(define-public (set-fee-post-message (new-fee uint)))
(define-public (set-fee-pin-24hr (new-fee uint)))
(define-public (set-fee-pin-72hr (new-fee uint)))
(define-public (set-fee-reaction (new-fee uint)))
```

Each setter validates `min-fee <= new-fee <= max-fee` and returns `err-invalid-input` if out of range.

---

## Read-Only Functions

### get-message

Returns the full message record including all metadata.

**Signature:**
```clarity
(define-read-only (get-message (message-id uint)))
```

**Returns:** `(optional { author, content, timestamp, block-height, expires-at, pinned, pin-expires-at, reaction-count, deleted, edited, edit-count, reply-to, reply-count })`

Returns `none` if the message ID has never been used.

---

### get-active-message

Returns a message only if it has not been deleted and has not expired.

**Signature:**
```clarity
(define-read-only (get-active-message (message-id uint)))
```

**Returns:** `(optional { ... })` -- same shape as `get-message`, or `none` if deleted/expired/not found

---

### is-message-expired

Checks whether a message has passed its expiry block.

```clarity
(define-read-only (is-message-expired (message-id uint)))
```

**Returns:** `bool` -- `true` if `block-height >= expires-at`, or `true` if message not found

---

### is-message-pinned

Checks whether a message is currently pinned (pin has not expired).

```clarity
(define-read-only (is-message-pinned (message-id uint)))
```

**Returns:** `bool`

---

### is-message-deleted

Checks whether a message has been soft-deleted.

```clarity
(define-read-only (is-message-deleted (message-id uint)))
```

**Returns:** `bool`

---

### get-user-stats

Gets posting statistics for a user.

```clarity
(define-read-only (get-user-stats (user principal)))
```

**Returns:** `(optional { messages-posted: uint, total-spent: uint, last-post-block: uint })`

---

### get-user-profile

Gets the profile data for a user.

```clarity
(define-read-only (get-user-profile (user principal)))
```

**Returns:** `(optional { display-name: (string-utf8 50), updated-at: uint })`

---

### get-display-name

Gets only the display name for a user.

```clarity
(define-read-only (get-display-name (user principal)))
```

**Returns:** `(optional (string-utf8 50))` -- the display name or `none`

---

### get-total-messages

```clarity
(define-read-only (get-total-messages))
```

**Returns:** `(ok uint)` -- total messages posted (including deleted)

---

### get-total-deleted

```clarity
(define-read-only (get-total-deleted))
```

**Returns:** `(ok uint)` -- total messages that have been deleted

---

### get-total-edits

```clarity
(define-read-only (get-total-edits))
```

**Returns:** `(ok uint)` -- total edits across all messages

---

### get-total-replies

```clarity
(define-read-only (get-total-replies))
```

**Returns:** `(ok uint)` -- total reply messages

---

### get-total-fees-collected

```clarity
(define-read-only (get-total-fees-collected))
```

**Returns:** `(ok uint)` -- total fees collected in microSTX

---

### get-message-nonce

Returns the current message nonce (equal to the next message ID).

```clarity
(define-read-only (get-message-nonce))
```

**Returns:** `(ok uint)`

---

### get-contract-stats

Returns all key counters in a single call for efficient dashboard rendering.

```clarity
(define-read-only (get-contract-stats))
```

**Returns:**
```clarity
(ok {
  total-messages: uint,
  total-deleted: uint,
  total-edits: uint,
  total-replies: uint,
  total-fees-collected: uint,
  message-nonce: uint,
  paused: bool
})
```

---

### get-page-range

Calculates start and end message IDs for a given page number and page size.

```clarity
(define-read-only (get-page-range (page uint) (page-size uint)))
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `page` | `uint` | Page number (0-indexed) |
| `page-size` | `uint` | Number of messages per page |

**Returns:**
```clarity
(ok { start-id: uint, end-id: uint, total: uint })
```

---

### has-user-reacted

```clarity
(define-read-only (has-user-reacted (message-id uint) (user principal)))
```

**Returns:** `bool`

---

### get-user-reaction-type

Gets the reaction type a user submitted for a message.

```clarity
(define-read-only (get-user-reaction-type (message-id uint) (user principal)))
```

**Returns:** `(optional uint)` -- the reaction type, or `none` if user has not reacted

---

### get-reaction-count-by-type

Gets the total count of a specific reaction type on a message.

```clarity
(define-read-only (get-reaction-count-by-type (message-id uint) (reaction-type uint)))
```

**Returns:** `uint`

---

### get-reply-parent / is-reply

```clarity
(define-read-only (get-reply-parent (message-id uint)))
;; Returns (response uint uint) -- parent ID or err-not-found

(define-read-only (is-reply (message-id uint)))
;; Returns (response bool uint) -- true if reply-to > 0
```

---

### get-edit-history

Retrieves a previous version of an edited message.

```clarity
(define-read-only (get-edit-history (message-id uint) (edit-index uint)))
```

**Returns:** `(optional { previous-content: (string-utf8 280), edited-at-block: uint })`

---

### is-contract-paused

```clarity
(define-read-only (is-contract-paused))
```

**Returns:** `bool`

---

### get-contract-owner

```clarity
(define-read-only (get-contract-owner))
```

**Returns:** `(ok principal)`

---

### get-proposed-owner

```clarity
(define-read-only (get-proposed-owner))
```

**Returns:** `(ok (optional principal))`

---

### Fee Getters

```clarity
(define-read-only (get-fee-post-message))   ;; (ok uint)
(define-read-only (get-fee-pin-24hr))       ;; (ok uint)
(define-read-only (get-fee-pin-72hr))       ;; (ok uint)
(define-read-only (get-fee-reaction))       ;; (ok uint)
```

---

## Data Structures

### Message Map

Key: `{ message-id: uint }`

```clarity
{
  author: principal,
  content: (string-utf8 280),
  timestamp: uint,
  block-height: uint,
  expires-at: uint,
  pinned: bool,
  pin-expires-at: uint,
  reaction-count: uint,
  deleted: bool,
  edited: bool,
  edit-count: uint,
  reply-to: uint,
  reply-count: uint
}
```

### User Stats Map

Key: `{ user: principal }`

```clarity
{
  messages-posted: uint,
  total-spent: uint,
  last-post-block: uint
}
```

### User Profiles Map

Key: `principal`

```clarity
{
  display-name: (string-utf8 50),
  updated-at: uint
}
```

### Reactions Map

Key: `{ message-id: uint, user: principal }`

```clarity
{
  reacted: bool,
  reaction-type: uint
}
```

### Typed Reaction Counts Map

Key: `{ message-id: uint, reaction-type: uint }`

```clarity
{
  count: uint
}
```

### Edit History Map

Key: `{ message-id: uint, edit-index: uint }`

```clarity
{
  previous-content: (string-utf8 280),
  edited-at-block: uint
}
```

---

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| `u100` | `err-owner-only` | Caller is not the contract owner |
| `u101` | `err-not-found` | Message not found |
| `u102` | `err-unauthorized` | Not authorized for this action |
| `u103` | `err-invalid-input` | Invalid input (empty message, bad length, fee out of range) |
| `u104` | `err-max-edits-reached` | Message has reached the 10-edit limit |
| `u105` | `err-already-reacted` | User already reacted to this message |
| `u106` | `err-too-soon` | Must wait 6 blocks between posts (spam prevention) |
| `u107` | `err-contract-paused` | Contract is paused by the owner |
| `u108` | `err-insufficient-balance` | Not enough STX for the transaction fee |
| `u109` | `err-already-deleted` | Message has already been deleted |
| `u110` | `err-no-pending-transfer` | No ownership transfer is pending |
| `u111` | `err-not-proposed-owner` | Caller is not the proposed new owner |

---

## Constants

### Configuration

| Constant | Value | Description |
|----------|-------|-------------|
| `min-message-length` | `u1` | Minimum message content length |
| `max-message-length` | `u280` | Maximum message content length |
| `default-expiry-blocks` | `u144` | Default message lifetime (~24 hours) |
| `pin-24hr-blocks` | `u144` | 24-hour pin duration in blocks |
| `pin-72hr-blocks` | `u432` | 72-hour pin duration in blocks |
| `min-post-gap` | `u6` | Minimum blocks between posts (~1 hour) |
| `max-edit-count` | `u10` | Maximum number of edits per message |
| `min-fee` | `u1000` | Minimum allowed fee setting (0.001 STX) |
| `max-fee` | `u10000000` | Maximum allowed fee setting (10 STX) |

### Reaction Types

| Constant | Value | Emoji |
|----------|-------|-------|
| `reaction-type-like` | `u1` | Like |
| `reaction-type-fire` | `u2` | Fire |
| `reaction-type-laugh` | `u3` | Laugh |
| `reaction-type-sad` | `u4` | Sad |
| `reaction-type-dislike` | `u5` | Dislike |
| `max-reaction-type` | `u5` | Upper bound |

---

## Fee Structure

Default fees (adjustable by the contract owner within `u1000`-`u10000000` range):

| Action | Default (uSTX) | Default (STX) |
|--------|----------------|---------------|
| Post Message | 10,000 | 0.01 |
| Pin 24 Hours | 50,000 | 0.05 |
| Pin 72 Hours | 100,000 | 0.10 |
| React to Message | 5,000 | 0.005 |

Use `get-fee-post-message`, `get-fee-pin-24hr`, `get-fee-pin-72hr`, and `get-fee-reaction` to query current fees on-chain.

---

## Integration Guide

### Install Dependencies

```bash
npm install @stacks/connect @stacks/transactions @stacks/network
```

### Network and Contract Config

```javascript
import { StacksMainnet } from '@stacks/network';

const network = new StacksMainnet();
const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const CONTRACT_NAME = 'message-board-v4';
```

### Reading Data

```javascript
import { callReadOnlyFunction, uintCV, cvToJSON } from '@stacks/transactions';

const fetchMessage = async (id) => {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-message',
    functionArgs: [uintCV(id)],
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
};

const fetchStats = async () => {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-contract-stats',
    functionArgs: [],
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
};
```

### Posting a Message

```javascript
import { openContractCall } from '@stacks/connect';
import { stringUtf8CV } from '@stacks/transactions';

const postMessage = async (content) => {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'post-message',
    functionArgs: [stringUtf8CV(content)],
    postConditionMode: 0x01,
    onFinish: ({ txId }) => {
      console.log('Submitted:', txId);
    },
  });
};
```

### Replying to a Message

```javascript
import { uintCV, stringUtf8CV } from '@stacks/transactions';

const replyToMessage = async (parentId, content) => {
  await openContractCall({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'reply-to-message',
    functionArgs: [uintCV(parentId), stringUtf8CV(content)],
    postConditionMode: 0x01,
    onFinish: ({ txId }) => console.log('Reply TX:', txId),
  });
};
```

### Paginated Fetching

```javascript
const fetchPage = async (page, pageSize = 10) => {
  const range = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-page-range',
    functionArgs: [uintCV(page), uintCV(pageSize)],
    senderAddress: CONTRACT_ADDRESS,
  });

  const parsed = cvToJSON(range).value;
  const startId = parsed['start-id'].value;
  const endId = parsed['end-id'].value;
  const messages = [];

  for (let id = startId; id <= endId; id++) {
    const msg = await fetchMessage(id);
    if (msg.value) messages.push(msg.value);
  }

  return messages;
};
```

### Checking Transaction Status

```javascript
const checkTx = async (txId) => {
  const res = await fetch(
    `https://stacks-node-api.mainnet.stacks.co/extended/v1/tx/${txId}`
  );
  const data = await res.json();
  return data.tx_status; // 'pending', 'success', 'abort_by_response'
};
```

---

## Contract Links

- **Explorer:** [View on Stacks Explorer](https://explorer.stacks.co/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.message-board-v4?chain=mainnet)
- **Source Code:** [contracts/message-board-v4.clar](../contracts/message-board-v4.clar)
- **Tests:** [tests/](../tests/)
- **Frontend:** [frontend/](../frontend/)