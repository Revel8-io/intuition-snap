# Address Classification & Atom Query Specification

> **Version:** 1.0  
> **Date:** November 29, 2025  
> **Status:** Draft  
> **Author:** AI-assisted specification

---

## Overview

This specification defines how the Intuition Snap determines whether a transaction destination address is an EOA (Externally Owned Account) or a Smart Contract, and how this classification affects:

1. Which atom format(s) to query from the Intuition knowledge graph
2. What information to display to the user
3. What data to pass to external vendors via outbound links

---

## Background: Why Address Classification Matters

### EOA vs Contract Identity Semantics

| Address Type | Cross-Chain Identity | Atom Format | Reasoning |
|--------------|---------------------|-------------|-----------|
| **EOA** | Same entity on ALL EVM chains | `0x{address}` | Same private key controls address on every chain |
| **Smart Contract** | Different entity PER chain | `eip155:{chainId}:{address}` (CAIP-10) | Same address on different chains can have different deployers, code, and ownership |

### Example

Address `0x1234567890abcdef1234567890abcdef12345678`:

- **As EOA:** Trust in this address is universal — it's the same person/key on Ethereum, Base, and Intuition Chain
- **As Contract:** Trust is chain-specific — the contract at this address on Ethereum may be owned by Alice, while the contract at the same address on Base may be owned by Bob (or not exist at all)

---

## Classification States

The Snap SHALL recognize three classification states:

```typescript
type AddressClassification = 
  | { type: 'eoa'; certainty: 'definite' }
  | { type: 'contract'; certainty: 'definite' }
  | { type: 'unknown'; certainty: 'uncertain'; reason: ClassificationFailureReason };

type ClassificationFailureReason = 
  | 'eth_getCode_failed'
  | 'chain_switch_failed'
  | 'rpc_error';
```

---

## Classification Algorithm

### Step 1: Check Transaction Data

```
IF transaction.data !== '0x' THEN
  → Definitely a contract interaction
  → classification = { type: 'contract', certainty: 'definite' }
  → SKIP remaining steps
ELSE
  → Could be EOA or contract receiving native tokens
  → CONTINUE to Step 2
```

### Step 2: Determine Chain Context

```
Extract chainId from transaction context
Compare to Snap's configured chainId

IF transaction.chainId === config.chainId THEN
  → Same chain, can query directly
  → CONTINUE to Step 3
ELSE
  → Different chain, attempt switch
  → CONTINUE to Step 2a
```

### Step 2a: Chain Switch (if needed)

```
TRY
  await ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: transaction.chainId }]
  })
  → CONTINUE to Step 3
CATCH
  → classification = { type: 'unknown', certainty: 'uncertain', reason: 'chain_switch_failed' }
  → CONTINUE to Atom Query (uncertain path)
```

### Step 3: Query Contract Code

```
TRY
  const code = await ethereum.request({
    method: 'eth_getCode',
    params: [address, 'latest']
  })
  
  IF code === '0x' OR code === null THEN
    → classification = { type: 'eoa', certainty: 'definite' }
  ELSE
    → classification = { type: 'contract', certainty: 'definite' }
CATCH
  → classification = { type: 'unknown', certainty: 'uncertain', reason: 'eth_getCode_failed' }
```

---

## Atom Query Strategy

Based on classification, the Snap SHALL query atoms as follows:

### Definite EOA

```graphql
query GetAddressAtoms($plainAddress: String!) {
  atoms(where: { data: { _eq: $plainAddress } }) {
    term_id
    # ... other fields
  }
}
```

- Query using `0x{address}` format only
- Trust data is universal across chains

### Definite Contract

```graphql
query GetAddressAtoms($caipAddress: String!, $plainAddress: String!) {
  # Primary: CAIP format (chain-specific)
  caipAtoms: atoms(where: { data: { _eq: $caipAddress } }) {
    term_id
    # ... other fields
  }
  
  # Secondary: Check if EOA trust exists (for informational note)
  plainAtoms: atoms(where: { data: { _eq: $plainAddress } }) {
    term_id
    # ... other fields
  }
}
```

- Primary lookup: CAIP-10 format `eip155:{chainId}:{address}`
- Secondary lookup: 0x format (for "other trust data" note feature)

### Uncertain Classification

```graphql
query GetAddressAtoms($caipAddress: String!, $plainAddress: String!) {
  caipAtoms: atoms(where: { data: { _eq: $caipAddress } }) {
    term_id
    # ... other fields
  }
  
  plainAtoms: atoms(where: { data: { _eq: $plainAddress } }) {
    term_id
    # ... other fields
  }
}
```

- Query BOTH formats
- Use the result with higher trust signal (see Selection Logic below)

---

## Atom Selection Logic (Uncertain Case)

When classification is uncertain and both atom formats return results:

```typescript
function selectPrimaryAtom(
  caipAtom: Atom | null,
  plainAtom: Atom | null,
  caipTrustTriple: Triple | null,
  plainTrustTriple: Triple | null
): { primary: Atom | null; hasAlternate: boolean } {
  
  // Neither exists
  if (!caipAtom && !plainAtom) {
    return { primary: null, hasAlternate: false };
  }
  
  // Only one exists
  if (!caipAtom) return { primary: plainAtom, hasAlternate: false };
  if (!plainAtom) return { primary: caipAtom, hasAlternate: false };
  
  // Both exist - compare trust signal
  const caipMarketCap = getTrustMarketCap(caipTrustTriple);
  const plainMarketCap = getTrustMarketCap(plainTrustTriple);
  
  if (caipMarketCap >= plainMarketCap) {
    return { 
      primary: caipAtom, 
      hasAlternate: plainMarketCap > 0 
    };
  } else {
    return { 
      primary: plainAtom, 
      hasAlternate: caipMarketCap > 0 
    };
  }
}

function getTrustMarketCap(triple: Triple | null): bigint {
  if (!triple) return 0n;
  const supportCap = BigInt(triple.term?.vaults?.[0]?.market_cap ?? '0');
  const counterCap = BigInt(triple.counter_term?.vaults?.[0]?.market_cap ?? '0');
  return supportCap + counterCap; // Total staked signal
}
```

---

## UI Display: "Other Trust Data" Note

### When to Show

The Snap SHALL display an informational note when:

1. The primary atom is displayed (CAIP or 0x format)
2. An alternate format atom exists with non-zero market cap on the trust triple
3. The alternate has `market_cap > 0` on `[atom] - has characteristic - trustworthy`

### Display Format

```
┌────────────────────────────────────────────────────────────┐
│ Address: 0x1234...5678                                     │
│ Nickname: "Uniswap V3 Router"                              │
│                                                            │
│ Trustworthy (47): 1,234.56 TRUST                           │
│ Not trustworthy (3): 45.00 TRUST                           │
│                                                            │
│ ℹ️ This address also has trust data as an EOA.             │
│    View more to investigate.                               │
│                                                            │
│ [View More →]                                              │
└────────────────────────────────────────────────────────────┘
```

### Note Variants

| Primary Format | Alternate Format | Note Text |
|----------------|------------------|-----------|
| CAIP (contract) | 0x (EOA) | "This address also has trust data as an EOA." |
| 0x (EOA) | CAIP (contract) | "This address also has trust data as a contract on {chainName}." |
| CAIP (uncertain) | 0x | "This address may also have EOA trust data." |

### Implementation Note

The "View More" link (implemented in `ViewMore.tsx`) SHALL allow users to investigate the alternate trust data on the vendor explorer.

---

## Outbound Links: Vendor Integration

### Data Passed to Vendors

The Snap SHALL pass the following data via URL parameters:

```typescript
interface VendorLinkParams {
  // Always included
  address: string;           // Raw 0x address
  chain_id: string;          // CAIP-2 chain ID (e.g., "eip155:13579")
  
  // Classification result
  is_contract: boolean;      // Snap's determination
  classification_certainty: 'definite' | 'uncertain';
  
  // Intent-specific
  intent: 'complete_trust_triple' | 'create_trust_triple' | 'stake_trust_triple';
  atom_id?: string;          // If atom exists
  triple_id?: string;        // If triple exists
}
```

### Address Format in Links

The Snap SHALL compute the address format for the vendor:

```typescript
function getVendorAddress(
  address: string,
  chainId: string,
  classification: AddressClassification
): string {
  if (classification.type === 'eoa' && classification.certainty === 'definite') {
    return address; // 0x format
  }
  
  // Contract or uncertain → use CAIP for safety
  return addressToCaip10(address, chainId);
}
```

### Vendor Responsibility

Vendors (including Revel8) MAY:
- Use the Snap's classification as-is
- Perform their own verification if needed
- Handle both address formats in their intake logic

---

## Edge Cases

### CREATE2 Deterministic Deploys

Some contracts are deployed via CREATE2 with the same code at the same address across multiple chains (e.g., Uniswap, Safe). In these cases:

- Trust data MAY legitimately exist on multiple chains for the same contract code
- The Snap SHALL still treat these as separate entities per chain (CAIP format)
- Future enhancement: Could aggregate trust across chains for known multi-chain contracts

### Address Reuse (EOA → Contract)

If an EOA later deploys a contract at their own address (rare but possible):

- EOA trust data (0x format) represents trust in the PERSON
- Contract trust data (CAIP format) represents trust in the CODE
- Both are valid and meaningful; the "other trust data" note helps users understand this

### Proxy Contracts

For upgradeable proxy contracts:

- Trust in the proxy address reflects trust in the CURRENT implementation
- This is chain-specific (CAIP format is correct)
- Future enhancement: Could link proxy to implementation atoms

---

## Data Types

```typescript
// Full result from atom query
interface AddressAtomQueryResult {
  classification: AddressClassification;
  primaryAtom: Atom | null;
  primaryTrustTriple: TripleWithPositions | null;
  alternateAtom: Atom | null;
  alternateTrustTriple: TripleWithPositions | null;
  hasAlternateTrustData: boolean;
  nickname: string | null;
}

// Account type for UI rendering
enum AccountType {
  NoAtom = 'NO_ATOM',
  AtomWithoutTrustTriple = 'ATOM_WITHOUT_TRUST_TRIPLE',
  AtomWithTrustTriple = 'ATOM_WITH_TRUST_TRIPLE',
}

// Extended props for UI components
interface AccountProps {
  // Existing fields
  address: string;
  chainId: string;
  accountType: AccountType;
  account: Atom | null;
  triple: TripleWithPositions | null;
  nickname: string | null;
  isContract: boolean;
  userAddress?: string;
  transactionOrigin?: string;
  
  // New fields for "other trust data" feature
  classification: AddressClassification;
  hasAlternateTrustData: boolean;
  alternateAtomId?: string;
  alternateMarketCap?: string;
}
```

---

## Implementation Checklist

- [ ] Update `AddressClassification` type with certainty field
- [ ] Modify `getAccountData()` to return classification details
- [ ] Update GraphQL query to fetch both atom formats for contracts/uncertain
- [ ] Implement `selectPrimaryAtom()` logic
- [ ] Add `hasAlternateTrustData` to account props
- [ ] Create UI component for "other trust data" note
- [ ] Update `ViewMore.tsx` to link to alternate atom when applicable
- [ ] Update vendor config to pass classification certainty
- [ ] Add unit tests for classification edge cases

---

## Future Considerations

1. **Multi-chain trust aggregation**: Show combined trust across chains for known multi-chain protocols
2. **Implementation atom linking**: For proxies, link to implementation contract trust data
3. **Historical trust**: Show how trust has changed over time
4. **Trust inheritance**: If deployer is trusted, show that context for new contracts

---

## Appendix: CAIP-10 Format Reference

CAIP-10 (Chain Agnostic Improvement Proposal 10) defines a way to identify accounts across chains:

```
account_id:        chain_id + ":" + account_address
chain_id:          [-a-z0-9]{3,8}:[-_a-zA-Z0-9]{1,32}
account_address:   [-.%a-zA-Z0-9]{1,128}
```

For EVM chains:
```
eip155:1:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb      # Ethereum Mainnet
eip155:8453:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb   # Base
eip155:13579:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb  # Intuition Testnet
```

---

*This specification is maintained alongside the codebase. For questions or updates, see the Intuition Snap repository.*

