# GraphQL Patterns

> **Purpose**: Query patterns for the Intuition GraphQL API. Self-contained with inline prerequisites.

---

## Prerequisites

**GraphQL Endpoint:** `https://mainnet.intuition.sh/v1/graphql`

**Well-Known Atom IDs:**
- hasTag: `0x6de69cc0ae3efe4000279b1bf365065096c8715d8180bc2a98046ee07d3356fd`
- trustworthy: `0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a`

---

## Critical Rules

1. **Use `_ilike` for address matching** — Addresses can be checksummed or lowercase
2. **Navigate through `term`** — Positions don't directly reference atoms/triples
3. **Add `limit`** — Prevent timeout on large result sets
4. **Use curve_id `1`** — Default bonding curve

---

## Pattern 1: Find Atom by Address

```graphql
query FindAtomByAddress($address: String!) {
  atoms(where: {
    _or: [
      { label: { _ilike: $address } },
      { data: { _ilike: $address } }
    ]
  }) {
    term_id
    label
    image
    type
    data
  }
}
```

**Why check both?** 
- Non-ENS atoms: address is in `label`
- ENS-resolved atoms: address is in `data`, ENS name is in `label`

---

## Pattern 2: Get Trust Triple with Positions

```graphql
query GetTrustTriple($subjectId: String!, $hasTagId: String!, $trustworthyId: String!) {
  triples(where: {
    subject_id: { _eq: $subjectId },
    predicate_id: { _eq: $hasTagId },
    object_id: { _eq: $trustworthyId }
  }) {
    term_id
    counter_term_id
    term {
      vaults(where: { curve_id: { _eq: "1" } }) {
        market_cap
        position_count
        current_share_price
      }
    }
    positions(order_by: { shares: desc }, limit: 30) {
      account_id
      shares
    }
    counter_positions(order_by: { shares: desc }, limit: 30) {
      account_id
      shares
    }
  }
}
```

---

## Pattern 3: Get User's Position + Aggregate (One Query)

Use GraphQL aliases to fetch both in a single request:

```graphql
query TripleWithUserPosition($termId: String!, $userAddress: String!) {
  triple(term_id: $termId) {
    term_id
    
    # Aggregate positions
    positions(order_by: { shares: desc }, limit: 30) {
      account_id
      shares
    }
    
    # User's specific FOR position
    user_position: positions(where: { account_id: { _ilike: $userAddress } }) {
      shares
    }
    
    # User's specific AGAINST position
    user_counter_position: counter_positions(where: { account_id: { _ilike: $userAddress } }) {
      shares
    }
  }
}
```

---

## Pattern 4: Get User's All Positions

```graphql
query GetUserPositions($userId: String!) {
  positions(
    where: { account_id: { _ilike: $userId } },
    order_by: { shares: desc }
  ) {
    term_id
    shares
    term {
      type
      atom { 
        label 
        image 
      }
      triple {
        subject { label }
        predicate { label }
        object { label }
      }
      vaults(where: { curve_id: { _eq: "1" } }) {
        market_cap
        current_share_price
      }
    }
  }
}
```

---

## Pattern 5: Get Trust Circle

Find all entities the user has staked FOR on trust triples:

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

**⚠️ Important:** Extract wallet address from `subject.data` first, not `subject.label`. See [ENS-HANDLING.md](./ENS-HANDLING.md).

---

## Pattern 6: Search Atoms

```graphql
query SearchAtoms($query: String!, $limit: Int = 20) {
  atoms(
    where: { label: { _ilike: $query } },
    order_by: [{ term: { total_market_cap: desc } }],
    limit: $limit
  ) {
    term_id
    label
    image
    type
    term {
      total_market_cap
    }
  }
}
```

**Note:** Use `%` wildcards in the variable: `$query = "%searchterm%"`

---

## Pattern 7: Get Atom with Trust Data

```graphql
query GetAtomWithTrust($termId: String!, $hasTagId: String!, $trustworthyId: String!) {
  atom(term_id: $termId) {
    term_id
    label
    image
    type
    as_subject_triples(where: {
      predicate_id: { _eq: $hasTagId },
      object_id: { _eq: $trustworthyId }
    }) {
      term_id
      term {
        vaults(where: { curve_id: { _eq: "1" } }) {
          market_cap
          position_count
        }
      }
    }
  }
}
```

---

## Common Mistakes

### ❌ Case-Sensitive Matching

```graphql
# May fail - case sensitive
atoms(where: { label: { _eq: "0xAbC123..." } })
```

### ✅ Case-Insensitive Matching

```graphql
# Correct - case insensitive
atoms(where: { label: { _ilike: "0xabc123..." } })
```

---

### ❌ Direct Triple Navigation from Positions

```graphql
# WRONG - positions don't have triple field
positions(where: { triple: { predicate_id: { _eq: $id } } })
```

### ✅ Navigate Through Term

```graphql
# CORRECT - go through term
positions(where: {
  term: {
    triple: {
      predicate_id: { _eq: $id }
    }
  }
})
```

---

### ❌ Missing Pagination

```graphql
# Slow/timeout risk
atoms { term_id label }
```

### ✅ Add Limits

```graphql
# Better
atoms(limit: 50) { term_id label }
```

---

## TypeScript Usage

```typescript
const result = await graphqlClient.query({
  atoms: {
    __args: {
      where: {
        _or: [
          { label: { _ilike: address } },
          { data: { _ilike: address } }
        ]
      }
    },
    term_id: true,
    label: true,
    image: true,
  }
});
```

---

## GraphQL Schema Quick Reference

### Core Types

| Type | Key Fields |
|------|------------|
| `atoms` | term_id, label, data, image, type |
| `triples` | term_id, subject_id, predicate_id, object_id, counter_term_id |
| `positions` | account_id, term_id, shares, curve_id |
| `terms` | id, type, atom_id, triple_id, total_market_cap |
| `vaults` | term_id, curve_id, market_cap, current_share_price |

### Relationship Navigation

```
positions → term → triple → subject/predicate/object
         → term → atom
         → account
         → vault
```

---

*See also: [ENS-HANDLING.md](./ENS-HANDLING.md) for address extraction*

*Last updated: January 21, 2026*
