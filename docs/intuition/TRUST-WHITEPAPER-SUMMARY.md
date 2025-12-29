# TRUST Token: AI-Optimized Reference

> **Purpose**: Dense context document for LLM consumption  
> **Related**: [CONCEPTS.md](./CONCEPTS.md) | [GLOSSARY.md](./GLOSSARY.md)

---

## 1. TRUST Token Overview

**Definition**: Native ERC-20 governance/utility token for Intuition protocol.

**Core Functions**:
1. Data creation fees (atoms, triples)
2. Staking/signaling (economic weight on claims)
3. Governance voting (protocol parameters)
4. Node operator bonding (collateral for indexers)

**Value Proposition**: Transforms data into tradeable on-chain assets with market-determined credibility. Stakes = priced endorsements; counter-stakes = short positions on accuracy.

**Net Relevance Weight Formula**:
```
w_i = s_i⁺ - κs_i⁻,  κ ∈ (0,1]
```
Where `s_i⁺` = long positions, `s_i⁻` = short positions. Weight determines ranking + fee distribution.

---

## 2. Token Supply & Emissions

### Emission Schedule
```
E(t) = E(0) × (1 - ρ)^t
```
- `ρ` = yearly decay factor (e.g., 0.20 = 20% reduction/year)
- Year 1: ~50M TRUST, Year 2: ~40M, Year 3: ~32M, Year 4: ~25.6M
- Asymptotic limit: ~250M total (with ρ=0.20)
- Long-tail perpetual inflation (~<1%/year after year 10) possible via governance

### Emission Allocation Buckets
| Bucket | Purpose |
|--------|---------|
| Staking Rewards | Content curation on atoms/triples |
| Bonding Rewards | veTRUST holders (governance participants) |
| Liquidity Rewards | DEX liquidity providers |
| Node Operators | Indexing/query service providers |

---

## 3. Data Primitives

### Atoms (Identities)
- Fundamental knowledge unit: person, org, concept, address, predicate
- On-chain: `term_id`, data pointer (IPFS/URL), creator, vault_id, timestamp
- Off-chain: JSON-LD metadata with schema.org vocabulary
- Each atom has ONE vault for staking

### Triples (Claims)
- Semantic statement: Subject → Predicate → Object (all atoms)
- Each triple has TWO vaults: Support (FOR) + Counter (AGAINST)
- Examples: `[Ethereum] → [is] → [decentralized]`, `[Alice] → [trusts] → [Bob]`
- Protocol doesn't enforce semantic validity; community determines truth via staking

### Creation Fees
- Small TRUST fee required (prevents spam)
- Fee partially converts to creator's initial stake
- Creator can add additional stake at creation (no frontrunning risk)

---

## 4. Vaults & Staking Mechanics

### Vault Structure
| Entity | Vaults | Purpose |
|--------|--------|---------|
| Atom | 1 | Signal importance/validity of identity |
| Triple | 2 | Support vault (FOR) + Counter vault (AGAINST) |

### Staking Process
1. Deposit TRUST into vault
2. Receive shares based on bonding curve price
3. Pay entry fee (distributed to existing stakers)
4. Hold position to earn fee revenue + emissions
5. Exit: redeem shares for TRUST (minus exit fee)

### Stake Fraction Formula
```
StakeFraction_{i,j} = S_{i,j} / S_{total,j}
```
Entitles holder to proportional share of vault rewards.

### Staking Benefits
1. **Signal**: Economic weight = credibility indicator
2. **Fees**: Share of entry fees from future stakers
3. **Emissions**: Portion of protocol emissions
4. **Visibility**: Higher stake = prioritized in network caching/serving

---

## 5. Bonding Curves

Algorithmic pricing for vault shares. No order book needed. Continuous liquidity for billions of claims.

| Type | Formula | Behavior | Best For |
|------|---------|----------|----------|
| **Linear** (default) | `P = m×supply + b` | Constant, predictable | Stable data |
| **Exponential** | `P = a×supply²` | Accelerating | Trending claims |
| **Sigmoid** | `P = L/(1 + e^(-k(s-s₀)))` | S-curve plateau | Consensus formation |

- **Linear**: Pro-rata, low-risk; early/late stakers similar
- **Exponential**: Early stakers buy cheap, strong bootstrap; volatile on exits
- **Sigmoid**: Low→steep→plateau; `L`=max price, `s₀`=inflection, `k`=steepness
- **Governance**: DAO controls registry; can add/modify curves

---

## 6. veTRUST (Vote-Escrowed TRUST)

Lock TRUST for `d` (up to 4yr) for bonded weight: `f(d) = 1 + ((X-1)/T_max) × d`

**Decay**: `veTRUST_{i,t} = B_i × (d_i - t)/(d_i - t_i^lock)` — decays linearly to zero at expiry.

| Lock | Multiplier | | Lock | Multiplier |
|------|------------|-|------|------------|
| 0 | 1.0× | | 1yr | 1.7× |
| 3mo | 1.2× | | 2yr | 2.0× |
| 6mo | 1.4× | | 4yr | 2.0× (cap) |

*Multipliers governance-configurable*

---

## 7. Utilization Requirements

### System Utilization
**Purpose**: Tie emissions to actual network usage. Prevent inflation without value creation.

**Target**:
```
Y_t = φ × E_{t-1}
```
Where `φ` = utilization coefficient (e.g., 0.30 = 30% of last epoch's emissions must be deposited into knowledge graph).

**System Score**:
```
U^system_t = min(1, D^sys_t / Y_t)
```
Where `D^sys_t` = total TRUST deposited by all users this epoch.

| U^system | Reward Impact |
|----------|---------------|
| 100% | Full rewards released |
| 50% | ~50% rewards released |
| 0% | 25% floor (minimum) |

### Personal Utilization
**Purpose**: Ensure bonders actively contribute, not just passively earn.

**Requirements**:
1. Make ≥1 graph interaction per epoch (create/curate data)
2. Deposit `X` TRUST into graph, where:
```
X_{i,t} = θ × R_{i,t-1}
```
`θ` = recycling coefficient (e.g., 0.20 = recycle 20% of last epoch's rewards)

**Personal Score**:
```
U^personal_{i,t} = min(1, D_{i,t}/X_{i,t})  if active, else 0
```

### Combined Reward Multiplier
```
m_{i,t} = m_floor + (1 - m_floor) × U^system_t × U^personal_{i,t}
```
With `m_floor = 0.25`:

| U^system | U^personal | Multiplier |
|----------|------------|------------|
| 1.00 | 1.00 | 1.00× (full) |
| 0.60 | 1.00 | 0.70× |
| 1.00 | 0.50 | 0.625× |
| 0.00 | 0.00 | 0.25× (floor) |

---

## 8. Node Operators

Decentralized indexers serving knowledge graph (on-chain + off-chain → queryable GraphQL).

### Requirements & Slashing
| Requirement | Details | Slashing |
|-------------|---------|----------|
| **Bond** | `BOND_REQUIREMENT` in TRUST | Below min → ejection |
| **Uptime** | ≥θ (95%) | `S_u = λ×(θ-u)` partial |
| **Accuracy** | ≥φ (99%) | `S_A = α×(φ-A)` or full slash |

**Delegator Risk**: Slashing ∝ to ALL bonded stake (operator + delegators).

### Rewards
- **Emissions**: `P_i = α×C + β×Q + γ×ρ` → `R_i = R_epoch × P_i/ΣP_j`
- **Query Fees**: `R^fee = F × (Q×φ / Σ(Q×φ))` where φ = quality (accuracy/latency)
- **Routing**: `P(serve) = w_i/Σw_j`, `w = uptime × accuracy`

---

## 9. Governance

**DAO Flow**: Proposal (min TRUST) → Discussion → Voting (1 TRUST=1 vote or veTRUST) → On-chain execution

**Delegation**: Revocable at any time.

| Domain | Examples |
|--------|----------|
| Economics | Fees, rewards, slashing, ρ, θ, φ |
| Emissions | Gauge weights |
| Treasury | Grants, buybacks |
| Upgrades | Contracts, modules |
| Emergency | Pause functions |

### Gauge Voting (Curve-style)
- **Cast**: `0 ≤ f_{i,g} ≤ 1, Σf ≤ 1` (split veTRUST across gauges)
- **Aggregate**: `W_g = Σ(veTRUST × f)`
- **Split**: `E_g = E × W_g/W^tot`

| Gauge | Weight | Share |
|-------|--------|-------|
| Web3 | 2.0M | 40% |
| Consumer | 1.5M | 30% |
| Science | 1.5M | 30% |

**Parameter Tuning**: `p_{t+1} = p_t + Δp×Σ(veTRUST×s)/W^tot` where s∈{-1,0,+1}

---

## 10. Signaling & Standards

**TCR Dynamics**: Staking = voting with economic weight. High-stake → visible; low-stake → obscured.

**Standards Convergence**: Competing schemas (e.g., `hasReview` vs `review`) → community stakes → winner gets more fees/adoption → losers decay → de facto ontology emerges.

**Reputation**: Accurate stakers gain influence; others subscribe/mirror; incorrect stakes = damage + cost.

---

## 11. Fee Structure & Value Flows

### Fee Types
| Fee | Trigger | Distribution |
|-----|---------|--------------|
| Creation Fee | Create atom/triple | Creator stake + treasury |
| Entry Fee | Stake on vault | Prior stakers (pro-rata) |
| Exit Fee | Redeem from vault | Remaining stakers |
| Protocol Fee | All transactions | Treasury |
| Query Fee | API usage | Node operators |

### Illustrative Distribution (Create Triple)

| Recipient | Share | Purpose |
|-----------|-------|---------|
| Creator | ~50% | Becomes stake in triple |
| Referenced Atoms' stakers | ~25% | Cross-rewards connected knowledge |
| Treasury | ~25% | Protocol development |

### Value Capture Mechanisms
1. **Transaction fees** → Treasury
2. **Buyback & burn** → Deflationary pressure
3. **Treasury investments** → Yield generation
4. **Premium services** → Enterprise API fees

---

## 12. Incentive Alignment Summary

### Participant Incentives

| Role | Motivation | Aligned Behavior |
|------|------------|------------------|
| Creator | Stake ownership in data | Add valuable, truthful information early |
| Curator | Fee/emission revenue | Stake on accurate, useful claims |
| Long-term Holder | Governance + appreciation | Vote for sustainable policies |
| Node Operator | Query fees + emissions | Maintain uptime, serve correct data |
| Delegator | Passive bonding rewards | Select reliable operators |

### Game-Theoretic Properties
- **Sybil-resistant**: Staking costs real money
- **Self-cleaning**: Misinformation loses economic support (no stakes, no fees)
- **Incentive-compatible**: Best individual strategy = help network
- **Standards-convergent**: Popular schemas earn more, driving adoption
- **Sustainability**: Fee revenue replaces emissions over time

### Economic Security
| Attack | Deterrent |
|--------|-----------|
| Spam creation | Creation fees |
| False endorsements | Stake at risk if countered |
| Node manipulation | Slashing + ejection |
| Short-term speculation | Exit fees + lock requirements |
| Governance capture | veTRUST decay + delegation |

---

## 13. Formula Quick Reference

| Formula | Purpose |
|---------|---------|
| `E(t) = E(0) × (1-ρ)^t` | Emission decay |
| `w_i = s_i⁺ - κs_i⁻` | Net relevance weight |
| `veTRUST = B × (d-t)/(d-t_lock)` | Vote-escrow balance |
| `U^sys = min(1, D^sys/Y)`, `Y = φ×E_{t-1}` | System utilization |
| `U^per = min(1, D/X)`, `X = θ×R_{t-1}` | Personal utilization |
| `m = m_floor + (1-m_floor)×U^sys×U^per` | Reward multiplier |
| `P_i = α×C + β×Q + γ×ρ` | Node performance |
| `W_g = Σ(veTRUST × f)` | Gauge weight |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| Atom | Entity: person, org, concept, address, predicate |
| Triple | Subject→Predicate→Object claim (3 atoms) |
| Vault | Container for staked TRUST |
| Counter-Vault | AGAINST vault for triples |
| veTRUST | Locked TRUST with governance power |
| Gauge | Category competing for emissions |
| Bonding Curve | Pricing function for shares |
| Epoch | Reward calculation period |
| Slashing | Penalty on bonded stake |

---
*This document consolidates TRUST token economics. See [CONCEPTS.md](./CONCEPTS.md) for protocol fundamentals.*

