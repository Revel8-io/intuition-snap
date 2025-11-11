# Vendor Integration Guide

## Overview

Vendors are third-party applications that users can interact with through the Intuition Snap. When viewing transaction details, users see relevant trust/reputation data and can click through to vendor apps to:

- Create atoms (on-chain identities) for addresses
- Create trust triples (relationships between atoms)
- Stake on existing trust relationships

## How to Add Your Vendor

### 1. Create Your Vendor File

Create a new file in `packages/snap/src/vendors/your-vendor-name.ts`:

```typescript
import { AccountType, PropsForAccountType } from '../types';
import { type Vendor } from '.';
import { chainConfig, type ChainConfig } from '../config';
import { addressToCaip10 } from '../util';

// Define your chain-specific URLs
const CHAIN_URLS: Record<number, string> = {
  13579: 'https://your-app.com',          // Intuition Mainnet
  1155: 'https://testnet.your-app.com',   // Intuition Testnet
};

// Get the base URL for the current chain
const baseUrl = CHAIN_URLS[chainConfig.chainId] || CHAIN_URLS[13579];

export const yourVendorName: Vendor = {
  name: 'Your App Name',
  logo: 'https://your-app.com/logo.png', // Optional

  // Called when no atom exists for the address
  [AccountType.NoAtom]: (params) => {
    const { address, chainId, isContract } = params;
    // Use CAIP format for contracts, plain format for EOAs
    const addressToUse = isContract
      ? addressToCaip10(address, chainId)
      : address;

    return {
      url: `${baseUrl}/create-atom?address=${addressToUse}&chain=${chainId}`,
    };
  },

  // Called when atom exists but no trust triple
  [AccountType.AtomWithoutTrustTriple]: (params) => {
    const { account } = params;
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;

    return {
      url: `${baseUrl}/create-triple?subject=${account.term_id}&predicate=${isAtomId}&object=${trustworthyAtomId}`,
    };
  },

  // Called when both atom and trust triple exist
  [AccountType.AtomWithTrustTriple]: (params) => {
    const { triple } = params;

    return {
      url: `${baseUrl}/stake?triple=${triple.term_id}&direction=support`,
    };
  },
};
```

### 2. Register Your Vendor

Add your vendor to the `VENDOR_LIST` in `packages/snap/src/vendors/index.ts`:

```typescript
import { yourVendorName } from './your-vendor-name';

export const VENDOR_LIST: Vendor[] = [revel8, yourVendorName];
```

### 3. Build and Test

```bash
cd packages/snap
yarn build
```

Then test your vendor links appear correctly when using the snap.

## Available Types

### Account States

The snap determines which vendor method to call based on the account state:

- **`NoAtom`**: No atom exists for the address
- **`AtomWithoutTrustTriple`**: Atom exists but no trust relationship
- **`AtomWithTrustTriple`**: Both atom and trust triple exist

### Parameters

Each method receives typed parameters:

#### NoAtom Parameters
- `address`: Ethereum address (0x...)
- `chainId`: CAIP-2 chain ID (e.g., "eip155:1155")
- `isContract`: boolean indicating if address is a smart contract
- `transactionOrigin`: optional origin URL of the transaction

#### AtomWithoutTrustTriple Parameters
- `account`: Atom object with `term_id`, `label`, `data`, etc.
- `nickname`: Optional human-readable name
- Same fields as NoAtom

#### AtomWithTrustTriple Parameters
- `account`: Atom object
- `triple`: Trust triple with staking positions
- `nickname`: Optional human-readable name
- Same fields as NoAtom

## Chain Configuration

The snap runs on different chains. Access the current chain config:

```typescript
import { chainConfig } from '../config';

// Available properties:
chainConfig.chainId         // 13579 or 1155
chainConfig.name           // "Intuition Mainnet" or "Intuition Testnet"
chainConfig.backendUrl     // GraphQL endpoint
chainConfig.isAtomId       // Predicate atom ID for "is" relationship
chainConfig.trustworthyAtomId  // Object atom ID for "trustworthy"
```

## Best Practices

1. **Handle Missing Data**: Always check if `account` or `triple` exist before accessing properties
2. **Use CAIP Format for Contracts**: Smart contracts should use CAIP-10 format (chain-specific)
3. **Make Methods Optional**: Only implement the states your app supports
4. **Test Both Chains**: Ensure your URLs work on both mainnet and testnet

## Example: Revel8 Implementation

See `packages/snap/src/vendors/revel8.ts` for a complete implementation example.
