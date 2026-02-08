# BitChat User Guide

Welcome to BitChat - A decentralized messaging platform on the Stacks blockchain!

## Table of Contents
1. [Getting Started](#getting-started)
2. [Posting Messages](#posting-messages)
3. [Pinning Messages](#pinning-messages)
4. [Reactions](#reactions)
5. [Understanding Fees](#understanding-fees)
6. [Spam Prevention](#spam-prevention)
7. [Your Message Statistics](#your-message-statistics)
8. [Troubleshooting](#troubleshooting)
9. [Frequently Asked Questions](#frequently-asked-questions)

## Getting Started

### What You Need
- A Stacks wallet (Hiro Wallet, Xverse, or Leather)
- Some STX tokens for transaction fees
- A web browser (Chrome, Firefox, Brave)

### First-Time Setup
1. Install a Stacks wallet extension
2. Fund your wallet with 1-2 STX from an exchange
3. Connect your wallet to BitChat
4. You're ready to post!

## Posting Messages

### How to Post
1. Type your message in the text box (1-280 characters)
2. Click "Post Message"
3. Confirm the transaction in your wallet
4. Wait for blockchain confirmation (~10 minutes)

### Message Requirements
- **Minimum length**: 1 character
- **Maximum length**: 280 characters (like Twitter/X)
- **Content**: UTF-8 text (emojis supported! 🎉)
- **Cooldown**: Must wait 6 blocks (~60 minutes) between your own posts

### Costs
- **Posting fee**: 0.01 STX (10,000 microSTX)
- **Gas fee**: ~0.0001 STX (varies by network congestion)
- **Total cost**: ~0.0101 STX per message

### Example
```
Message: "Hello BitChat! 👋 My first decentralized message"
Cost: 0.0101 STX
Time to confirm: ~10 minutes
```

## Pinning Messages

### What is Pinning?
Pinning highlights your message at the top of the feed for a specified duration. Perfect for important announcements!

### How to Pin
1. Post a message first
2. Wait for it to be confirmed
3. Click the "Pin" button on your message
4. Choose duration (24 hours or 72 hours)
5. Confirm payment
6. Your message appears at the top!

### Pin Durations & Costs
- **24 hours**: 0.05 STX (50,000 microSTX) for 144 blocks
- **72 hours**: 0.10 STX (100,000 microSTX) for 432 blocks

### Pin Rules
- Only the message author can pin their own message
- One pin per message
- Pin expires automatically after duration
- Must wait for post cooldown before pinning

### Example
```
Action: Pin message "Check out my new NFT collection!"
Duration: 24 hours
Cost: 0.05 STX + gas
Visibility: Top of feed for 144 blocks
```

## Reactions

### How Reactions Work
Show appreciation or agreement by reacting to any message (including others' messages).

### How to React
1. Find a message you like
2. Click the ❤️ or reaction button
3. Confirm the small fee
4. Your reaction is recorded!

### Reaction Rules
- **Cost**: 0.005 STX (5,000 microSTX) per reaction
- **Limit**: One reaction per message per user
- **Duplicate**: Trying to react twice to the same message will fail

### Reaction Counter
Each message displays its total reaction count. Click to see who reacted!

## Understanding Fees

### Why Are There Fees?
1. **Spam Prevention**: Small fees discourage spam and abuse
2. **Network Costs**: Blockchain transactions require gas
3. **Sustainability**: Fees help maintain the platform
4. **Decentralization**: No central server costs, fees go to contract

### Fee Breakdown
| Action | Contract Fee | Typical Gas | Total Cost |
|--------|--------------|-------------|------------|
| Post Message | 0.01 STX | ~0.0001 STX | ~0.0101 STX |
| Pin 24hr | 0.05 STX | ~0.0001 STX | ~0.0501 STX |
| Pin 72hr | 0.10 STX | ~0.0001 STX | ~0.1001 STX |
| React | 0.005 STX | ~0.0001 STX | ~0.0051 STX |

### Where Do Fees Go?
- Contract fees (0.01 STX, etc.) go to the BitChat smart contract
- Gas fees go to Stacks miners
- Contract owner can withdraw to fund development, maintenance, and improvements

### Gas Costs
Gas costs vary based on:
- Network congestion (busy times = higher gas)
- Transaction complexity (simple = cheaper)
- Gas price you set (higher = faster confirmation)

**Tip**: Post during off-peak hours (late night UTC) for lower gas fees!

## Spam Prevention

### Cooldown Period
To prevent spam, you must wait **6 blocks** (~60 minutes) between posting your own messages.

### How It Works
1. You post a message successfully
2. Try to post again immediately
3. Transaction fails with "too soon" error
4. Wait ~60 minutes
5. Post again successfully

### Why This Exists
- Prevents automated spam bots
- Encourages thoughtful content
- Reduces blockchain bloat
- Makes the platform more sustainable

### Doesn't Apply To
- Different users posting (everyone can post simultaneously)
- Pinning your existing messages
- Reacting to messages
- Reading/browsing

### Pro Tip
The cooldown is per user, not global! Multiple people can post at the same time. Plan your posts carefully since you only get one per hour.

## Your Message Statistics

### What's Tracked
Every user has statistics showing:
- **Messages Posted**: Total number of messages you've posted
- **Total Spent**: All STX you've spent on posts, pins, and reactions

### How to View
- Check your profile page
- Call the contract's `get-user-stats` function
- View on blockchain explorers

### Example Stats
```
User: ST1ABC...
Messages Posted: 42
Total Spent: 0.87 STX

Breakdown:
- Posts: 42 × 0.01 = 0.42 STX
- Pins: 5 × 0.05 = 0.25 STX
- Reactions: 40 × 0.005 = 0.20 STX
```

### Leaderboards
Future features may include:
- Most active posters
- Top reactors
- Highest spenders
- Trending messages

## Troubleshooting

### Error: "too soon" (err u106)
**Problem**: Trying to post before 6-block cooldown expires

**Solution**: Wait ~60 minutes since your last post, then try again

**How to check**: Use block explorer to see current block height, compare to your last post's block

### Error: "contract paused" (err u107)
**Problem**: Contract is temporarily paused by administrator

**Solution**: Wait for contract to be unpaused (check status page or announcements)

**Why this happens**: Emergency maintenance, security issues, or planned upgrades

### Error: "unauthorized" (err u102)
**Problem**: Trying to pin someone else's message

**Solution**: You can only pin messages you authored

### Error: "already reacted" (err u105)
**Problem**: You've already reacted to this message

**Solution**: Each user can only react once per message

### Error: "invalid input" (err u103)
**Problem**: Message is empty or longer than 280 characters

**Solution**: 
- Add content if message is empty
- Shorten message to 280 characters or less

### Error: "not found" (err u101)
**Problem**: Message ID doesn't exist

**Solution**: Verify the message ID is correct, ensure message was actually posted

### Transaction Pending Forever
**Problem**: Transaction stuck in mempool

**Solutions**:
1. Check transaction status on explorer
2. Increase gas fee and retry
3. Wait for network congestion to clear
4. Try posting during off-peak hours

### Wallet Won't Connect
**Problem**: Wallet extension not detected

**Solutions**:
1. Ensure wallet extension is installed and unlocked
2. Refresh the page
3. Try a different browser
4. Clear browser cache
5. Update wallet extension to latest version

## Frequently Asked Questions

### General Questions

**Q: Is BitChat truly decentralized?**

A: Yes! All messages are stored on the Stacks blockchain, which is secured by Bitcoin. No central server can censor or delete your messages.

**Q: Can my messages be deleted?**

A: No. Once posted to the blockchain, messages are permanent and immutable. Think carefully before posting!

**Q: Can I edit my messages?**

A: No. Blockchain transactions are immutable. Make sure your message is correct before posting.

**Q: Are my messages anonymous?**

A: No. All messages are linked to your Stacks address. While addresses are pseudonymous, they can potentially be linked to your identity if you've used them on exchanges or other KYC services.

**Q: How long do messages last?**

A: Forever! Blockchain data is permanent. Your messages will exist as long as the Stacks blockchain exists.

### Cost & Fees

**Q: Why do I have to pay fees?**

A: Fees serve multiple purposes:
1. Prevent spam (zero-cost messages would be abused)
2. Cover blockchain transaction costs
3. Sustain the platform
4. Align with decentralized economic model

**Q: Are fees refundable?**

A: No. Blockchain transactions are final. Failed transactions still consume gas fees.

**Q: Can fees change?**

A: Contract fees are fixed in the smart contract. To change them, a new version of the contract would need to be deployed. Gas fees vary based on network conditions.

**Q: How much STX should I have in my wallet?**

A: Recommended amounts:
- Casual user (1-2 posts/day): 1 STX
- Active user (daily posts + pins): 5 STX
- Power user (frequent activity): 10+ STX

### Spam Prevention

**Q: Why can't I post multiple messages quickly?**

A: The 6-block cooldown prevents spam and encourages quality over quantity.

**Q: Can I bypass the cooldown by using multiple wallets?**

A: Technically yes, but each wallet requires its own STX for fees, making spam expensive.

**Q: Does the cooldown apply to reactions?**

A: No! You can react to as many different messages as you want immediately.

**Q: What if I made a typo and need to repost?**

A: Unfortunately, you'll need to wait for the cooldown. Double-check your messages before posting!

### Pinning

**Q: Can I pin someone else's message?**

A: No. Only the author can pin their own message.

**Q: Can I extend a pin after it's posted?**

A: Not currently. You'd need to pin it again for another duration (paying again).

**Q: What happens when a pin expires?**

A: The message remains on the blockchain but is no longer highlighted at the top. It returns to its normal chronological position.

**Q: Can I unpin before expiry?**

A: Not in v3. Pins automatically expire after their duration.

### Technical

**Q: What blockchain is BitChat on?**

A: Stacks, a Bitcoin layer that enables smart contracts while settling on Bitcoin for security.

**Q: What programming language is the contract written in?**

A: Clarity - a decidable, non-Turing complete language designed for predictable execution and security.

**Q: Can I verify the contract code?**

A: Yes! The contract is open source. View it on the Stacks explorer or GitHub.

**Q: What's the contract address?**

A: 
- Testnet v2: `ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.message-board-v2`
- Mainnet: TBD (check official website/documentation)

**Q: How are messages stored?**

A: In the contract's `messages` map, indexed by an incrementing counter (nonce). Each message contains:
- Author (principal/address)
- Content (string, max 280 chars)
- Timestamp (block height)
- Pinned status (boolean)
- Pin expiry (block height)
- Reaction count (uint)

### Privacy & Security

**Q: Are messages encrypted?**

A: No. All messages are public and readable by anyone. Don't post sensitive information!

**Q: Can the contract owner censor me?**

A: No. The contract owner can pause the contract (preventing new posts) but cannot delete or modify existing messages.

**Q: What if the contract owner is malicious?**

A: Contract ownership can be transferred to a DAO or multi-sig wallet for decentralized governance. You can also fork the open-source code and deploy your own version.

**Q: Can I be banned?**

A: There's no ban function. However, if the contract is paused, no one (including you) can post until it's unpaused.

**Q What data does BitChat collect?**

A: BitChat itself collects no data. All interactions are directly with the blockchain smart contract. Your wallet may log transaction history.

### Contract States

**Q: What does "contract paused" mean?**

A: The contract owner has temporarily halted all posting, pinning, and reaction operations. Usually for maintenance or emergency response.

**Q: How do I know if the contract is paused?**

A: Check the website banner, call `is-contract-paused` read-only function, or check the status page.

**Q: How long does a pause last?**

A: Depends on the reason. Could be minutes (quick fix) to days (major upgrade). Check announcements.

**Q: Can I read messages while paused?**

A: Yes! Reading is always allowed. Only write operations (post, pin, react) are paused.

### Economics

**Q: Where do my STX fees go?**

A: 
- Contract fees: Held in the smart contract's balance
- Gas fees: Paid to Stacks miners who process transactions
- Contract owner can withdraw contract fees for development/maintenance

**Q: Is BitChat profitable?**

A: BitChat is designed to be sustainable. Fees collected help fund ongoing development, security, audits, and feature improvements.

**Q: Can I earn STX by using BitChat?**

A: Not currently. Future versions may include:
- Author rewards for popular messages
- Reaction rewards
- Referral bonuses
- Creator monetization

### Roadmap

**Q: What features are planned?**

A: Potential future features:
- Message threads/comments
- User profiles
- Image/media support (via IPFS links)
- Hashtags and search
- Direct messages
- Tipping system
- NFT integration
- DAO governance

**Q: Can I request a feature?**

A: Yes! Join the community Discord/Telegram or open a GitHub issue.

**Q: Will there be a mobile app?**

A: Potentially! The web app works on mobile browsers. Native mobile development is under consideration.

### Community

**Q: Where can I get help?**

A: 
- Discord: [TBD]
- Telegram: [TBD]
- GitHub Issues: [TBD]
- Email support: [TBD]

**Q: How can I contribute?**

A: 
- Report bugs
- Suggest features
- Help test new versions
- Create content/tutorials
- Develop integrations
- Submit pull requests

**Q: Is there a bug bounty program?**

A: Check the website/GitHub for current security programs. Responsible disclosure is always appreciated.

## Best Practices

### Security
- ✅ Never share your seed phrase or private keys
- ✅ Use a hardware wallet for large amounts
- ✅ Verify the contract address before interacting
- ✅ Start with small amounts when testing
- ✅ Keep your wallet software updated

### Content
- ✅ Think before posting (messages are permanent!)
- ✅ Be respectful and constructive
- ✅ Don't post personal information
- ✅ Don't post illegal content
- ✅ Verify facts before sharing

### Cost Optimization
- ✅ Post during off-peak hours for lower gas
- ✅ Batch your activity (plan posts in advance)
- ✅ Use reactions more than posts (cheaper!)
- ✅ Only pin truly important messages
- ✅ Monitor your spending with user stats

### User Experience
- ✅ Write clear, concise messages
- ✅ Use emojis for expression 😊
- ✅ React to messages you appreciate
- ✅ Pin announcements strategically
- ✅ Check your cooldown before planning posts

## Support

Need more help? 
- 📚 Read the full documentation
- 💬 Join the community chat
- 🐛 Report bugs on GitHub
- 📧 Contact support: [TBD]

Happy decentralized messaging! 🚀
