# Architecture Decision Records

This file logs important architectural decisions with rationale.

---

## 2026-01-24: Origin CTA for Unknown dApps

**Context**: When a user encounters an unknown dApp (no atom exists in the knowledge graph), the Snap displayed a warning but provided no way to add the dApp to the knowledge graph. This created a chicken-and-egg problem where unknown dApps stayed unknown forever.

**Decision**: Add a new CTA "Add this dApp to knowledge graph" for unknown dApps (OriginType.NoAtom state).

**Changes**:
- Added `originNoAtom` method to `VendorConfig` type and implementation
- Created `OriginCreateAtom.tsx` action component
- Updated `UnifiedFooter.tsx` to show origin CTAs for NoAtom state
- Updated `OriginFooter/index.tsx` to support NoAtom state

**Rationale**: 
1. Users encountering unknown dApps are in the best position to vouch for them (they're actively using the dApp)
2. Growing the knowledge graph requires enabling data creation, not just consumption
3. The warning still exists, so users are informed—but now they can also take action

**URL Pattern**: `/snap/action?intent=complete_trust_triple&origin_url={hostname}`

---

## 2026-01-24: Inline CTAs in Origin Section

**Context**: The Origin section displayed state information (unknown, no votes, trusted) but action CTAs were buried in the footer, disconnected from context. This made the CTAs feel like an afterthought and didn't clearly connect "missing data" with "add data".

**Decision**: Move origin-related action CTAs inline within the Origin section component, directly below the status information.

**Changes**:
- `OriginNoAtom`: Added inline CTA "Be first to add trust data for this dApp ↗"
- `OriginAtomWithoutTrustTriple`: Added inline CTA "Be first to vote on this dApp ↗"
- `OriginAtomWithTrustTriple`: Added inline CTA "Vote on this dApp ↗"
- `UnifiedFooter`: Removed redundant origin voting CTAs (kept only "View more about this dApp")

**Rationale**:
1. Contextual CTAs are more effective than disconnected footer links
2. Users see the problem (no data) and solution (add data) in the same visual area
3. Reduces clutter in the footer
4. Creates clear information hierarchy: Status → Action

**Before**:
```
┌─────────────────────────────┐
│ dApp Origin                 │
│ Status: Unknown dApp        │
│ No community data.          │
└─────────────────────────────┘
... (footer far below) ...
[Add this dApp to knowledge graph]
```

**After**:
```
┌─────────────────────────────┐
│ dApp Origin                 │
│ Status: Unknown dApp        │
│ No community data.          │
│ [Be first to add trust...↗] │
└─────────────────────────────┘
```

---
