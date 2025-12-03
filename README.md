# Intuition Snap

A MetaMask Snap that displays real-time trust and reputation data from the [Intuition](https://intuition.systems) knowledge graph during transaction signing.

## What is this?

When you're about to send a transaction to an address, the Intuition Snap shows you:
- **Trust signals** — How many people have staked that the address is trustworthy (or not)
- **Nicknames** — Community-assigned labels for the address
- **Stake amounts** — The economic weight behind each trust signal

This helps you make informed decisions before interacting with unknown addresses.

<img height="180" alt="Intuition Snap Screenshot" src="https://github.com/user-attachments/assets/6f599b3b-7198-48d9-ac40-ba33db0d0470" />

## Features

- **Transaction Insights** — `onTransaction` hook displays trust data before you sign
- **Trust Triple Display** — Shows support/oppose positions on `[address] is trustworthy`
- **Nickname Display** — Shows community-assigned nicknames for addresses
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
| `hasCharacteristic` | Predicate for trust triples | `0x5cc843bd9ba824dbef4e80e7c41ced4ccde30a7b9ac66f0499c5766dc8811801`
| `trustworthiness` | The "trustworthiness" characteristic | `0xae42e29e99b1f8711da1cac930079b0ce615ca3c4c0392ef8c74c56ef803126b`
| `hasNickname` | Predicate for nickname lists | `0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322`

**Trust Triple structure:** `[address] - hasCharacteristic - trustworthy`
**Nickname List structure:** `[address] - hasNickname - [nickname atom]`

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
