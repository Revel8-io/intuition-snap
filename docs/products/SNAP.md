# Intuition Snap

> **Purpose**: Product-specific context for working on the intuition-snap MetaMask Snap.

---

## Overview

The Snap provides **trust insights during MetaMask transaction signing**.

**Location:** `/hivemind/intuition-snap`

---

## Features

| Feature | Description |
|---------|-------------|
| Your Position | Shows user's own prior stake (strongest signal) |
| Transaction Insights | Trust data for destination address |
| Origin Trust | Trust data for the dApp initiating transaction |
| Trust Circle | Trusted contacts who have staked |
| Distribution Analysis | Gini coefficient, concentration warnings |
| Visual Indicators | Color-coded trust badges |

---

## How It Works

When a user initiates a transaction in MetaMask:

```
User Initiates Transaction
         ↓
MetaMask Calls onTransaction Handler
         ↓
┌─────────────────────────────────────────┐
│ Parallel Fetches:                        │
│   1. getAccountData(transaction.to)     │
│   2. getOriginData(transactionOrigin)   │
│   3. getTrustedCircle(transaction.from) │
└─────────────────────────────────────────┘
         ↓
Calculate Trust Circle Overlap
         ↓
Render Insight UI
         ↓
User Reviews and Confirms/Rejects
```

---

## Project Structure

```
intuition-snap/
├── packages/
│   ├── snap/
│   │   ├── src/
│   │   │   ├── index.tsx           # Snap entry point
│   │   │   ├── onTransaction.tsx   # Transaction handler
│   │   │   ├── onUserInput.tsx     # User input handler
│   │   │   ├── account.tsx         # Account data fetching
│   │   │   ├── origin.tsx          # Origin data fetching
│   │   │   ├── queries.ts          # GraphQL queries
│   │   │   ├── config.ts           # Chain configuration
│   │   │   ├── distribution.ts     # Gini/Nakamoto analysis
│   │   │   ├── components/         # UI components
│   │   │   └── trusted-circle/     # Trust circle feature
│   │   └── snap.manifest.json
│   └── site/                       # Demo/documentation site
└── docs/
```

---

## Key Files

| Purpose | Path |
|---------|------|
| Snap entry | `packages/snap/src/index.tsx` |
| Transaction handler | `packages/snap/src/onTransaction.tsx` |
| Config | `packages/snap/src/config.ts` |
| GraphQL queries | `packages/snap/src/queries.ts` |
| Trust circle | `packages/snap/src/trusted-circle/` |
| Distribution analysis | `packages/snap/src/distribution.ts` |
| User position | `packages/snap/src/components/UserPositionSection.tsx` |

---

## Configuration

### `packages/snap/src/config.ts`

```typescript
export const INTUITION_MAINNET = {
  backendUrl: 'https://mainnet.intuition.sh/v1/graphql',
  rpcUrl: 'https://rpc.intuition.systems',
  chainId: 1155,
  chainIdHex: '0x483',
  chainName: 'Intuition Mainnet',
  currencySymbol: 'TRUST',
  hasTagAtomId: '0x6de69cc0ae3efe4000279b1bf365065096c8715d8180bc2a98046ee07d3356fd',
  trustworthyAtomId: '0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a',
  hasAliasAtomId: '0xf8cfb4e3f1db08f72f255cf7afaceb4b32684a64dac0f423cdca04dd15cf4fd6',
};
```

---

## Critical Pattern: Getting User Address

**⚠️ In Snaps, `eth_accounts` is unreliable. Use `transaction.from`:**

```typescript
// ❌ UNRELIABLE in Snap context
const accounts = await ethereum.request({ method: 'eth_accounts' });

// ✅ RELIABLE - use transaction.from
const userAddress: string | undefined = transaction.from;
```

**Why `transaction.from` is reliable:**
- MetaMask populates it from user's permitted accounts
- Cannot be spoofed by dApps
- Is the actual sender of the transaction being reviewed

---

## Transaction Handler

```typescript
// packages/snap/src/onTransaction.tsx
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  transactionOrigin,
}) => {
  const userAddress = transaction.from;
  
  // Parallel fetches for performance
  const [accountData, originData, trustedCircle] = await Promise.all([
    getAccountData(transaction.to),
    getOriginData(transactionOrigin),
    userAddress ? getTrustedCircle(userAddress) : Promise.resolve([]),
  ]);
  
  // Calculate trust circle overlap
  const circleOverlap = findTrustCircleOverlap(trustedCircle, accountData.positions);
  
  // Return insight UI
  return {
    content: panel([
      heading('Intuition Trust Insights'),
      // ... render components
    ]),
  };
};
```

---

## User Position Feature

Shows the user's own prior stake prominently:

```graphql
query TripleWithUserPosition($termId: String!, $userAddress: String!) {
  triple(term_id: $termId) {
    # Aggregate positions
    positions(order_by: { shares: desc }, limit: 30) { ... }
    
    # User's specific position (using GraphQL aliases)
    user_position: positions(where: { account_id: { _ilike: $userAddress } }) {
      shares
    }
    user_counter_position: counter_positions(where: { account_id: { _ilike: $userAddress } }) {
      shares
    }
  }
}
```

---

## Distribution Analysis

Assess stake concentration:

```typescript
// Gini coefficient: 0 = equal, 1 = unequal
function calculateGini(values: number[]): number {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  let sumDiff = 0;
  for (const vi of values) {
    for (const vj of values) {
      sumDiff += Math.abs(vi - vj);
    }
  }
  return sumDiff / (2 * n * n * mean);
}

// Status thresholds
// Top-1% ≥ 80%  → ⛔️ Whale Dominated
// Gini ≤ 0.35   → 🟢 Well Distributed
// Gini ≤ 0.55   → 🟡 Moderate
// Gini > 0.75   → ⛔️ Whale Dominated
```

---

## Trust Circle in Snap

See [../patterns/TRUST-CIRCLE.md](../patterns/TRUST-CIRCLE.md) for full implementation.

Key points for Snap:
1. Get user's trust circle using `transaction.from`
2. Extract wallet addresses from `subject.data` (ENS handling)
3. Match against destination's position holders
4. Sort by stake amount (highest first)
5. Display with names from pre-resolved atom labels

---

## Snap Permissions

In `snap.manifest.json`:

```json
{
  "initialPermissions": {
    "endowment:transaction-insight": {},
    "endowment:network-access": {},
    "snap_manageState": {},
    "snap_notify": {}
  }
}
```

| Permission | Purpose |
|------------|---------|
| `transaction-insight` | Access transaction data |
| `network-access` | Fetch from GraphQL API |
| `snap_manageState` | Persist state (caching) |
| `snap_notify` | Show notifications |

---

## State Management

Use `snap_manageState` for persistence (not localStorage):

```typescript
// Save state
await snap.request({
  method: 'snap_manageState',
  params: {
    operation: 'update',
    newState: { trustCircleCache: data }
  }
});

// Load state
const state = await snap.request({
  method: 'snap_manageState',
  params: { operation: 'get' }
});
```

---

## Development

```bash
cd intuition-snap
yarn install
yarn build:snap   # Build the Snap
yarn serve        # Start local server
```

Then in MetaMask Flask:
1. Navigate to `localhost:8080`
2. Click "Connect" to install Snap
3. Initiate transactions to test insights

---

## Testing

Test by initiating transactions to known addresses:
1. Install Snap in MetaMask Flask
2. Send transaction to address with trust data
3. Verify insight panel appears with correct data

---

## Gotchas

1. **Use `transaction.from`** not `eth_accounts` for user address
2. **ENS handling**: Extract wallet from `subject.data` for ENS-resolved atoms
3. **No localStorage**: Use `snap_manageState` instead
4. **Network requests**: Require `endowment:network-access` permission
5. **JSX limitations**: Snap UI is not standard React, uses Snap UI components

---

## Snap UI Components

Snaps use their own UI primitives:

```typescript
import { panel, heading, text, divider } from '@metamask/snaps-sdk';

return {
  content: panel([
    heading('Title'),
    text('Some content'),
    divider(),
    text('More content'),
  ]),
};
```

---

*See also: [../patterns/TRUST-CIRCLE.md](../patterns/TRUST-CIRCLE.md) for trust circle implementation*

*Last updated: January 21, 2026*
