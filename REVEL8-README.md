# Revel8

> **Human trust for trustless systems**

Revel8 is a consumer-facing trust layer for Web3, powered by [Intuition](https://intuition.systems). See community trust signals before you sign transactions, create trust attestations, and help others avoid scams.

<img alt="Revel8 Snap Screenshot" src="https://github.com/user-attachments/assets/6f599b3b-7198-48d9-ac40-ba33db0d0470" />

## What is Revel8?

Revel8 brings Intuition's decentralized knowledge graph directly into your wallet. When you're about to send a transaction, Revel8 shows you what the community thinks about the destination address—before you click "Confirm."

### The Problem

Users sign transactions to unknown addresses without any context. Scams succeed because there's no way to verify trust at the moment of signing.

### The Solution

Revel8 displays real-time trust signals from Intuition's knowledge graph:
- **Trust Signals**: See how many people have staked that an address is trustworthy (or not)
- **Community Aliases**: Human-readable labels assigned by the community
- **Economic Weight**: The market cap behind each trust position
- **Your Position**: Whether you've already staked on this address

---

## Products

### 🦊 Revel8 Snap

A MetaMask Snap that displays trust insights during transaction signing.

**Features:**
- Transaction insights before you sign
- Trust triple display (support/oppose positions)
- Community aliases
- Interactive actions (vote, add alias, view more)
- Multi-chain support (Intuition Testnet & Mainnet)

**Install:**
```
npm:revel8-snap
```

**Links:**
- [npm Package](https://www.npmjs.com/package/revel8-snap)
- [GitHub Repository](https://github.com/revel8-io/intuition-snap)
- [User Knowledge Base](docs/USER-KNOWLEDGE-BASE.md)

### 🔍 Revel8 Explorer

A web interface for viewing and creating trust data.

**Features:**
- Search any address for trust data
- Create trust triples
- Add aliases
- Stake on existing trust signals
- View trust history and analytics

**Link:** [revel8.io](https://revel8.io)

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    You Send a Transaction                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              MetaMask + Revel8 Snap                          │
│                                                              │
│   "Insights from Revel8"                                     │
│   ┌─────────────────────────────────────────────────────┐   │
│   │  Address: 0xCF90B...B2Bc4                           │   │
│   │  Trustworthy (2): 9.90 tTRUST                       │   │
│   │  Not trustworthy (0): 0.00 tTRUST                   │   │
│   │                                                      │   │
│   │  [Vote] [Add alias] [View more]                  │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Intuition Knowledge Graph                       │
│                                                              │
│   Atoms → Triples → Vaults → Trust Signals                  │
└─────────────────────────────────────────────────────────────┘
```

### Trust Data Structure

Revel8 queries Intuition for trust triples in the format:

```
[address] - hasTag - trustworthy
```

- **Support**: Stakers who believe the address is trustworthy
- **Oppose**: Stakers who believe the address is NOT trustworthy
- **Market Cap**: Total TRUST staked on each position

### Aliases

Community-assigned labels help identify addresses:

```
[address] - hasAlias - [alias]
```

Example: `0x1234...` → "Uniswap Router"

---

## Getting Started

### Install the Snap

1. Install [MetaMask](https://metamask.io) (or [MetaMask Flask](https://metamask.io/flask/) for development)
2. Install the Revel8 Snap:
   - From MetaMask Snaps Directory (coming soon)
   - Or directly: `npm:revel8-snap`
3. Use MetaMask normally—Revel8 insights appear automatically

### Create Trust Signals

1. Visit [Revel8 Explorer](https://revel8.io)
2. Connect your wallet
3. Search for an address
4. Click "Create Trust Triple" or "Add Alias"
5. Stake TRUST to add your signal

---

## For Developers

### Run Locally

```bash
# Clone the repository
git clone https://github.com/revel8-io/intuition-snap.git
cd intuition-snap

# Install dependencies
yarn install

# Start development server (testnet)
yarn start

# Or for mainnet
yarn start:mainnet
```

### Project Structure

```
revel8/
├── packages/
│   ├── snap/           # MetaMask Snap
│   │   ├── src/        # TypeScript source
│   │   ├── dist/       # Built bundle
│   │   └── snap.manifest.json
│   └── site/           # Development test site
├── docs/               # Documentation
└── scripts/            # Build scripts
```

### Chain Configuration

| Network | Chain ID | RPC URL | Currency |
|---------|----------|---------|----------|
| Testnet | 13579 | https://testnet.rpc.intuition.systems | tTRUST |
| Mainnet | 1155 | https://rpc.intuition.systems | TRUST |

### Atoms Used

| Atom | Purpose | ID |
|------|---------|-----|
| `hasTag` | Trust triple predicate | `0x6de69cc0ae3efe4000279b1bf365065096c8715d8180bc2a98046ee07d3356fd` |
| `trustworthy` | Trust characteristic | `0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a` |
| `hasAlias` | Alias predicate | `0xf8cfb4e3f1db08f72f255cf7afaceb4b32684a64dac0f423cdca04dd15cf4fd6` |

---

## Permissions

The Revel8 Snap requests these permissions:

| Permission | Purpose |
|------------|---------|
| `endowment:transaction-insight` | Display trust data before signing |
| `endowment:page-home` | Custom home page in MetaMask |
| `endowment:network-access` | Query Intuition GraphQL API |
| `endowment:rpc` | Communicate with dapps |

**Security Note:** Revel8 does NOT request key management permissions. It cannot access your private keys or sign transactions on your behalf.

---

## Roadmap

- [x] Revel8 Snap v1.0.0
- [x] npm package published
- [ ] MetaMask Snaps Directory listing
- [ ] Revel8 Explorer v1.0
- [ ] Trust analytics dashboard
- [ ] Multi-address batch insights
- [ ] Browser extension
- [ ] API for third-party integration

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

1. Install [MetaMask Flask](https://metamask.io/flask/)
2. Clone and run locally (see above)
3. Make changes and test
4. Submit a PR

---

## Links

- **Website:** https://revel8.io
- **Snap npm:** https://www.npmjs.com/package/revel8-snap
- **GitHub:** https://github.com/revel8-io/intuition-snap
- **Intuition Protocol:** https://intuition.systems

---

## License

Dual-licensed under [Apache 2.0](LICENSE.APACHE2) and [MIT](LICENSE.MIT0).

---

## About

Revel8 is built on [Intuition](https://intuition.systems), a decentralized knowledge graph protocol. Intuition allows anyone to create attestations about any subject and stake economic value behind their claims.

**Powered by Intuition** 🧠

