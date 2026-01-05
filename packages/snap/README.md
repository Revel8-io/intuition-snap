# Hive Mind Snap

A MetaMask Snap that displays real-time trust and reputation data from the [Intuition](https://intuition.systems) knowledge graph during transaction signing.

## What Does This Snap Do?

When you're about to send a transaction to an address, the Hive Mind Snap shows you:

- **Trust Signals** — How many people have staked that the address is trustworthy (or not)
- **Aliases** — Community-assigned labels for the address
- **Stake Amounts** — The economic weight behind each trust signal
- **Your Position** — Whether you've already staked on this address

This helps you make informed decisions before interacting with unknown addresses.

## Features

| Feature | Description |
|---------|-------------|
| **Transaction Insights** | `onTransaction` hook displays trust data before you sign |
| **Trust Triple Display** | Shows support/oppose positions on `[address] has tag trustworthy` |
| **Alias Display** | Shows community-assigned aliases for addresses |
| **Multi-chain Support** | Works on Intuition Testnet (chain ID: 13579) and Mainnet (chain ID: 1155) |
| **Interactive UI** | Links to create trust signals or view more data on the web |

## Installation

### From npm (once published)

```bash
# The snap will be installable directly through MetaMask
# Package name: @hivemindhq/snap
```

### For Development

See the [Development](#development) section below.

## Permissions

This Snap requires the following permissions:

| Permission | Purpose |
|------------|---------|
| `endowment:transaction-insight` | Display insights before transaction signing |
| `endowment:ethereum-provider` | Access the connected wallet address |
| `endowment:network-access` | Query the Intuition GraphQL API |
| `endowment:rpc` | Communicate with dapps |

## Development

### Prerequisites

- [MetaMask Flask](https://docs.metamask.io/snaps/get-started/install-flask) (development version of MetaMask)
- Node.js ≥ 18.6.0
- Yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hivemindhq-io/intuition-snap.git
   cd intuition-snap
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   yarn start
   ```

4. Open `http://localhost:8000` and connect the Snap to MetaMask Flask

### Chain Configuration

By default, the Snap connects to **Intuition Testnet**. To use mainnet:

```bash
yarn start:mainnet
```

Or explicitly specify testnet:

```bash
yarn start:testnet
```

## Testing

Run the test suite:

```bash
yarn test
```

Tests use [`@metamask/snaps-jest`](https://github.com/MetaMask/snaps/tree/main/packages/snaps-jest) for Snap-specific testing utilities.

## Architecture

```
src/
├── index.tsx           # Entry point, exports handlers
├── onTransaction.tsx   # Transaction insight handler
├── onUserInput.tsx     # User interaction handler
├── account.tsx         # Account data fetching and rendering
├── queries.ts          # GraphQL queries for Intuition API
├── config.ts           # Chain configuration (testnet/mainnet)
├── types.ts            # TypeScript type definitions
├── util.ts             # Utility functions
├── components/         # JSX UI components
│   ├── Account.tsx     # Main account display component
│   └── Footer/         # Footer links and actions
├── images/             # Snap icon assets
└── vendors/            # Vendor configuration (git-ignored)
```

## Configuration

Chain settings are defined in `src/config.ts`:

| Network | Chain ID | RPC URL | Currency |
|---------|----------|---------|----------|
| Testnet | 13579 | `https://testnet.rpc.intuition.systems` | tTRUST |
| Mainnet | 1155 | `https://rpc.intuition.systems` | TRUST |

### Atoms Used

The Snap queries the Intuition knowledge graph using these predefined atoms:

| Atom | Purpose |
|------|---------|
| `hasTag` | Predicate for trust triples |
| `trustworthy` | The "trustworthy" characteristic |
| `hasAlias` | Predicate for alias relationships |

## Building

```bash
# Build the snap bundle
yarn build

# Clean and rebuild
yarn build:clean
```

The built bundle is output to `dist/bundle.js`.

## Linting

```bash
# Run all linters
yarn lint

# Fix auto-fixable issues
yarn lint:fix
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass (`yarn test`)
- Code passes linting (`yarn lint`)
- No `console.*` statements in production code

## License

This project is dual-licensed under [Apache 2.0](../../LICENSE.APACHE2) and [MIT](../../LICENSE.MIT0).

## Links

- [Intuition Documentation](https://docs.intuition.systems)
- [MetaMask Snaps Documentation](https://docs.metamask.io/snaps/)
- [Repository](https://github.com/hivemindhq-io/intuition-snap)
