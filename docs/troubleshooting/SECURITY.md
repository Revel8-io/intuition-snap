# Security Considerations

> **Purpose**: Security considerations when building on Intuition.

---

## ENS and Identity

### The Transfer Problem

ENS domains can be bought, sold, and transferred. When an ENS domain is transferred:
- The new owner controls the name
- The name can point to a different address
- Historical claims about the ENS name may now apply to a different entity

### How Intuition Mitigates This

1. **Addresses are canonical identifiers**
   - `term_id = keccak256(ATOM_SALT, address_data)`
   - Claims are about addresses, not ENS names

2. **ENS is display-only**
   - `label` field may contain ENS name
   - `data` field contains the actual address
   - Identity matching uses the address

3. **Separate concerns**
   - ENS resolution enriches display
   - It doesn't define identity

### Best Practices

| Do | Don't |
|----|-------|
| Use address as identifier | Trust ENS name as identity |
| Display both ENS and address | Show only ENS name |
| Match on address (data field) | Match on label for ENS atoms |

---

## Economic Attack Vectors

### Sybil Attacks

**Risk:** Create many wallets to artificially inflate position counts.

**Detection:**
- Position count is a weak signal
- Market cap is more meaningful
- Distribution analysis (Gini) reveals concentration

**Mitigation:**
- Focus on market cap, not staker count
- Use distribution indicators in UI
- Minimum deposit requirements increase attack cost

---

### Whale Manipulation

**Risk:** Large stakers dominate signals.

**Detection:**
- Check Gini coefficient (> 0.75 = concentrated)
- Check Nakamoto coefficient (< 3 = few control majority)
- Check if top-1% holds > 80%

**Mitigation:**
- Display distribution warnings in UI
- Counter-vaults enable pushback
- Multiple signals (FOR + AGAINST) show nuance

**Implementation:**
```typescript
// Status thresholds
if (topOnePercentShare >= 0.80) return '⛔️ Whale Dominated';
if (gini <= 0.35) return '🟢 Well Distributed';
if (gini <= 0.55) return '🟡 Moderate';
if (gini > 0.75) return '⛔️ Whale Dominated';
```

---

### Front-Running

**Risk:** Observers front-run deposits to capture bonding curve profits.

**Why it's low risk:**
- Entry fees reduce profit margins
- Typical deposits are small
- MEV opportunity is minimal

**Mitigation:**
- Entry fees go to existing stakers
- Slippage protection via `minShares`
- Batch creation/staking reduces exposure

---

### Fake Atoms

**Risk:** Create atoms impersonating real entities.

**Mitigation:**
- `term_id` is deterministic from data
- Same data = same atom (no duplicates)
- Verify by checking stake from known sources

---

## Data Integrity

### Resolver Trust

The resolver service enriches atom metadata (ENS names, IPFS content). This introduces trust assumptions:

| Risk | Mitigation |
|------|------------|
| Resolver unavailable | Raw data preserved on-chain |
| Incorrect resolution | Resolution status tracked |
| Source unreliable | Multiple resolution attempts |

### Indexer Consistency

Multiple indexers should produce identical state:

| Risk | Mitigation |
|------|------------|
| Inconsistent state | Deterministic processing |
| Chain reorgs | Reorg handling logic |
| Missing events | Gap detection and backfill |

---

## UI Security

### Always Display Address

Even when ENS name is available, show the underlying address:

```typescript
// Show both
<div>
  <span>{ensName}</span>
  <span className="text-muted">{truncateAddress(address)}</span>
</div>
```

### Validate User Input

Before creating atoms or triples:

```typescript
// Validate address format
function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

// Validate URL format
function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
```

### Chain Verification

Always verify chain before transactions:

```typescript
// Prompt to switch if wrong chain
async function ensureCorrectChain(expected: number) {
  const current = await walletClient.getChainId();
  if (current !== expected) {
    await walletClient.switchChain({ id: expected });
  }
}
```

---

## Snap-Specific Security

### Transaction Origin Verification

The Snap shows origin trust for the dApp initiating the transaction:

```typescript
const originData = await getOriginData(transactionOrigin);
// transactionOrigin is provided by MetaMask, not the dApp
```

### User Address Reliability

`transaction.from` is populated by MetaMask from permitted accounts:

```typescript
// This cannot be spoofed by the dApp
const userAddress = transaction.from;
```

### No Private Key Access

Snaps cannot:
- Access private keys
- Sign transactions automatically
- Modify transaction parameters

---

## Smart Contract Security

### Preview Before Execute

Always preview to understand costs:

```typescript
const preview = await multiVaultPreviewDeposit(publicClient, {
  args: [amount, termId, curveId],
});
// User sees expected shares before committing
```

### Slippage Protection

Protect against price manipulation:

```typescript
const minShares = (preview.shares * 99n) / 100n;  // 1% tolerance
```

### Check Existence Before Create

Prevent duplicate atom errors and wasted gas:

```typescript
const existing = await findAtomIds(graphqlClient, [atomData]);
if (existing[0]) {
  // Use existing
} else {
  // Safe to create
}
```

---

## Summary: Security Checklist

| Area | Check |
|------|-------|
| Identity | Use address, not ENS, as identifier |
| Display | Show both ENS and address |
| Distribution | Warn on high concentration |
| Input | Validate addresses and URLs |
| Chain | Verify chain before transactions |
| Slippage | Set minShares/minAssets |
| Existence | Check before creating atoms |
| Origin | Display dApp origin in Snap |

---

*See also: [COMMON-ERRORS.md](./COMMON-ERRORS.md) for debugging*

*Last updated: January 21, 2026*
