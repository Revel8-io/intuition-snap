# Hive Mind Snap - User Knowledge Base

> **Last Updated:** January 2, 2025
> **Snap Version:** 1.0.0
> **For:** End users of the Hive Mind MetaMask Snap

---

## Table of Contents

- [Hive Mind Snap - User Knowledge Base](#hive-mind-snap---user-knowledge-base)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Installing the Snap](#installing-the-snap)
    - [First Time Setup](#first-time-setup)
    - [Permissions Explained](#permissions-explained)
  - [Using the Snap](#using-the-snap)
    - [How It Works](#how-it-works)
    - [Understanding Transaction Insights](#understanding-transaction-insights)
    - [Reading Trust Signals](#reading-trust-signals)
    - [Understanding Aliases](#understanding-aliases)
    - [Using Interactive Features](#using-interactive-features)
  - [Features](#features)
    - [Trust Triple Display](#trust-triple-display)
    - [Address Classification](#address-classification)
    - [Multi-Chain Support](#multi-chain-support)
    - [Home Page](#home-page)
  - [Troubleshooting](#troubleshooting)
    - [Snap Not Showing Insights](#snap-not-showing-insights)
    - [Trust Data Not Appearing](#trust-data-not-appearing)
    - [Common Error Messages](#common-error-messages)
    - [Chain Compatibility Issues](#chain-compatibility-issues)
  - [FAQs](#faqs)
    - [Privacy \& Security](#privacy--security)
    - [Data Sources](#data-sources)
    - [Updates \& Maintenance](#updates--maintenance)
    - [General Usage](#general-usage)
  - [Getting Help](#getting-help)

---

## Getting Started

### Installing the Snap

The Hive Mind Snap can be installed directly from MetaMask once it's available in the Snaps Directory.

**Installation Steps:**

1. Open MetaMask in your browser
2. Click the three-dot menu (⋮) in the top right
3. Navigate to **Settings** → **Snaps**
4. Click **"Add Snap"** or **"Browse Snaps"**
5. Search for **"Hive Mind"** or enter the Snap ID: `npm:@hivemindhq/snap`
6. Click **"Add to MetaMask"**
7. Review and approve the permissions requested by the Snap

**Alternative Installation:**

If you have the Snap ID, you can install it directly by entering:
```
npm:@hivemindhq/snap
```

### First Time Setup

After installation, the Hive Mind Snap is ready to use immediately. No additional configuration is required.

**What Happens Next:**

- The Snap will automatically activate when you initiate transactions
- You'll see trust insights appear before confirming transactions
- You can access the Snap's home page from MetaMask Settings → Snaps → Hive Mind

### Permissions Explained

The Hive Mind Snap requests the following permissions:

| Permission | Purpose | Why It's Needed |
|------------|---------|-----------------|
| **Transaction Insights** | Display trust data before you sign transactions | Shows trust signals at the critical moment when you're deciding whether to proceed |
| **Network Access** | Query the Intuition knowledge graph | Fetches real-time trust data from the decentralized knowledge graph |
| **RPC Communication** | Communicate with dapps | Allows the Snap to work seamlessly with web3 applications |
| **Home Page** | Display custom Snap interface | Provides a welcome page and links to Hive Mind resources |

**Privacy Note:** The Snap does not collect or store your personal data. It only queries public trust data from the Intuition knowledge graph.

---

## Using the Snap

### How It Works

The Hive Mind Snap works automatically—no manual activation needed.

**When You Send a Transaction:**

1. You initiate a transaction to any Ethereum address
2. Before you confirm, MetaMask shows a **Hive Mind insight panel**
3. The panel displays trust data for the destination address
4. You review the information and decide whether to proceed
5. Confirm or cancel the transaction as usual

**The insight appears automatically**—you don't need to do anything special. Just use MetaMask normally, and Hive Mind will show trust data when available.

### Understanding Transaction Insights

When you're about to send a transaction, the Hive Mind Snap displays an insight panel with:

**Trust Signals:**
- **Support positions**: How many people have staked that the address is trustworthy
- **Oppose positions**: How many people have staked that the address is untrustworthy
- **Stake amounts**: The total economic value (market cap) behind each position

**Community Aliases:**
- Labels that the community has assigned to the address
- Helps identify known entities and avoid impersonators

**Your Position (if applicable):**
- Shows whether you've already staked on this address
- Displays your support or oppose position

**Address Type:**
- Indicates whether the address is an EOA (Externally Owned Account) or a smart contract

### Reading Trust Signals

Trust signals show community sentiment about an address:

**Support Position:**
- Number of stakers who believe the address is trustworthy
- Total stake amount (market cap) behind this position
- Higher stakes indicate stronger community confidence

**Oppose Position:**
- Number of stakers who believe the address is untrustworthy
- Total stake amount (market cap) behind this position
- Warning signal if oppose stakes are high

**How to Interpret:**
- **High support, low oppose**: Address is generally trusted by the community
- **Low support, high oppose**: Address may be risky—proceed with caution
- **No trust data**: Address hasn't been evaluated yet—use your own judgment
- **Balanced positions**: Community is divided—consider the stake amounts

**Remember:** Trust signals are community opinions, not guarantees. Always do your own research.

### Understanding Aliases

Aliases are community-assigned labels for addresses:

**What They Show:**
- Common names or identifiers for the address
- Helps verify you're sending to the right entity
- Can reveal if an address is impersonating a known brand

**Examples:**
- "Uniswap Router" for a known DeFi protocol
- "OpenSea Marketplace" for NFT trading
- "Known Scam" for addresses flagged by the community

**How to Use:**
- Verify the alias matches what you expect
- Be cautious if aliases don't match the entity you think you're interacting with
- Use aliases as one piece of information, not the only factor

### Using Interactive Features

The Hive Mind Snap includes interactive footer links:

**Create Trust Triple:**
- Appears when an address has no trust data
- Click to create the first trust signal for this address
- Opens the Hive Mind Explorer to create a trust triple

**Stake on Trust Triple:**
- Appears when trust data exists but you haven't staked yet
- Click to add your own trust signal (support or oppose)
- Opens the Hive Mind Explorer to stake

**Create Alias:**
- Appears when an address has no alias
- Click to assign an alias to this address
- Opens the Hive Mind Explorer to create an alias

**View More:**
- Always available
- Opens the full address page on the Hive Mind Explorer
- See detailed trust data, history, and more information

---

## Features

### Trust Triple Display

The Snap displays trust triples in the format: `[address] has tag trustworthy`

**What You See:**
- Support count: Number of stakers supporting this claim
- Oppose count: Number of stakers opposing this claim
- Market cap: Total economic value staked on each position
- Your position: Whether you've staked (if applicable)

**How It Works:**
- Trust triples are stored on the Intuition blockchain
- Anyone can create or stake on trust triples
- Economic stakes add weight to community opinions

### Address Classification

The Snap automatically detects address types:

**EOA (Externally Owned Account):**
- Standard Ethereum wallet address
- Controlled by a private key
- Used for personal wallets

**Smart Contract:**
- Programmable address with code
- Used for DeFi protocols, dapps, and automated systems
- May have different trust characteristics than EOAs

**Why It Matters:**
- Contracts and EOAs may have different trust data
- The Snap queries the appropriate format automatically
- You'll see the correct trust data regardless of address type

### Multi-Chain Support

The Hive Mind Snap supports:

**Intuition Testnet:**
- Chain ID: 13579
- For testing and development
- Testnet trust data is separate from mainnet

**Intuition Mainnet:**
- Chain ID: 1155
- Production network
- Real trust data with economic stakes

**How It Works:**
- The Snap automatically detects which chain you're using
- Queries the appropriate Intuition network
- Displays trust data from the correct chain

### Home Page

Access the Snap's home page from:
**MetaMask Settings → Snaps → Hive Mind → Open**

**What's There:**
- Welcome message
- Links to Hive Mind product suite
- Links to learn more about Intuition
- Quick access to Snap information

---

## Troubleshooting

### Snap Not Showing Insights

**Problem:** Transaction insights don't appear when sending transactions.

**Solutions:**

1. **Verify Snap is Installed:**
   - Go to MetaMask Settings → Snaps
   - Confirm "Hive Mind" appears in your installed Snaps list
   - If not installed, reinstall from the Snaps Directory

2. **Check Permissions:**
   - Ensure all permissions were approved during installation
   - Go to Settings → Snaps → Hive Mind → Permissions
   - Re-approve if needed

3. **Refresh MetaMask:**
   - Close and reopen MetaMask
   - Try the transaction again

4. **Check Network:**
   - Ensure you're on a supported network
   - The Snap works on Ethereum mainnet and testnets
   - Some networks may not be supported

### Trust Data Not Appearing

**Problem:** Insight panel shows "No trust data" or empty state.

**Possible Reasons:**

1. **Address Has No Trust Data:**
   - This is normal for new or unknown addresses
   - The community hasn't evaluated this address yet
   - Use the "Create Trust Triple" link to add the first trust signal

2. **Network Issues:**
   - The Intuition API may be temporarily unavailable
   - Check your internet connection
   - Try again in a few moments

3. **Address Format:**
   - The Snap handles both standard and CAIP-10 formats
   - If trust data exists in an alternate format, you'll see a notification
   - The Snap will show alternate format data when available

**What to Do:**
- If no trust data exists, proceed with caution
- Use the footer links to create trust data
- Check the Hive Mind Explorer for more information

### Common Error Messages

**"Failed to fetch account data":**
- Network connectivity issue
- Intuition API temporarily unavailable
- Solution: Check internet connection and try again

**"Chain switch failed":**
- Unable to switch to the required chain
- Solution: Manually switch to the correct network in MetaMask

**"No atom exists for address":**
- Address hasn't been registered in the Intuition knowledge graph
- This is normal for new addresses
- Solution: Use "Create Trust Triple" to add the address

**"Atom exists but no trust data yet":**
- Address is registered but has no trust signals
- Solution: Use "Create Trust Triple" to add the first trust signal

### Chain Compatibility Issues

**Supported Networks:**
- Ethereum Mainnet
- Ethereum Testnets (Goerli, Sepolia)
- Other EVM-compatible chains (trust data may be limited)

**Intuition Networks:**
- Intuition Testnet (Chain ID: 13579)
- Intuition Mainnet (Chain ID: 1155)

**If Trust Data Doesn't Match:**
- Trust data is chain-specific
- Mainnet and testnet data are separate
- Ensure you're checking trust data for the correct network

---

## FAQs

### Privacy & Security

**Q: Does Hive Mind Snap collect my personal data?**
A: No. The Snap only queries public trust data from the Intuition knowledge graph. It does not collect, store, or transmit your personal information.

**Q: Can the Snap see my transaction history?**
A: The Snap only sees the transaction you're currently signing. It does not access your transaction history or wallet balance.

**Q: Is my wallet address shared with Hive Mind?**
A: The Snap uses your connected wallet address only to check if you've staked on addresses (to show "Your Position"). This is optional and the Snap works without it.

**Q: How secure is the trust data?**
A: Trust data is stored on the Intuition blockchain, making it transparent and tamper-resistant. However, trust signals are community opinions, not guarantees of safety.

### Data Sources

**Q: Where does the trust data come from?**
A: Trust data comes from the Intuition knowledge graph—a decentralized protocol where anyone can create trust signals and stake on them.

**Q: Who creates trust signals?**
A: Anyone can create trust signals. The community collectively evaluates addresses by staking on trust triples.

**Q: How reliable is the trust data?**
A: Trust data reflects community sentiment, not absolute truth. Higher stake amounts indicate stronger community confidence, but always do your own research.

**Q: Can trust data be manipulated?**
A: While anyone can create trust signals, economic stakes add weight. Manipulating trust data requires significant economic investment, making it costly and impractical.

**Q: What if trust data is wrong?**
A: You can stake against incorrect trust signals. The economic weight of your stake helps balance community opinion.

### Updates & Maintenance

**Q: How do I update the Snap?**
A: Snap updates are handled automatically by MetaMask. You'll be notified when updates are available.

**Q: Will I lose my data if I uninstall?**
A: The Snap doesn't store personal data. Trust data remains on the Intuition blockchain regardless of Snap installation.

**Q: How often is trust data updated?**
A: Trust data is updated in real-time. The Snap queries the latest data each time you initiate a transaction.

**Q: What happens if Hive Mind shuts down?**
A: Trust data is stored on the Intuition blockchain, not on Hive Mind servers. The data remains accessible even if Hive Mind services are unavailable.

**Q: Can I use the Snap without internet?**
A: No. The Snap requires internet connectivity to query the Intuition knowledge graph.

### General Usage

**Q: Does the Snap work with all dapps?**
A: Yes. The Snap works with any dapp that uses MetaMask for transactions.

**Q: Can I disable the Snap temporarily?**
A: Yes. Go to MetaMask Settings → Snaps → Hive Mind and toggle it off. Re-enable when needed.

**Q: Does the Snap slow down transactions?**
A: The Snap adds minimal delay (typically less than a second) to fetch trust data. This is usually imperceptible.

**Q: What if I disagree with a trust signal?**
A: You can stake against trust signals you disagree with. Use the "Stake on Trust Triple" link to add your position.

**Q: Can I create trust signals for my own address?**
A: Yes. Anyone can create trust signals for any address, including their own.

---

## Getting Help

**Support Resources:**

- **Hive Mind Website:** https://hivemindhq.io
- **Intuition Protocol:** https://intuition.systems
- **Hive Mind Explorer:** https://hivemindhq.io/explorer (for detailed trust data)
- **GitHub Repository:** https://github.com/hivemindhq-io/intuition-snap
- **Report Issues:** https://github.com/hivemindhq-io/intuition-snap/issues

**For Technical Issues:**
- Check this knowledge base first
- Search existing GitHub issues
- Create a new issue with details about your problem

**For Trust Data Questions:**
- Visit the Hive Mind Explorer to see detailed trust data
- Learn more about Intuition at https://intuition.systems
- Check the Intuition documentation for protocol details

---

*This knowledge base is specific to the Hive Mind MetaMask Snap. For information about the broader Intuition protocol or Hive Mind products, please visit the respective websites.*

