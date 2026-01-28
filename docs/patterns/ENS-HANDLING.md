# ENS Handling

> **Purpose**: Critical patterns for handling ENS-resolved atoms. This is one of the most common sources of bugs.

---

## The Problem

When an Ethereum address has an ENS name, the Intuition resolver enriches the atom:

| Field | Non-ENS Atom | ENS-Resolved Atom |
|-------|--------------|-------------------|
| `label` | `0xd8da6bf26964af9d7eed9e03e53415d37aa96045` | `vitalik.eth` |
| `data` | `0xd8da6bf26964af9d7eed9e03e53415d37aa96045` | `0xd8da6bf26964af9d7eed9e03e53415d37aa96045` |

**The wallet address moves from `label` to `data`, and `label` becomes the ENS name.**

---

## Why This Matters

When matching atoms to wallet addresses (e.g., in trust circle), using only `label` fails:

```typescript
// ❌ WRONG - fails for ENS-resolved atoms
const walletAddress = subject.label;  // "vitalik.eth" - not an address!

// Comparison fails:
walletAddress === position.account_id  // "vitalik.eth" !== "0xd8da..."
```

---

## The Solution

Always check `data` first, then fall back to `label`:

```typescript
function extractWalletAddress(subject: { label?: string; data?: string }): string | null {
  const isEvmAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/i.test(v);
  
  // Check data first (where ENS-resolved addresses live)
  if (subject.data && isEvmAddress(subject.data)) {
    return subject.data.toLowerCase();
  }
  
  // Fallback to label for non-ENS atoms
  if (subject.label && isEvmAddress(subject.label)) {
    return subject.label.toLowerCase();
  }
  
  return null;
}
```

---

## Complete Pattern

```typescript
// Type guard for EVM addresses
function isEvmAddress(value: string | null | undefined): value is string {
  return !!value && /^0x[a-fA-F0-9]{40}$/i.test(value);
}

// Extract wallet address from atom
function getWalletFromAtom(atom: { label?: string; data?: string }): string | null {
  // Priority: data (for ENS), then label (for non-ENS)
  if (isEvmAddress(atom.data)) {
    return atom.data.toLowerCase();
  }
  if (isEvmAddress(atom.label)) {
    return atom.label.toLowerCase();
  }
  return null;
}

// Get display name (prefer ENS, fall back to truncated address)
function getDisplayName(atom: { label?: string; data?: string }): string {
  const wallet = getWalletFromAtom(atom);
  
  // If label is ENS name, use it
  if (atom.label && !isEvmAddress(atom.label)) {
    return atom.label;
  }
  
  // Otherwise truncate the address
  if (wallet) {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  }
  
  return atom.label || 'Unknown';
}
```

---

## Usage in Trust Circle

```typescript
// Building a map of trusted contacts
const contactMap = new Map<string, { accountId: string; label: string }>();

for (const position of userTrustPositions) {
  const subject = position.term.triple.subject;
  
  // CORRECT: Extract wallet from data first
  const walletAddress = getWalletFromAtom(subject);
  
  if (walletAddress) {
    contactMap.set(walletAddress.toLowerCase(), {
      accountId: walletAddress,
      label: subject.label || walletAddress,  // Keep ENS name for display
    });
  }
}

// Later, when matching positions:
for (const position of targetPositions) {
  const contact = contactMap.get(position.account_id.toLowerCase());
  if (contact) {
    // Found a trusted contact who staked!
    console.log(`${contact.label} also staked on this`);
  }
}
```

---

## GraphQL Query Pattern

When querying for trust circle, always fetch both fields:

```graphql
query GetTrustCircle($userId: String!) {
  positions(where: {
    account_id: { _ilike: $userId },
    term: { triple: { predicate_id: { _eq: $hasTagId }, object_id: { _eq: $trustworthyId } } }
  }) {
    term {
      triple {
        subject {
          label  # ENS name OR address (for display)
          data   # Wallet address (for matching)
        }
      }
    }
  }
}
```

---

## Common Mistakes

### ❌ Using Only Label

```typescript
const address = subject.label;
// "vitalik.eth" for ENS-resolved, fails matching
```

### ✅ Check Data First

```typescript
const address = isEvmAddress(subject.data) ? subject.data : subject.label;
```

---

### ❌ Forgetting to Lowercase

```typescript
// May fail due to checksum differences
walletA === walletB
```

### ✅ Always Normalize

```typescript
walletA.toLowerCase() === walletB.toLowerCase()
```

---

### ❌ Assuming All Atoms Have Addresses

```typescript
// Will throw for non-address atoms (concepts, URLs, etc.)
const address = subject.data;
someFunction(address);  // undefined!
```

### ✅ Guard with Type Check

```typescript
const address = getWalletFromAtom(subject);
if (address) {
  someFunction(address);
}
```

---

## Quick Reference

| Atom Type | `label` | `data` | Use for Matching |
|-----------|---------|--------|------------------|
| Non-ENS address | `0xabc...` | `0xabc...` | Either (same) |
| ENS-resolved | `vitalik.eth` | `0xd8da...` | `data` |
| Person/Org | `Alice` | `{"@type":"Person"...}` | N/A (not address) |
| URL | `example.com` | `https://example.com` | N/A (not address) |

---

## Decision Tree

```
Is subject.data a valid EVM address?
├── Yes → Use subject.data for matching
│         Use subject.label for display (may be ENS)
└── No  → Is subject.label a valid EVM address?
          ├── Yes → Use subject.label for both
          └── No  → Not an address atom
```

---

*This pattern is critical for: Trust Circle, Position Lookups, Account Matching*

*See also: [TRUST-CIRCLE.md](./TRUST-CIRCLE.md) for full implementation*

*Last updated: January 21, 2026*
