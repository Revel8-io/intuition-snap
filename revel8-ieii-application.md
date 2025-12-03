# Revel8 - Intuition Ecosystem Grant Application

> **Submitted to:** [Intuition Ecosystem Development Grants](https://atlas.discourse.group/t/grant-application-template/1160)

---

## 1. Applicant & Project Overview

### Required

**Project Name:** Revel8

**Team / Individual Name(s):** Kylan Hurt

**Links:**
- Website: https://revel8.io
- Snap (npm): https://www.npmjs.com/package/revel8-snap
- Snap (GitHub): https://github.com/revel8-io/intuition-snap
- Explorer: https://explorer.revel8.io (under construction)
- Browser Extension: in development (repository private)

**100-Word Summary:**

Revel8 is a consumer-facing trust layer for Web3, powered by Intuition. Three components:

1. **Revel8 Snap**: Displays trust signals and aliases for addresses in MetaMask's transaction confirmation flow
2. **Revel8 Explorer**: Web interface for viewing, creating, and (un)staking Intuition data
3. **Revel8 Browser Extension**: Detects entities (addresses, URLs, social profiles) while browsing and surfaces relevant Intuition insights. Users able to contribute to the knowledge graph through write smart contract actions

Together, these tools make Intuition's knowledge graph accessible to everyday users—helping them avoid scams and verify trusted entities at the moment they need it most.

**Project Category:** Consumer App / Identity / DID / Reputation

### Optional

**Notable Traction:**
- Snap v1.0.0 published to npm, pending MetaMask Snaps Directory listing
- Browser Extension built with Plasmo, supports X.com profile detection, EVM addresses, and URLs
- Full testnet and mainnet support across all products

---

## 2. What You're Building

### Required

**Problem Statement:**

Users interact with unknown addresses and entities without any trust context. Intuition's knowledge graph contains valuable data, but it's not accessible where users need it—in their wallet and browser.

**Proposed Solution:**

| Product | Function |
|---------|----------|
| **Snap** | Trust signals during MetaMask transaction signing (support/oppose, nicknames, market cap) |
| **Explorer** | Create atoms, triples, nicknames; stake on trust signals |
| **Extension** | Detect entities while browsing (X.com profiles, addresses, URLs) and show Intuition insights in sidepanel |

**Stage of Development:**
- Snap: MVP / live
- Explorer: MVP / live
- Extension: Prototype

### Optional

**Architecture:**

1. Explorer and extension write to Multivault smart contract (create / stake)
2. Intuition node indexes and serves updated data
3. Explorer, extension, and Snap read data and present to end-user
4. Rinse and repeat

Note: Snap may be able to create / stake if and when they support the following Snap Improvement Proposals:
https://github.com/MetaMask/SIPs/pull/180 (submitted by me)


**Security:** No key management permissions. All transactions require user approval.

---

## 3. Team & Execution Ability

### Required

**Team:**
- Kylan Hurt — application developer (Web3, React, TypeScript)

**Execution Proof:**
- Snap v1.0.0 shipped to npm with full test suite
- Multiple **live** demos of all three products while in development
- Comprehensive documentation (User Knowledge Base, Architecture docs)

**Commitment:** Currently part-time... would love to leave my MetaMask job to work on Revel8 / Intuition full-time

---

## 4. Grant Request & Milestones

### Required

**Amount Requested:** 100,000 USD and/or TRUST

| Milestone | Deliverable | Timeline |
|-----------|-------------|----------|
| M1 | Snap in MetaMask Snaps Directory | 2 weeks |
| M2 | Explorer v1.0 (create atoms, triples, stake) | 4-6 weeks |
| M3 | Extension v1 in Chrome Web Store | 3-4 months |
| M4 | Extension + bonding curve functionality | M3 + 1-2 months
| M5 | Extension plugin development program launched | M4 + 1-2 months

**Success Criteria:**

| Milestone | Criteria |
|-----------|----------|
| M1 | Snap listed; >100 installs first month |
| M2 | Explorer live with atom & triple creation, lists, and tables + sorting and pagination |
| M3 | Extension approved by Chrome store **including social media functionality** |
| M4 | Extension plugin development program launched with 5+ external developers contributing

---

## 5. Intuition Ecosystem Alignment

### Required

**Why Intuition:** I have always wanted to build apps that have a social aspect and incentivize good behavior.

**Primitives Used:** Atoms, triples, signals, and eventually bonding curves.

**Why built on Intuition:** I had been waiting six years for a reputation management system that actually made sense. Intuition is the first one I've seen that meets that criteria.

### Optional

**TRUST Integration:** TRUST is used for the signals that we display (and sort by market cap), users will be encouraged to stake (and unstake), generating significant fees for the network

**Network Contribution:** I want users to be able to see Intuition insights on nearly every web-based entity that encounter while browsing the internet. And THEN once we've caught the public's attention hopefully we can encourage large web platforms to integrate Intuition into their apps so that we can penetrate into the mobile ecosystem

---

## 6. Sustainability & Long-Term Vision

### Required

**Vision:**
- 6 months: All three products live with 10K+ combined users
- 12 months: enter into the public's consciousness, pushing TRUST price up and attract more developers
- 24 months: Disruption 🤘
- Next: integration into major web, mobile, and social media platforms

**Sustainability:** Charge small fees during smart contract interactions (atom & triple creation, staking, etc)

---

## 7. Additional Materials

### Required

**Demo:**
- Install Snap via `npm:revel8-snap` in MetaMask Flask
- [Live Snap demo](https://x.com/Revel8_io/status/1948066647761403947?s=20)
- [Live extension prototype demo](https://x.com/0xIntuition/status/1950923329608572984?s=20)

**Screenshots:**
[Explorer + Snap](https://imgur.com/D7DYR5h)

**Contact:**
Email: kylan.hurt@gmail.com
Discord: @smilingkylan
X: @smilingkylan
Wallet: smilingkylan.eth or 0xcf806bacafbbcf09959b1866b5c1479fbef97e05

---

## 8. Applicant Attestation

I confirm that all information submitted is accurate and that I intend to deliver the listed milestones.

**Name:** Kylan Hurt
**Wallet Address:** smilingkylan.eth or 0xcf806bacafbbcf09959b1866b5c1479fbef97e05
**Date:** December 5, 2025
