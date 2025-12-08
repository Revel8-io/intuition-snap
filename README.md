# Intuition Snap

A MetaMask Snap that displays real-time trust and reputation data from the [Intuition](https://intuition.systems) knowledge graph during transaction signing.

## What is this?

When you're about to send a transaction to an address, the Intuition Snap shows you:
- **Trust signals** — How many people have staked that the address is trustworthy (or not)
- **Aliases** — Community-assigned labels for the address
- **Stake amounts** — The economic weight behind each trust signal

This helps you make informed decisions before interacting with unknown addresses.

<img height="180" alt="Intuition Snap Screenshot" src="https://github.com/user-attachments/assets/6f599b3b-7198-48d9-ac40-ba33db0d0470" />

## Features

- **Transaction Insights** — `onTransaction` hook displays trust data before you sign
- **Trust Triple Display** — Shows support/oppose positions on `[address] has tag trustworthy`
- **Alias Display** — Shows community-assigned aliases for addresses
- **Multi-chain Support** — Works on Intuition Testnet and Mainnet

## Requirements

- [MetaMask Flask](https://docs.metamask.io/snaps/get-started/install-flask) (for development)
- Node.js ≥ 18.6.0
- pnpm or yarn

## Development

To run this Snap locally:

1. Install [MetaMask Flask](https://docs.metamask.io/snaps/get-started/install-flask)
2. Clone this repository
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Start the development server:
   ```bash
   pnpm start
   ```
5. Browse to `http://localhost:8000`
6. Click "Connect" and approve the Snap connection

Your code changes will now be reflected when using the Snap.

### Chain Configuration

By default, the Snap connects to **Intuition Testnet**. To use mainnet:

```bash
pnpm start:mainnet
```

## Atoms Used

The Snap queries the Intuition knowledge graph using these predefined atoms:

| Atom | Purpose | ID |
|------|---------|------------|
| `hasTag` | Predicate for trust triples | `0x6de69cc0ae3efe4000279b1bf365065096c8715d8180bc2a98046ee07d3356fd`
| `trustworthy` | The "trustworthiness" characteristic | `0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a`
| `hasAlias` | Predicate for alias lists | `0xf8cfb4e3f1db08f72f255cf7afaceb4b32684a64dac0f423cdca04dd15cf4fd6`

**Trust Triple structure:** `[address] - hasTag - trustworthy`
**Alias List structure:** `[address] - hasAlias - [alias atom]`

Configuration is defined in `packages/snap/src/config.ts`.

## Project Structure

```
intuition-snap/
├── packages/
│   ├── snap/          # The MetaMask Snap
│   │   ├── src/       # Source code
│   │   └── dist/      # Built bundle
│   └── site/          # Development site for testing
├── docs/              # Documentation
└── scripts/           # Build scripts
```

## User Documentation

For end-user documentation and support, see the [User Knowledge Base](docs/USER-KNOWLEDGE-BASE.md).

## License

This project is dual-licensed under [Apache 2.0](LICENSE.APACHE2) and [MIT](LICENSE.MIT0).
