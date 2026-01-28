# Trust Circle Implementation

> **Purpose**: Complete pattern for implementing the trust circle feature (showing when trusted contacts have staked on an entity).

---

## What is Trust Circle?

The trust circle shows **people the user trusts who have also staked on a target entity**. This provides social proof: "People you trust also trust this address."

---

## Prerequisites

**Atom IDs (Mainnet):**
- hasTag: `0x6de69cc0ae3efe4000279b1bf365065096c8715d8180bc2a98046ee07d3356fd`
- trustworthy: `0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a`

**Critical Dependency:** [ENS-HANDLING.md](./ENS-HANDLING.md) — Wallet addresses are in `subject.data` for ENS-resolved atoms.

---

## Algorithm Overview

```
1. Get user's trust circle (entities they've staked FOR on trust triples)
2. Extract wallet addresses from those atoms
3. Get positions on target entity's trust triple
4. Find overlap between trust circle and position holders
5. Display matches with names and stake amounts
```

---

## Step 1: Get User's Trust Circle

Query all trust triples where the user has staked FOR:

```graphql
query GetTrustCircle($userId: String!, $hasTagId: String!, $trustworthyId: String!) {
  positions(where: {
    account_id: { _ilike: $userId },
    term: {
      triple: {
        predicate_id: { _eq: $hasTagId },
        object_id: { _eq: $trustworthyId }
      }
    }
  }) {
    shares
    term {
      triple {
        subject_id
        subject { 
          label  # ENS name (for display)
          data   # Wallet address (for matching)
        }
      }
    }
  }
}
```

---

## Step 2: Extract Wallet Addresses

⚠️ **Critical:** Use the ENS handling pattern.

```typescript
interface TrustedContact {
  accountId: string;   // Wallet address (lowercase)
  label: string;       // Display name (ENS or truncated address)
}

function buildTrustCircle(positions: TrustCirclePosition[]): Map<string, TrustedContact> {
  const contactMap = new Map<string, TrustedContact>();
  
  for (const position of positions) {
    const subject = position.term.triple.subject;
    
    // Extract wallet address (data first for ENS-resolved)
    const walletAddress = extractWalletAddress(subject);
    
    if (walletAddress) {
      contactMap.set(walletAddress.toLowerCase(), {
        accountId: walletAddress,
        label: subject.label || walletAddress,
      });
    }
  }
  
  return contactMap;
}

function extractWalletAddress(subject: { label?: string; data?: string }): string | null {
  const isEvmAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/i.test(v);
  
  if (subject.data && isEvmAddress(subject.data)) {
    return subject.data.toLowerCase();
  }
  if (subject.label && isEvmAddress(subject.label)) {
    return subject.label.toLowerCase();
  }
  return null;
}
```

---

## Step 3: Get Target Entity's Positions

Query positions on the target's trust triple:

```graphql
query GetTargetPositions($subjectId: String!, $hasTagId: String!, $trustworthyId: String!) {
  triples(where: {
    subject_id: { _eq: $subjectId },
    predicate_id: { _eq: $hasTagId },
    object_id: { _eq: $trustworthyId }
  }) {
    term_id
    positions(order_by: { shares: desc }) {
      account_id
      shares
    }
    counter_positions(order_by: { shares: desc }) {
      account_id
      shares
    }
  }
}
```

---

## Step 4: Find Overlap

```typescript
interface TrustCircleMatch {
  contact: TrustedContact;
  shares: string;
  direction: 'for' | 'against';
}

function findTrustCircleOverlap(
  trustCircle: Map<string, TrustedContact>,
  forPositions: Position[],
  againstPositions: Position[]
): TrustCircleMatch[] {
  const matches: TrustCircleMatch[] = [];
  
  // Check FOR positions
  for (const pos of forPositions) {
    const contact = trustCircle.get(pos.account_id.toLowerCase());
    if (contact) {
      matches.push({
        contact,
        shares: pos.shares,
        direction: 'for',
      });
    }
  }
  
  // Check AGAINST positions
  for (const pos of againstPositions) {
    const contact = trustCircle.get(pos.account_id.toLowerCase());
    if (contact) {
      matches.push({
        contact,
        shares: pos.shares,
        direction: 'against',
      });
    }
  }
  
  // Sort by stake amount (highest first)
  return matches.sort((a, b) => 
    BigInt(b.shares) > BigInt(a.shares) ? 1 : -1
  );
}
```

---

## Step 5: Display

```typescript
function renderTrustCircle(matches: TrustCircleMatch[]) {
  if (matches.length === 0) {
    return null;  // No overlap
  }
  
  return (
    <div>
      <h3>Your Trust Circle</h3>
      {matches.map(match => (
        <div key={match.contact.accountId}>
          <span>{match.contact.label}</span>
          <span>{match.direction === 'for' ? '✅ Trusts' : '❌ Distrusts'}</span>
          <span>{formatShares(match.shares)}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## Complete Implementation

```typescript
async function getTrustCircleOverlap(
  graphqlClient: GraphQLClient,
  userAddress: string,
  targetSubjectId: string
): Promise<TrustCircleMatch[]> {
  const HAS_TAG_ID = '0x6de69cc0ae3efe4000279b1bf365065096c8715d8180bc2a98046ee07d3356fd';
  const TRUSTWORTHY_ID = '0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a';
  
  // Parallel fetch: user's trust circle + target's positions
  const [trustCircleData, targetData] = await Promise.all([
    graphqlClient.query({
      positions: {
        __args: {
          where: {
            account_id: { _ilike: userAddress },
            term: {
              triple: {
                predicate_id: { _eq: HAS_TAG_ID },
                object_id: { _eq: TRUSTWORTHY_ID }
              }
            }
          }
        },
        term: {
          triple: {
            subject: { label: true, data: true }
          }
        }
      }
    }),
    graphqlClient.query({
      triples: {
        __args: {
          where: {
            subject_id: { _eq: targetSubjectId },
            predicate_id: { _eq: HAS_TAG_ID },
            object_id: { _eq: TRUSTWORTHY_ID }
          }
        },
        positions: { account_id: true, shares: true },
        counter_positions: { account_id: true, shares: true }
      }
    })
  ]);
  
  // Build trust circle map
  const trustCircle = buildTrustCircle(trustCircleData.positions);
  
  // Find overlap
  const triple = targetData.triples[0];
  if (!triple) {
    return [];  // No trust triple exists for target
  }
  
  return findTrustCircleOverlap(
    trustCircle,
    triple.positions,
    triple.counter_positions
  );
}
```

---

## Caching Strategy

The trust circle is relatively stable. Cache it:

```typescript
const CACHE_TTL_MS = 60 * 60 * 1000;  // 1 hour

async function getCachedTrustCircle(userAddress: string): Promise<Map<string, TrustedContact>> {
  const cached = cache.get(`trust-circle:${userAddress}`);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  
  const fresh = await fetchTrustCircle(userAddress);
  cache.set(`trust-circle:${userAddress}`, {
    data: fresh,
    timestamp: Date.now(),
  });
  
  return fresh;
}
```

---

## Common Mistakes

### ❌ Using Label for Matching

```typescript
// WRONG - fails for ENS-resolved atoms
contactMap.set(subject.label, contact);  // "vitalik.eth"
```

### ✅ Use Data First

```typescript
// CORRECT
const wallet = isEvmAddress(subject.data) ? subject.data : subject.label;
contactMap.set(wallet.toLowerCase(), contact);
```

---

### ❌ Forgetting to Lowercase

```typescript
// WRONG - checksum mismatch
trustCircle.get(position.account_id)
```

### ✅ Normalize Both Sides

```typescript
// CORRECT
trustCircle.get(position.account_id.toLowerCase())
```

---

### ❌ Sequential Fetches

```typescript
// SLOW
const circle = await fetchTrustCircle();
const target = await fetchTargetPositions();
```

### ✅ Parallel Fetches

```typescript
// FAST
const [circle, target] = await Promise.all([
  fetchTrustCircle(),
  fetchTargetPositions()
]);
```

---

## Applies To

| Product | Uses Trust Circle? |
|---------|-------------------|
| Explorer | Optional (profile enhancement) |
| Extension | Optional (entity insights) |
| **Snap** | **Core feature** (transaction insights) |

---

*See also: [ENS-HANDLING.md](./ENS-HANDLING.md) for address extraction details*

*Last updated: January 21, 2026*
