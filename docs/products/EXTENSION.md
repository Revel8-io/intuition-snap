# Hive Mind Extension

> **Purpose**: Product-specific context for working on the hivemind-extension browser extension.

---

## Overview

The Extension is a **Chrome browser extension that brings Intuition data to the browsing experience**.

**Location:** `/hivemind/hivemind-extension`

---

## Features

| Feature | Description |
|---------|-------------|
| Entity Detection | Detect addresses, URLs, social profiles on any page |
| Contextual Insights | Show trust data in sidepanel |
| Atom Queue | Collect detected entities for batch creation |
| Quick Staking | Stake without leaving the page |
| X.com Integration | Special support for Twitter profiles |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Plasmo | Extension framework |
| React | UI framework |
| TypeScript | Type safety |
| TanStack Router | Sidepanel routing |
| React Query | Server state |
| Zustand | Client state |
| Chrome APIs | Extension functionality |
| viem | Web3 (ad-hoc connections) |

---

## Architecture

```
┌──────────────────┬──────────────────┬───────────────────────────────┐
│  Background      │  Content Scripts │  Sidepanel (React)            │
│  (Service Worker)│  (Per-domain)    │  (Main UI)                    │
├──────────────────┼──────────────────┼───────────────────────────────┤
│ • Web3 state     │ • URL detection  │ • TanStack Router             │
│ • Message hub    │ • Address detect │ • React Query                 │
│ • Contract calls │ • X.com scraper  │ • Atom queue                  │
│ • Session persist│ • Entity extract │ • Modal system                │
└──────────────────┴──────────────────┴───────────────────────────────┘
```

---

## Project Structure

```
hivemind-extension/
├── src/
│   ├── background/              # Service worker
│   │   ├── index.ts             # Entry point
│   │   ├── web3-service.ts      # Wallet management
│   │   └── messages/            # Message handlers
│   ├── contents/                # Content scripts
│   │   ├── global-url-detector.ts
│   │   ├── global-address-detector.ts
│   │   └── x-com.ts
│   ├── sidepanel.tsx            # Sidepanel entry
│   ├── routes/                  # Sidepanel pages
│   ├── components/              # UI components
│   ├── hooks/                   # React hooks
│   ├── providers/               # Context providers
│   └── lib/
│       └── atom-queue/          # Entity queue system
├── assets/                      # Icons, images
└── package.json
```

---

## Key Files

| Purpose | Path |
|---------|------|
| Background entry | `src/background/index.ts` |
| Web3 service | `src/background/web3-service.ts` |
| URL detector | `src/contents/global-url-detector.ts` |
| Address detector | `src/contents/global-address-detector.ts` |
| X.com scraper | `src/contents/x-com.ts` |
| Sidepanel entry | `src/sidepanel.tsx` |
| Atom queue | `src/lib/atom-queue/` |
| Modal provider | `src/providers/ModalProvider.tsx` |

---

## Extension Components

### Background (Service Worker)

Persistent background process that:
- Manages wallet connection state
- Handles cross-component messaging
- Executes contract calls
- Persists session data

```typescript
// Message handling pattern
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONNECT_WALLET') {
    handleConnectWallet().then(sendResponse);
    return true;  // Async response
  }
});
```

### Content Scripts

Injected into web pages to detect entities:

| Script | Runs On | Detects |
|--------|---------|---------|
| `global-url-detector.ts` | All pages | URLs |
| `global-address-detector.ts` | All pages | EVM addresses (on hover) |
| `x-com.ts` | x.com, twitter.com | Twitter profiles |

### Sidepanel

React app for the main UI. Opens alongside web pages.

---

## Communication Flow

```
Content Script → chrome.runtime.sendMessage → Background
                                                   ↓
Sidepanel ← chrome.runtime.sendMessage ← Background

# Or using storage for state:
Background → chrome.storage.session.set → Sidepanel reads
```

### Message Pattern

```typescript
// Content script sends
chrome.runtime.sendMessage({
  type: 'ENTITY_DETECTED',
  data: { url: 'https://example.com', type: 'url' }
});

// Background receives
chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === 'ENTITY_DETECTED') {
    // Store or forward to sidepanel
  }
});
```

---

## Atom Queue System

Collects detected entities for batch atom creation:

```typescript
// Add to queue
const { addToQueue } = useAtomQueue();
addToQueue({ type: 'url', data: 'https://example.com' });

// Process queue (create atoms)
const { processQueue } = useAtomQueue();
await processQueue();
```

---

## Ad-Hoc Wallet Connection

Extensions can't use wagmi's React hooks in background scripts. Use ad-hoc viem clients:

```typescript
import { createWalletClient, custom } from 'viem';

async function connectWallet() {
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  
  const client = createWalletClient({
    account: accounts[0],
    transport: custom(window.ethereum),
  });
  
  return client;
}
```

---

## Content Script Isolation

Content scripts run in isolated contexts:
- Cannot access React context
- Cannot import from sidepanel
- Must use Chrome messaging API

### ❌ Wrong

```typescript
// content-script.ts
const { addToQueue } = useAtomQueue();  // Won't work!
```

### ✅ Correct

```typescript
// content-script.ts
chrome.runtime.sendMessage({ type: 'ADD_TO_QUEUE', data: entity });

// background.ts
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'ADD_TO_QUEUE') {
    // Forward to sidepanel or store
  }
});
```

---

## Development

```bash
cd hivemind-extension
pnpm install
pnpm dev          # Start Plasmo dev server
```

Then load the extension in Chrome:
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `build/chrome-mv3-dev`

---

## Common Tasks

### Add a Content Script

1. Create in `src/contents/`
2. Add Plasmo config comment at top:
   ```typescript
   export const config: PlasmoCSConfig = {
     matches: ["https://example.com/*"]
   }
   ```
3. Plasmo auto-includes it

### Add a Message Handler

1. Define message type
2. Add handler in background
3. Send from content script or sidepanel

### Persist State Across Sessions

Use `chrome.storage.session` (cleared on browser close) or `chrome.storage.local` (persistent):

```typescript
// Save
await chrome.storage.session.set({ walletAddress: address });

// Load
const { walletAddress } = await chrome.storage.session.get('walletAddress');
```

---

## Gotchas

1. **Content script isolation**: Can't share React state
2. **Service worker lifecycle**: May sleep, use alarms for periodic tasks
3. **Multiple dev servers**: Kill all before restart (`pkill -f plasmo`)
4. **Manifest permissions**: Add new permissions to `package.json`
5. **X.com detection**: Twitter uses dynamic loading, need MutationObserver

---

## Integration Points

| Dependency | Purpose |
|------------|---------|
| `hivemind-core` | Shared UI components |
| `@0xintuition/protocol` | Contract interactions |
| Intuition GraphQL API | Data source |
| Chrome APIs | Extension functionality |

---

*See also: [../concepts/ARCHITECTURE.md](../concepts/ARCHITECTURE.md) for system overview*

*Last updated: January 21, 2026*
