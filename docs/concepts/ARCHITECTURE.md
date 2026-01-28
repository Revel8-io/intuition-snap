# Architecture Overview

> **Purpose**: Understand how system components connect and data flows through the stack.

---

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      User Applications                               │
│  ┌─────────────┐ ┌─────────────────┐ ┌─────────────────┐           │
│  │  Explorer   │ │    Extension    │ │   MetaMask Snap │           │
│  │  (React)    │ │    (Plasmo)     │ │                 │           │
│  └─────────────┘ └─────────────────┘ └─────────────────┘           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   GraphQL API    │ │  MultiVault  │ │   RPC Endpoint   │
│   (Hasura)       │ │  Contract    │ │   (viem/wagmi)   │
└────────┬─────────┘ └──────────────┘ └──────────────────┘
         │
┌────────▼─────────┐
│   PostgreSQL     │
│   (Indexed Data) │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   intuition-rs   │
│   (Consumer +    │
│    Resolver)     │
└────────┬─────────┘
         │
┌────────▼─────────┐
│   Blockchain     │
│   (Source of     │
│    Truth)        │
└──────────────────┘
```

---

## Data Flow

### Write Path (Creating/Staking)

```
User Action → Frontend → Wallet Tx → MultiVault Contract → Blockchain Event
                                                                   ↓
                                     UI Updates ← GraphQL ← PostgreSQL ← Consumer
```

### Read Path (Querying)

```
User Request → Frontend → GraphQL API → PostgreSQL → Response
```

### Indexer Delay

After a transaction confirms, the indexer takes **4-10 seconds** to:
1. Detect blockchain event
2. Process and store in database
3. Resolve metadata (ENS, IPFS)

Wait before querying for new data.

---

## Workspace Projects

| Project | Purpose | Tech Stack |
|---------|---------|------------|
| **intuition-contracts-v2** | Solidity smart contracts | Foundry, ERC-4626 |
| **intuition-rs** | Backend indexer & resolver | Rust, PostgreSQL |
| **intuition-ts** | TypeScript SDK packages | viem, graphql |
| **intuition-snap** | MetaMask Snap | MetaMask Snaps API |
| **hivemind-explorer** | Web app for browsing/staking | React, TanStack Router |
| **hivemind-extension** | Browser extension | Plasmo, Chrome APIs |
| **hivemind-core** | Shared UI components | shadcn/ui, Tailwind |

---

## Smart Contract Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MultiVault                                   │
│  (Main entry point for all protocol operations)                     │
├─────────────────────────────────────────────────────────────────────┤
│                       MultiVaultCore                                 │
│  (Configuration, ID calculation, core getters)                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │ BondingCurve │ │ AtomWallet   │ │ AccessControl│                │
│  └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Contract Functions

| Function | Purpose |
|----------|---------|
| `createAtoms` | Create new atoms |
| `createTriples` | Create new triples |
| `deposit` | Stake TRUST tokens |
| `redeem` | Unstake and withdraw |
| `getAtomCost` / `getTripleCost` | Get creation costs |
| `previewDeposit` / `previewRedeem` | Preview share calculations |

---

## Backend Services (intuition-rs)

| Crate | Purpose |
|-------|---------|
| `consumer` | Event processing, database writes |
| `consumer-api` | REST API for administration |
| `models` | Rust structs matching database schema |
| `histocrawler` | Historical data backfill |
| `image-guard` | Image validation and processing |

### Event Processing Flow

```
Blockchain Events → Consumer → PostgreSQL → Hasura GraphQL
```

### Resolver Flow

```
New Atom → Classify Type → ENS/IPFS Resolution → Update Database
```

The resolver enriches atoms with:
- ENS names and avatars for addresses
- IPFS content for ipfs:// URLs
- Schema.org parsing for JSON-LD

---

## GraphQL API (Hasura)

Hasura auto-generates GraphQL from PostgreSQL schema.

### Key Types

| Type | Description |
|------|-------------|
| `atoms` | Knowledge entities |
| `triples` | Claims (subject-predicate-object) |
| `terms` | Unified atom/triple abstraction |
| `positions` | User stakes in vaults |
| `vaults` | Economic containers |
| `accounts` | User wallet information |

### Relationship Navigation

```
positions → term → triple → subject/predicate/object → atom
         → term → atom
         → account
         → vault
```

---

## Frontend Architecture (Explorer)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       React Application                              │
├─────────────────────────────────────────────────────────────────────┤
│  Routes (TanStack Router)                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                  │
│  │ Home    │ │ Atoms   │ │ Triples │ │ Profile │                  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                  │
├─────────────────────────────────────────────────────────────────────┤
│  State Management                                                    │
│  ┌──────────────┐ ┌──────────────┐                                 │
│  │ React Query  │ │   Zustand    │                                 │
│  │ (server)     │ │   (client)   │                                 │
│  └──────────────┘ └──────────────┘                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Services & Hooks                                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐               │
│  │ GraphQL      │ │ MultiVault   │ │ Modal System │               │
│  │ Queries      │ │ Wrapper      │ │              │               │
│  └──────────────┘ └──────────────┘ └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Extension Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER EXTENSION                             │
├──────────────────┬──────────────────┬───────────────────────────────┤
│  Background      │  Content Scripts │  Sidepanel (React)            │
│  (Service Worker)│  (Per-domain)    │  (Main UI)                    │
├──────────────────┼──────────────────┼───────────────────────────────┤
│ • Web3 state     │ • URL detection  │ • TanStack Router             │
│ • Message hub    │ • Address detect │ • React Query                 │
│ • Contract calls │ • X.com scraper  │ • Atom queue                  │
│ • Session persist│ • Entity extract │ • Modal system                │
└──────────────────┴──────────────────┴───────────────────────────────┘
```

### Communication Flow

```
Content Script → chrome.runtime.sendMessage → Background → Sidepanel
```

---

## Snap Architecture

```
MetaMask Transaction Request
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    onTransaction Handler                             │
├─────────────────────────────────────────────────────────────────────┤
│  Parallel Fetches:                                                   │
│  1. getAccountData(transaction.to)                                  │
│  2. getOriginData(transactionOrigin)                                │
│  3. getTrustedCircle(transaction.from)                              │
├─────────────────────────────────────────────────────────────────────┤
│  Calculate Trust Circle Overlap                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Render Insight UI                                                   │
└─────────────────────────────────────────────────────────────────────┘
         ↓
User Reviews and Confirms/Rejects Transaction
```

---

## SDK Packages (intuition-ts)

| Package | Purpose |
|---------|---------|
| `@0xintuition/protocol` | Smart contract interactions via viem |
| `@0xintuition/graphql` | GraphQL client and queries |
| `@0xintuition/sdk` | High-level SDK combining protocol + graphql |
| `@0xintuition/1ui` | Shared UI components |
| `@0xintuition/api` | API client |

### Usage Pattern

```typescript
import { multiVaultDeposit } from '@0xintuition/protocol';
import { findAtomIds } from '@0xintuition/sdk/experimental';
```

---

*See also: [CORE-PRIMITIVES.md](./CORE-PRIMITIVES.md) for concept definitions*

*Last updated: January 21, 2026*
