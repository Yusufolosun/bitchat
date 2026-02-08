# BitChat Community Testing Guide

## Welcome, Tester!

Thank you for helping test BitChat v3! Your feedback is crucial for ensuring a smooth mainnet launch. This guide will walk you through comprehensive testing scenarios.

## Table of Contents
1. [Testing Environment Setup](#testing-environment-setup)
2. [Test Scenarios](#test-scenarios)
3. [Bug Reporting](#bug-reporting)
4. [Rewards & Recognition](#rewards--recognition)

## Testing Environment Setup

### Prerequisites
- Stacks wallet (Hiro Wallet recommended for testnet)
- Testnet STX (get from faucet)
- Modern web browser
- 30-60 minutes of testing time

### Getting Testnet STX
1. Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Enter your Stacks testnet address
3. Request tokens (you'll receive ~500 STX)
4. Wait 2-3 minutes for confirmation

### Contract Information
- **Network**: Stacks Testnet
- **Contract Address**: `[WILL BE PROVIDED AFTER DEPLOYMENT]`
- **Version**: v3 (Security Enhanced)
- **Frontend URL**: `[TBD]`

### Important Notes
⚠️ **This is TESTNET** - These are not real tokens!
⚠️ **Messages are PUBLIC** - Don't post sensitive information
⚠️ **Messages are PERMANENT** - Can't be deleted (even on testnet)

## Test Scenarios

### Level 1: Basic Functionality (Everyone)

#### Test 1.1: First Message Post
**Objective**: Verify basic posting works

**Steps**:
1. Connect your wallet to BitChat
2. Type a message: "Testing BitChat v3! 🚀"
3. Click "Post Message"
4. Confirm transaction in wallet
5. Wait for confirmation (~10 minutes)

**Expected Result**:
- ✅ Transaction successful
- ✅ Message appears in feed
- ✅ Your address shown as author
- ✅ Timestamp matches current block
- ✅ Balance decreased by ~0.0101 STX

**Report if**:
- ❌ Transaction fails
- ❌ Message doesn't appear
- ❌ Wrong author shown
- ❌ Excessive gas cost (>0.001 STX)

---

#### Test 1.2: Message Length Boundaries
**Objective**: Test input validation

**Steps**:
1. Try posting empty message: ""
2. Try posting 1-character message: "x"
3. Try posting exactly 280 characters (use counter)
4. Try posting 281 characters

**Expected Results**:
- ❌ Empty message should fail (err u103)
- ✅ 1-character message should succeed
- ✅ 280-character message should succeed
- ❌ 281-character message should fail (err u103)

**Report if**:
- Any result differs from expected
- Error messages are unclear

---

#### Test 1.3: Spam Prevention (IMPORTANT!)
**Objective**: Verify cooldown mechanism

**Steps**:
1. Post a message successfully
2. Immediately try to post another message
3. Note the error
4. Check block height
5. Wait for 6 blocks (~60 minutes) OR use another wallet
6. Try posting again

**Expected Results**:
- ✅ First post succeeds
- ❌ Second immediate post fails with "err u106 (too soon)"
- ✅ After 6 blocks, post succeeds

**Report if**:
- You can post multiple messages immediately
- Cooldown time seems wrong
- Error message is confusing
- Different wallets share cooldown (they shouldn't)

---

#### Test 1.4: Reactions
**Objective**: Test reaction system

**Steps**:
1. Find any message (yours or someone else's)
2. Click reaction button (❤️)
3. Confirm transaction (0.005 STX fee)
4. Wait for confirmation
5. Try reacting to the same message again

**Expected Results**:
- ✅ First reaction succeeds
- ✅ Reaction count increments
- ✅ Your address shown in reactors list
- ❌ Second reaction fails (err u105 "already reacted")

**Report if**:
- Can't react to messages
- Can react multiple times to same message
- Reaction count doesn't update
- Wrong fee amount charged

---

### Level 2: Advanced Features (Power Testers)

#### Test 2.1: Message Pinning (24hr)
**Objective**: Test 24-hour pin functionality

**Steps**:
1. Post a message
2. Wait for post cooldown (6 blocks) or use different feature
3. Click "Pin" on your message
4. Select "24 hours" option
5. Confirm transaction (0.05 STX)
6. Verify message appears at top
7. 7Check pin expiry time
8. Wait 144 blocks (or check `is-message-pinned`)

**Expected Results**:
- ✅ Pin transaction succeeds
- ✅ Message moved to top of feed
- ✅ Pin badge/indicator shows duration
- ✅ After 144 blocks, pin expires (message returns to normal position)

**Report if**:
- Can't pin message
- Wrong fee charged (should be 0.05 STX)
- Message not highlighted
- Pin doesn't expire correctly
- Can pin someone else's message

---

#### Test 2.2: Message Pinning (72hr)
**Objective**: Test 72-hour pin functionality

**Repeat Test 2.1 but**:
- Select "72 hours" option
- Fee should be 0.10 STX
- Expiry should be 432 blocks

---

#### Test 2.3: Invalid Pin Durations
**Objective**: Test pin validation

**Steps**:
1. Post a message
2. Wait for cooldown
3. Try to pin with these durations (may require contract calls):
   - 0 blocks
   - 1 block
   - 100 blocks
   - 500 blocks

**Expected Results**:
- ❌ All invalid durations should fail (err u104)
- ✅ Only 144 and 432 should succeed

**Report if**:
- Invalid durations are accepted
- Error handling is poor

---

#### Test 2.4: Pin Authorization
**Objective**: Verify only authors can pin

**Steps**:
1. User A posts a message
2. User B tries to pin User A's message
3. User A tries to pin their own message

**Expected Results**:
- ❌ User B's pin attempt fails (err u102 "unauthorized")
- ✅ User A's pin attempt succeeds

**Report if**:
- Anyone can pin others' messages
- Author can't pin their own message

---

### Level 3: Security Testing (Advanced)

#### Test 3.1: Admin Functions (Non-Owner)
**Objective**: Verify admin functions are protected

**Steps** (as regular user, not contract deployer):
1. Try calling `pause-contract`
2. Try calling `unpause-contract`
3. Try calling `withdraw-fees`
4. Try calling `transfer-ownership`

**Expected Results**:
- ❌ All calls should fail with "err u100 (owner only)"

**Report if**:
- Any admin function succeeds for non-owner
- This would be a CRITICAL security bug!

---

#### Test 3.2: Contract Pause State
**Objective**: Verify pause prevents operations

**Prerequisites**: Contract owner must pause for this test

**Steps** (after contract is paused):
1. Try posting a message
2. Try pinning a message
3. Try reacting to a message
4. Try reading messages (should work)
5. Check `is-contract-paused` returns `true`

**Expected Results**:
- ❌ Post fails (err u107 "contract paused")
- ❌ Pin fails (err u107)
- ❌ React fails (err u107)
- ✅ Reading still works
- ✅ `is-contract-paused` returns `true`

**Steps** (after contract is unpaused):
- All operations should work again

**Report if**:
- Can post/pin/react while paused
- Can't read while paused
- Pause status incorrect

---

#### Test 3.3: Fee Collection Verification
**Objective**: Verify fees are collected correctly

**Steps**:
1. Check contract balance before actions:
   ```
   https://api.testnet.hiro.so/extended/v1/address/<CONTRACT-ADDRESS>/stx
   ```
2. Post a message (10,000 microSTX fee)
3. Check contract balance again
4. Pin a message (50,000 microSTX fee)
5. Check contract balance again
6. React to a message (5,000 microSTX fee)
7. Check contract balance again

**Expected Results**:
- Contract balance increases by exact fee amounts
- Your balance decreases by fee + gas

**Report if**:
- Fees not collected
- Wrong amounts collected
- Contract balance doesn't increase

---

### Level 4: Edge Cases & Stress Testing (Expert)

#### Test 4.1: Concurrent Users
**Objective**: Test multi-user scenarios

**Setup**: Coordinate with 2-3 other testers

**Steps**:
1. All users post messages simultaneously
2. All users react to the same message
3. Check reaction count
4. Check message order
5. Verify no data corruption

**Expected Results**:
- ✅ All posts succeed (different users = no cooldown conflict)
- ✅ All reactions counted correctly
- ✅ Messages appear in correct order

**Report if**:
- Transactions conflict
- Data corruption
- Reaction counts wrong

---

#### Test 4.2: Special Characters & Emojis
**Objective**: Test UTF-8 handling

**Test these messages**:
- "Testing emojis: 🚀 🌙 ⚡ 🔥 💎"
- "Unicode test: こんにちは 你好 مرحبا"
- "Special chars: !@#$%^&*()_+-=[]{}|;:',.<>?/"
- "Line breaks: First\nSecond\nThird" (if UI allows)
- "Mixed: Hello 👋 世界 🌍"

**Expected Results**:
- All characters preserved correctly
- Emojis display properly
- No encoding errors
- Character count accurate

**Report if**:
- Characters corrupted
- Emojis broken
- Character limit calculation wrong

---

#### Test 4.3: Large Volume Testing
**Objective**: Test system under load

**Steps** (coordinate with group):
1. 10+ users post messages rapidly (respecting cooldown)
2. 20+ users react to messages
3. Multiple pins active simultaneously
4. Check frontend performance
5. Check blockchain confirmation times

**Expected Results**:
- All transactions process eventually
- No data loss
- Frontend remains responsive

**Report if**:
- Transactions fail unexpectedly
- Severe performance degradation
- Data inconsistencies

---

#### Test 4.4: User Stats Accuracy
**Objective**: Verify stat tracking

**Steps**:
1. Check your initial stats (or note if none)
2. Post exactly 3 messages (wait for cooldowns)
3. Pin 1 message (24hr)
4. React to 2 messages
5. Check final stats

**Expected Calculation**:
```
Messages Posted: 3
Total Spent: 
  - 3 posts × 10,000 = 30,000
  - 1 pin × 50,000 = 50,000
  - 2 reactions × 5,000 = 10,000
  = 90,000 microSTX total
```

**Report if**:
- Stats don't match calculation
- Stats don't update
- Negative or impossible values

---

#### Test 4.5: Extreme Block Heights
**Objective**: Test pin expiry edge cases

**Steps**:
1. Post and pin a message
2. Note current block and expiry block
3. Calculate: expiry_block - current_block
4. For 24hr pin, should equal 144
5. For 72hr pin, should equal 432
6. Check `is-message-pinned` just before expiry
7. Check `is-message-pinned` just after expiry

**Expected Results**:
- ✅ Before expiry: returns `true`
- ❌ After expiry: returns `false`
- Pin expiry calculation correct

**Report if**:
- Expiry calculation wrong
- Pin doesn't expire
- Pin expires too early

---

### Level 5: Integration Testing

#### Test 5.1: Wallet Compatibility
**Objective**: Test different wallets

**Test with these wallets** (if available):
- Hiro Wallet
- Xverse
- Leather

**For each wallet**:
1. Connect to BitChat
2. Post a message
3. Pin a message
4. React to a message
5. Disconnect and reconnect

**Report**:
- Which wallets work perfectly
- Which have issues
- Specific problems encountered

---

#### Test 5.2: Browser Compatibility
**Test browsers**:
- Chrome
- Firefox
- Brave
- Safari (if on Mac)
- Edge

**For each browser**:
- Connect wallet
- Post message
- Check display/formatting
- Check responsive design
- Test on mobile browser if possible

**Report**:
- Browser-specific issues
- UI/UX problems
- Display glitches

---

#### Test 5.3: Network Conditions
**Objective**: Test under poor conditions

**Scenarios**:
1. Slow internet connection
2. Network interruption during transaction
3. Very high network congestion
4. Switching networks mid-transaction

**Report**:
- How app handles errors
- User feedback quality
- Data integrity under stress

---

## Bug Reporting

### How to Report Bugs

**Use this template**:

```markdown
## Bug Report

**Severity**: [Critical/High/Medium/Low]
**Test**: [Test number, e.g., Test 1.3]
**Browser**: [Chrome 120, Firefox 121, etc.]
**Wallet**: [Hiro Wallet 4.0.0, etc.]

### Description
[Clear description of the bug]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [etc.]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Screenshots
[If applicable]

### Transaction ID
[If transaction involved]

### Console Errors
[Any JavaScript errors from browser console]

### Additional Context
[Any other relevant information]
```

### Severity Definitions

**Critical** (Report immediately!)
- Security vulnerabilities
- Loss of funds
- Data corruption
- Complete feature failure
- Admin functions accessible to non-owners

**High**
- Major features not working
- incorrect fee amounts
- Spam prevention bypass
- Pause mechanism not working

**Medium**
- Minor features not working
- UI glitches
- Confusing error messages
- Performance issues

**Low**
- Typos/grammar
- Minor UI improvements
- Nice-to-have features

### Where to Report

1. **GitHub Issues**: [TBD - preferred for detailed bugs]
2. **Discord #bug-reports**: [TBD - For quick reports]
3. **Testing Form**: [TBD - Structured submissions]
4. **Email**: security@bitchat.xyz (for security issues ONLY)

### Security Issues

⚠️ **CRITICAL**: If you find a security vulnerability:

1. **DO NOT** post publicly
2. **DO NOT** exploit it
3. Email security@bitchat.xyz immediately with:
   - Description
   - Steps to reproduce
   - Your contact info
4. Wait for acknowledgment
5. We'll work with you on responsible disclosure

Rewards available for critical security findings!

## Rewards & Recognition

### Testing Tiers

**Bronze Tester** (5+ test scenarios completed)
- Listed in credits
- Special role in Discord
- Early access to future features

**Silver Tester** (15+ test scenarios + 1 valid bug report)
- Bronze tier +
- NFT badge
- Beta tester role for future releases

**Gold Tester** (25+ test scenarios + 3 valid bug reports)
- Silver tier +
- $50 USD in STX
- Name in smart contract acknowledgments

**Platinum Tester** (All scenarios + critical bug found)
- Gold tier +
- $200 USD in STX
- Special NFT
- Lifetime premium features

### Leaderboard

Track your testing progress:
- https://bitchat.xyz/testing-leaderboard

Top 10 testers receive bonus rewards!

## Testing Schedule

### Phase 1: Alpha Testing (Week 1)
- Small group of invited testers
- Focus on critical functionality
- Daily feedback sessions

### Phase 2: Beta Testing (Week 2-3)
- Open to community
- All test scenarios
- Bug bash events

### Phase 3: Release Candidate (Week 4)
- Final validation
- Performance testing
- Documentation verification

### Mainnet Launch: Week 5 (Target)

## Testing Tools & Resources

### Block Explorer
- Testnet: https://explorer.hiro.so/?chain=testnet
- Check transactions: `https://explorer.hiro.so/txid/<TRANSACTION_ID>?chain=testnet`

### API Endpoints
```bash
# Get message
curl https://api.testnet.hiro.so/v2/contracts/call-read/<ADDRESS>/message-board-v3/get-message \
  -d '{"sender":"<YOUR-ADDRESS>","arguments":["0x0100000000000000000"]}'

# Check pause status
curl https://api.testnet.hiro.so/v2/contracts/call-read/<ADDRESS>/message-board-v3/is-contract-paused \
  -d '{"sender":"<YOUR-ADDRESS>","arguments":[]}'
```

### Testing Helpers
- Character counter: [TBD]
- Block explorer: [TBD]
- Gas calculator: [TBD]

## Support & Questions

### Get Help
- Discord #testing-support: [TBD]
- Testing FAQ: [TBD]
- Office Hours: [TBD schedule]

### Share Feedback
- What worked well?
- What was confusing?
- What features do you want?
- How can we improve testing?

## Thank You!

Your contribution makes BitChat better for everyone. Every bug found, every scenario tested, every piece of feedback helps create a more robust, secure, and user-friendly platform.

Together, we're building the future of decentralized communication! 🚀

---

**Happy Testing!**

*Last updated: [DATE]*
*Contract version: v3 (Security Enhanced)*
