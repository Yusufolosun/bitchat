# message-board v3 - Deployment Guide

## Version Information
- **Contract Version**: v3 (Security Enhanced)
- **Clarity Version**: 4
- **Epoch**: 3.3
- **Status**: Production Ready (Pending Final Testing)

## Mainnet Readiness: 85-90%

Based on comprehensive security audit, the contract has addressed:
- ✅ Fee collection mechanism (CRITICAL)
- ✅ Fee withdrawal functionality (HIGH)
- ✅ Spam prevention (HIGH)
- ✅ Emergency pause mechanism (MEDIUM)
- ✅ Ownership transfer capability (MEDIUM)
- ✅ Event logging (INFORMATIONAL)
- ✅ Pin expiry enforcement (MEDIUM)

## What's New in v3

### Security Enhancements
1. **Working Fee Collection**: Fees are now properly collected into contract balance using `as-contract` pattern
2. **Spam Prevention**: 6-block cooldown between posts per user
3. **Emergency Pause**: Owner can pause/unpause all contract operations
4. **Ownership Transfer**: Contract ownership can be transferred
5. **Fee Withdrawal**: Owner can withdraw collected fees
6. **Event Logging**: All major operations emit events for off-chain indexing
7. **Pin Expiry Validation**: `is-message-pinned` now enforces expiry timestamps

### New Functions

#### Admin Functions (Owner-Only)
- `withdraw-fees (amount uint) (recipient principal)` - Withdraw collected fees
- `pause-contract ()` - Emergency stop all operations
- `unpause-contract ()` - Resume operations
- `transfer-ownership (new-owner principal)` - Transfer contract ownership

#### New Read-Only Functions
- `is-contract-paused ()` - Check pause status
- `get-contract-owner ()` - Get current owner principal
- `is-message-pinned (message-id uint)` - Check if message is pinned AND not expired

### New Error Codes
- `u106` (err-too-soon) - User trying to post before cooldown expires
- `u107` (err-contract-paused) - Operation attempted while contract is paused
- `u108` (err-insufficient-balance) - Attempting to withdraw more than contract balance

## Pre-Deployment Checklist

### 1. Contract Validation
```bash
# Validate syntax and security
clarinet check

# Expected output:
# ✓ contracts/message-board-v2.clar (v3 - Security Enhanced)
```

### 2. Run Test Suite
```bash
# Run all tests
npm test

# Run edge case tests specifically
npm test -- edge-cases.test.ts

# Expected results:
# - All spam prevention tests should pass
# - All pause/unpause tests should pass
# - Fee collection tests should verify STX transfers
# - Ownership transfer tests should pass
# - Pin expiry tests should pass
```

### 3. Local Simulation Testing
```bash
# Start Clarinet console for manual testing
clarinet console

# Test sequence in console:
;;; 1. Test posting (first user)
(contract-call? .message-board-v2 post-message "Test message 1")

;;; 2. Verify spam prevention
(contract-call? .message-board-v2 post-message "Test message 2")
;;; Should fail with (err u106)

;;; 3. Advance blocks and retry
::advance_chain_tip 7
(contract-call? .message-board-v2 post-message "Test message 2")
;;; Should succeed

;;; 4. Test pause functionality
(contract-call? .message-board-v2 pause-contract)
(contract-call? .message-board-v2 post-message "Should fail")
;;; Should fail with (err u107)

;;; 5. Unpause and verify
(contract-call? .message-board-v2 unpause-contract)
(contract-call? .message-board-v2 post-message "Should work")
;;; Should succeed
```

## Testnet Deployment

### Step 1: Generate Deployment Plan
```bash
# Generate testnet deployment with medium gas cost
clarinet deployments generate --testnet --medium-cost

# This creates: deployments/default.testnet-deployments.yaml
```

### Step 2: Review Deployment Plan
Check the generated file for:
- Correct contract name (message-board-v3 or message-board)
- Correct network (testnet)
- Gas costs are reasonable
- Nonce sequence is correct

### Step 3: Prepare Testnet Account
Ensure your testnet wallet has sufficient STX:
- Minimum required: 1 STX (for deployment + gas)
- Recommended: 5 STX (for deployment, testing, and gas buffer)

Get testnet STX from: https://explorer.hiro.so/sandbox/faucet?chain=testnet

### Step 4: Deploy to Testnet
```bash
# Apply the deployment plan
clarinet deployments apply --testnet

# Expected output:
# Transaction ID: 0x...
# Contract deployed: ST<ADDRESS>.message-board-v3
```

### Step 5: Verify Deployment
```bash
# Check contract status
curl "https://api.testnet.hiro.so/v2/contracts/interface/ST<YOUR-ADDRESS>/message-board-v3"

# Should return contract interface with all functions
```

## Post-Deployment Testing

### 1. Smoke Tests
Test all critical paths on testnet:

```bash
# Using stacks-cli or similar tool

# Test 1: Post a message
stacks-cli call ST<ADDRESS> message-board-v3 post-message -p '"Hello v3!"'

# Test 2: Verify spam prevention
# Try posting again immediately - should fail with err-too-soon
stacks-cli call ST<ADDRESS> message-board-v3 post-message -p '"Too soon"'

# Test 3: Wait 6 blocks and post again - should succeed
# (wait ~60 minutes)
stacks-cli call ST<ADDRESS> message-board-v3 post-message -p '"After cooldown"'

# Test 4: Pin a message
stacks-cli call ST<ADDRESS> message-board-v3 pin-message -p 'u0' -p 'u144'

# Test 5: React to message
stacks-cli call ST<ADDRESS> message-board-v3 react-to-message -p 'u0'

# Test 6: Check contract is not paused
stacks-cli call-read ST<ADDRESS> message-board-v3 is-contract-paused

# Test 7: Verify fee collection
# Check contract STX balance - should be positive
```

### 2. Security Verification
```bash
# Verify only owner can pause
# Sign transaction from different account
stacks-cli call ST<ADDRESS> message-board-v3 pause-contract --from-wallet user1
# Should fail with err-owner-only (u100)

# Verify only owner can withdraw fees
stacks-cli call ST<ADDRESS> message-board-v3 withdraw-fees -p 'u1000' -p 'ST<RECIPIENT>' --from-wallet user1
# Should fail with err-owner-only (u100)

# Verify pause prevents operations
# Pause as owner
stacks-cli call ST<ADDRESS> message-board-v3 pause-contract

# Try to post - should fail
stacks-cli call ST<ADDRESS> message-board-v3 post-message -p '"Should fail"'
# Should return err-contract-paused (u107)

# Unpause
stacks-cli call ST<ADDRESS> message-board-v3 unpause-contract
```

### 3. Fee Collection Verification
```bash
# Check contract balance before operations
curl "https://api.testnet.hiro.so/extended/v1/address/ST<ADDRESS>.message-board-v3/stx"

# Post message (10,000 microSTX fee)
stacks-cli call ST<ADDRESS> message-board-v3 post-message -p '"Fee test"'

# Check contract balance after - should increase by 10,000 microSTX
curl "https://api.testnet.hiro.so/extended/v1/address/ST<ADDRESS>.message-board-v3/stx"

# Withdraw fees as owner
stacks-cli call ST<ADDRESS> message-board-v3 withdraw-fees -p 'u5000' -p 'ST<YOUR-ADDRESS>'

# Balance should decrease by 5,000 microSTX
```

## Frontend Integration Updates

### 1. Update Contract Address
```javascript
// frontend/src/utils/constants.js

export const CONTRACT_ADDRESS = 'ST<YOUR-ADDRESS>';
export const CONTRACT_NAME = 'message-board-v3'; // Update version

// New error codes
export const ERROR_CODES = {
  ERR_OWNER_ONLY: 100,
  ERR_NOT_FOUND: 101,
  ERR_UNAUTHORIZED: 102,
  ERR_INVALID_INPUT: 103,
  ERR_INVALID_DURATION: 104,
  ERR_ALREADY_REACTED: 105,
  ERR_TOO_SOON: 106,        // NEW
  ERR_CONTRACT_PAUSED: 107, // NEW
  ERR_INSUFFICIENT_BALANCE: 108 // NEW
};
```

### 2. Handle New Error States
```javascript
// Handle spam prevention
if (error.code === 106) {
  showNotification('Please wait 6 blocks (~60 minutes) before posting again');
}

// Handle contract pause
if (error.code === 107) {
  showNotification('Contract is currently paused. Please try again later.');
}
```

### 3. Add Admin Controls (if applicable)
```javascript
// Only show to contract owner
if (currentUser === contractOwner) {
  showAdminPanel({
    pauseContract: () => callPublicFunction('pause-contract'),
    unpauseContract: () => callPublicFunction('unpause-contract'),
    withdrawFees: (amount, recipient) => 
      callPublicFunction('withdraw-fees', [uintCV(amount), principalCV(recipient)]),
    transferOwnership: (newOwner) =>
      callPublicFunction('transfer-ownership', [principalCV(newOwner)])
  });
}
```

### 4. Display Pause Status
```javascript
// Check contract status on load
const isPaused = await callReadOnlyFunction('is-contract-paused');

if (isPaused) {
  showBanner('Contract is currently under maintenance. Posting is temporarily disabled.');
}
```

## Monitoring & Maintenance

### Key Metrics to Monitor
1. **Contract Balance**: Total fees collected
2. **Pause Status**: Contract operational state
3. **Transaction Volume**: Posts, pins, reactions per day
4. **Error Rates**: Frequency of err-too-soon, err-contract-paused
5. **Abuse Patterns**: Users hitting spam prevention repeatedly

### Event Logging
The contract emits print statements for off-chain indexing:

```clarity
;; Message posted event
{ event: "message-posted", message-id: u0, author: ST..., block: u100 }

;; Message pinned event
{ event: "message-pinned", message-id: u0, author: ST..., duration: u144, expires: u244 }

;; Reaction added event
{ event: "reaction-added", message-id: u0, user: ST... }

;; Contract paused event
{ event: "contract-paused", by: ST... }

;; Contract unpaused event
{ event: "contract-unpaused", by: ST... }

;; Ownership transferred event
{ event: "ownership-transferred", from: ST..., to: ST... }

;; Fees withdrawn event
{ event: "fees-withdrawn", amount: u10000, recipient: ST... }
```

Set up event listeners to track these in your backend/analytics.

### Emergency Procedures

#### Scenario 1: Spam Attack Detected
```bash
# Immediately pause contract
stacks-cli call ST<ADDRESS> message-board-v3 pause-contract

# Investigate suspicious activity
# Review recent transactions
# Identify malicious patterns

# Update frontend with maintenance message
# Consider adjusting spam prevention parameters in v4

# Resume operations when safe
stacks-cli call ST<ADDRESS> message-board-v3 unpause-contract
```

#### Scenario 2: Critical Bug Found
```bash
# Pause contract immediately
stacks-cli call ST<ADDRESS> message-board-v3 pause-contract

# Withdraw all fees to safety
stacks-cli call ST<ADDRESS> message-board-v3 withdraw-fees -p '<BALANCE>' -p 'ST<SAFE-ADDRESS>'

# Deploy fixed version as v4
# Migrate data if necessary
# Update frontend to point to v4
```

#### Scenario 3: Ownership Transfer
```bash
# Verify recipient address carefully (IRREVERSIBLE)
# Transfer ownership
stacks-cli call ST<ADDRESS> message-board-v3 transfer-ownership -p 'ST<NEW-OWNER>'

# Verify transfer
stacks-cli call-read ST<ADDRESS> message-board-v3 get-contract-owner
# Should return: ST<NEW-OWNER>

# Old owner will lose all admin privileges
```

## Mainnet Deployment

### Pre-Mainnet Checklist
- [ ] All testnet tests passing for 7+ days
- [ ] Security audit recommendations implemented
- [ ] Frontend fully integrated and tested
- [ ] Emergency procedures documented and understood
- [ ] Monitoring/alerting configured
- [ ] Community testing completed
- [ ] Legal review (if applicable)
- [ ] Gas costs optimized
- [ ] Documentation complete and published

### Mainnet Deployment Steps
```bash
# 1. Generate mainnet deployment plan
clarinet deployments generate --mainnet --low-cost

# 2. Review plan carefully (REAL MONEY!)
cat deployments/default.mainnet-deployments.yaml

# 3. Ensure mainnet wallet funded (5+ STX recommended)

# 4. Deploy
clarinet deployments apply --mainnet

# 5. Verify immediately
curl "https://api.mainnet.hiro.so/v2/contracts/interface/SP<YOUR-ADDRESS>/message-board"

# 6. Run smoke tests on mainnet
# 7. Monitor closely for first 24 hours
# 8. Announce to community
```

### Post-Mainnet Launch
1. **First 24 Hours**: Monitor every transaction, check for errors
2. **First Week**: Daily checks of contract health, fee accumulation
3. **Ongoing**: Weekly withdrawals of fees, monthly security reviews

## Rollback Plan

If critical issues are discovered on mainnet:

1. **Pause contract immediately**: `(pause-contract)`
2. **Withdraw all fees**: `(withdraw-fees)`
3. **Deploy fixed version**: New contract address with fixes
4. **Migrate users**: Update frontend, notify community
5. **Note**: Cannot modify existing contract, only deploy new one

## Support & Resources

- **Testnet Explorer**: https://explorer.hiro.so/?chain=testnet
- **Mainnet Explorer**: https://explorer.hiro.so/
- **API Docs**: https://docs.hiro.so/
- **Clarity Docs**: https://docs.stacks.co/clarity/
- **Stacks Discord**: https://discord.gg/stacks

## Version History

- **v1**: Initial deployment (DEPRECATED - fee collection bug)
- **v2**: Fees disabled for testing (Current testnet: ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2)
- **v3**: Security enhanced with working fees (This version - pending deployment)

## Contract Statistics (v2 Testnet)
- Address: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2`
- Messages Posted: N/A (user testing completed successfully)
- Status: All functions confirmed working by user

## Next Steps

1. ✅ Complete comprehensive edge case tests
2. ⏳ Run full test suite and verify all pass
3. ⏳ Deploy v3 to testnet
4. ⏳ Complete 7-day testnet verification period
5. ⏳ Community testing phase
6. ⏳ Final security review
7. ⏳ Mainnet deployment
