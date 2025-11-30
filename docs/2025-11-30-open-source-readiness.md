# Open Source Readiness Checklist

> **Status:** Draft
> **Date:** November 30, 2025
> **Purpose:** Track code quality improvements required before making the repository public and publishing to npm

---

## Overview

Before publishing the Intuition Snap to npm and submitting for MetaMask allowlisting, the codebase must be cleaned up to reflect well on the organization. This document tracks the critical issues and important improvements identified.

---

## 🔴 Critical Issues (Must Fix)

### 1. Remove All Console Statements

**Current State:** All `console.*` methods must be removed (including `console.log`, `console.error`, `console.warn`, `console.debug`, `console.info`, `console.trace`).

**Why it matters:**
- MetaMask's [allowlisting prerequisites](https://docs.metamask.io/snaps/how-to/get-allowlisted/#prerequisites) explicitly require removing all `console` statements before submission
- MetaMask's [security guidelines](https://docs.metamask.io/snaps/learn/best-practices/security-guidelines) warn that error stacks can expose sensitive information through console output
- Console output can leak into logs and be exploited by malicious actors

**What to remove:**
- ❌ `console.log()`
- ❌ `console.error()`
- ❌ `console.warn()`
- ❌ `console.debug()`
- ❌ `console.info()`
- ❌ `console.trace()`
- ❌ Any other `console.*` methods

**What to do instead:**
- ✅ Use try/catch blocks for error handling
- ✅ Return structured error responses
- ✅ Use MetaMask's error handling APIs where appropriate
- ✅ Handle errors gracefully without exposing sensitive information

**Action:** Search entire codebase for all console statements and remove them, replacing with proper error handling.

---

### 2. Write Real Tests

**Current State:** Only boilerplate tests exist that test a `hello` RPC method—which isn't even the core feature of our Snap.

**Location:** `packages/snap/src/index.test.tsx`

**Why it matters:**
- Demonstrates code quality to reviewers
- Required for maintaining code integrity across updates
- Each version update requires re-allowlisting; tests prevent regressions

**Suggested test coverage:**

- [ ] `onTransaction` hook behavior
- [ ] Account data fetching and display
- [ ] Trust triple rendering (with/without positions)
- [ ] Nickname display
- [ ] Error handling for network failures
- [ ] Different account states (NoAtom, AtomWithoutTrustTriple, AtomWithTrustTriple)

**Reference:** Use `@metamask/snaps-jest` as shown in existing test file structure.

---

### 3. Update Snap Package README

**Current State:** Generic template text from MetaMask starter:

```markdown
# TypeScript Example Snap

This snap demonstrates how to develop a snap with TypeScript. It is a simple
snap that displays a confirmation dialog when the `hello` JSON-RPC method is
called.
```

**Location:** `packages/snap/README.md`

**Why it matters:** This is what developers see on npm. It should describe what the Snap actually does.

**Required sections:**
- [ ] What is this Snap?
- [ ] Features
- [ ] Installation
- [ ] Configuration (chain settings)
- [ ] Development setup
- [ ] Testing
- [ ] Contributing
- [ ] License

---

### 4. Fix Root README — Multiple Issues

**Location:** `README.md` (root)

The root README has several issues that need to be addressed before open-sourcing:

#### 4a. Remove "First Draft" Language
**Current:**
```markdown
This is the first draft for a community-driven MetaMask Snap effort for the Intuition network.
```
**Action:** Remove. Makes the project look unfinished.

---

#### 4b. Remove "More Features to Build" Section
**Current:** Lists internal roadmap items (homepage, mobile, SVGs, translations, etc.)

**Problems:**
- Makes the project look incomplete to potential users
- Internal roadmap doesn't belong in a public README
- Some items are already done (e.g., GitHub actions exist)

**Action:** Remove entirely. Move to GitHub issues or a separate `docs/ROADMAP.md` if needed.

---

#### 4c. Remove Vendor Integration Section (Broken Links)
**Current issues:**
- References `packages/snap/src/vendors/readme.md` — **file doesn't exist**
- References `packages/snap/src/vendors/example.ts` — **file doesn't exist**
- Only files in `vendors/` folder are `index.ts` and `vendor.config.ts`

**Action:** Remove the entire "Vendor Integration" section. Create proper `docs/VENDOR-INTEGRATION.md` later if needed.

---

#### 4d. Fix "Atoms Used" Section
**Current problems:**
- References `config.isAtomId` which doesn't exist (should be `hasCharacteristicAtomId`)
- Uses vague references instead of actual atom IDs
- Outdated date "2025-09-17"

**Action:** Update with actual atom IDs and correct references:

```markdown
### Atoms Used

The Snap queries the Intuition knowledge graph using these predefined atoms:

| Atom | Purpose | Testnet ID | Mainnet ID |
|------|---------|------------|------------|
| `hasCharacteristic` | Predicate for trust triples | `0x5cc843bd9ba824dbef4e80e7c41ced4ccde30a7b9ac66f0499c5766dc8811801` | `0x5cc843bd9ba824dbef4e80e7c41ced4ccde30a7b9ac66f0499c5766dc8811801` |
| `trustworthy` | The "trustworthy" characteristic | `0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a` | `0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a` |
| `hasNickname` | Predicate for nickname lists | `0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322` | `0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322` |

**Trust Triple structure:** `[address] - hasCharacteristic - trustworthy`
**Nickname List structure:** `[address] - hasNickname - [nickname atom]`
```

---

#### 4e. Add Missing Sections
**Action:** Add the following sections:
- [ ] Brief "What is this?" explanation for users
- [ ] Installation instructions (once published to npm)
- [ ] Requirements (MetaMask version, supported chains)
- [ ] Badges (build status, npm version, license)

---

### 5. Update License Copyright

**Current State:** `LICENSE.MIT0` contains:
```
Copyright 2022 ConsenSys Software Inc.
```

**Why it matters:** This is inherited from the MetaMask template. Should reflect actual copyright holder.

**Action:** Update to Intuition/Revel8 copyright with current year.

---

## 🟡 Important Improvements

### 1. Run Security Scan

**Tool:** [Snapper](https://github.com/sayfer-io/Snapper) - recommended by MetaMask

**Why it matters:** MetaMask requires scanning with Snapper and resolving any reported issues.

**Action:**
- [ ] Install and run Snapper
- [ ] Document any findings
- [ ] Resolve issues before publishing

---

### 2. Verify Icon Display

**Current State:** `packages/snap/src/images/logo.svg` exists

**Why it matters:** MetaMask crops icons in a circle for display.

**Action:**
- [ ] Test icon appearance when cropped circular
- [ ] Ensure visibility on both light and dark backgrounds (or use non-transparent background)

---

### 3. Audit Unused Code

**Action:**
- [ ] Check for unused permissions in `snap.manifest.json`
- [ ] Remove any unused dependencies from `package.json`
- [ ] Remove any dead code paths

---

## ✅ Already Good

| Item | Status | Notes |
|------|--------|-------|
| Version consistency | ✅ | Both `package.json` and `snap.manifest.json` at `0.3.0` |
| Repository URL | ✅ | Consistent across files |
| Package name | ✅ | `revel8-snap` matches in both locations |
| proposedName | ✅ | "Revel8" doesn't contain prohibited words |
| License file | ✅ | Apache-2.0 present |
| CI/CD | ✅ | Build, lint, test workflows exist |
| No TODO comments | ✅ | 0 found in source |

---

## Publishing Blockers Summary

| Blocker | Severity | Effort |
|---------|----------|--------|
| All console statements (log, error, warn, etc.) | 🔴 Critical | Low |
| No meaningful test coverage | 🔴 Critical | Medium-High |
| Template README in snap package (`packages/snap/README.md`) | 🔴 Critical | Low |
| Root README: Remove "first draft" language | 🔴 Critical | Trivial |
| Root README: Remove "More Features to Build" section | 🔴 Critical | Trivial |
| Root README: Remove broken Vendor Integration section | 🔴 Critical | Trivial |
| Root README: Fix "Atoms Used" with actual IDs | 🔴 Critical | Low |
| Root README: Add missing sections (install, requirements) | 🔴 Critical | Low |
| Incorrect license copyright | 🔴 Critical | Trivial |
| Snapper security scan | 🟡 Important | Variable |
| Icon verification | 🟡 Important | Trivial |
| Audit unused code/permissions | 🟡 Important | Low |

---

## Next Steps

1. **Assign owners** for each issue above
2. **Create GitHub issues** for tracking
3. **Set timeline** for completion
4. **Review as team** before making repo public

---

*This checklist was generated based on [MetaMask Snap publishing requirements](https://docs.metamask.io/snaps/how-to/publish-a-snap/) and [allowlisting prerequisites](https://docs.metamask.io/snaps/how-to/get-allowlisted/).*

