# 🚀 BitChat v3 LIVE ON TESTNET!

## Contract Information

**Contract ID:** `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v3`
**Network:** Stacks Testnet
**Deployment Date:** February 8, 2026
**Status:** ✅ LIVE & READY FOR TESTING

**Explorer Links:**
- **Contract:** https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet
- **Transactions:** https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet

---

## 🧪 Quick Testing Guide

### Using Hiro Explorer (Web Interface)

1. **Visit Contract:** https://explorer.hiro.so/address/ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0?chain=testnet

2. **Click "Call Contract"**

3. **Get Testnet STX:** https://explorer.hiro.so/sandbox/faucet?chain=testnet

### Test Functions (Copy & Paste)

#### 1. Post a Message
```clarity
Function: post-message
Arguments: "Hello BitChat v3! Testing security enhancements 🚀"
Fee: 0.00001 STX (10000 µSTX)
```

#### 2. Check Message Count (Read-Only)
```clarity
Function: get-total-messages
No arguments needed
```

#### 3. Get Your User Stats (Read-Only)
```clarity
Function: get-user-stats
Arguments: [YOUR_WALLET_ADDRESS]
```

#### 4. Pin Your Message (24 hours)
```clarity
Function: pin-message
Arguments: 
- message-id: 0  (or your message ID)
- duration: 144  (blocks = 24 hours)
Fee: 0.00005 STX (50000 µSTX)
```

#### 5. React to a Message
```clarity
Function: react-to-message
Arguments: 0  (or message ID)
Fee: 0.000005 STX (5000 µSTX)
```

#### 6. Check if Message is Pinned (Read-Only)
```clarity
Function: is-message-pinned
Arguments: 0  (message ID)
```

---

## 🔐 Testing Security Features

### Test Spam Prevention
```clarity
1. Post a message: "First message"
2. Immediately try to post again: "Second message"
   Expected: Should fail with (err u106) - too soon
3. Wait 6 blocks (~60 minutes)
4. Try posting again
   Expected: Should succeed
```

### Test Pause Mechanism (Owner Only)
```clarity
Function: pause-contract
Expected: Only contract owner can pause
```

### Test Fee Collection
```clarity
1. Check contract balance before posting
2. Post a message (fee: 0.00001 STX)
3. Check contract balance after
   Expected: Balance increased by fee amount
```

### Test Ownership Functions (Owner Only)
```clarity
Function: get-contract-owner
Expected: Returns ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0
```

---

## 📊 Monitoring Commands

### Using Stacks CLI

```bash
# Get total messages
stx call-read-only ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 message-board-v3 get-total-messages --testnet

# Get total fees collected
stx call-read-only ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 message-board-v3 get-total-fees-collected --testnet

# Check if paused
stx call-read-only ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 message-board-v3 is-contract-paused --testnet

# Get message by ID
stx call-read-only ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0 message-board-v3 get-message "(u 0)" --testnet
```

---

## ✅ Testing Checklist

Track your testing progress:

### Basic Functions
- [ ] post-message - Create your first message
- [ ] get-total-messages - Verify count increased
- [ ] get-message - Read message data
- [ ] get-user-stats - Check your stats

### Pin System
- [ ] pin-message (24 hours) - Pin with 144 blocks
- [ ] pin-message (72 hours) - Pin with 432 blocks
- [ ] is-message-pinned - Verify pin status

### Reactions
- [ ] react-to-message - React to a message
- [ ] Try reacting twice - Should fail (err u105)
- [ ] has-user-reacted - Check reaction status

### Security Features
- [ ] Test spam prevention (6-block cooldown)
- [ ] Test contract pause (if owner)
- [ ] Verify fee collection works
- [ ] Test with insufficient balance

### Edge Cases
- [ ] Post max length message (280 chars)
- [ ] Try posting empty message (should fail)
- [ ] React to non-existent message (should fail)
- [ ] Pin non-existent message (should fail)

---

## 🐛 Bug Reporting

Found an issue? Report it:

1. **GitHub Issues:** https://github.com/Yusufolosun/bitchat/issues
2. **Include:**
   - Transaction ID
   - Expected behavior
   - Actual behavior
   - Steps to reproduce

---

## 📈 Current Stats

Update as you test:

- **Messages Posted:** `[COUNT]`
- **Total Pins:** `[COUNT]`
- **Total Reactions:** `[COUNT]`
- **Fees Collected:** `[AMOUNT] STX`
- **Unique Testers:** `[COUNT]`

---

## 🎉 Next Steps

After successful testnet validation:

1. [ ] Complete TESTNET_RESULTS.md with data
2. [ ] Review MAINNET_CHECKLIST.md
3. [ ] Deploy to mainnet using `./scripts/deploy-mainnet.sh`
4. [ ] Update frontend constants
5. [ ] Public launch! 🚀

---

**Happy Testing!** 🧪✨

Every test helps make BitChat more secure and reliable. Thank you for contributing!
