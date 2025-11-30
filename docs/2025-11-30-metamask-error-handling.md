# MetaMask Snap Error Handling APIs

> **Date:** November 30, 2025  
> **Purpose:** Reference guide for MetaMask Snap error handling APIs  
> **Source:** [MetaMask Snap Documentation](https://docs.metamask.io/snaps/how-to/communicate-errors/)

---

## Overview

MetaMask provides a set of **known error classes** that can be thrown from your Snap code without crashing the Snap. These errors are returned as JSON-RPC errors to the caller, allowing dApps to detect and handle specific error types appropriately.

**Key Benefits:**
- ✅ Prevents Snap crashes — errors are handled gracefully
- ✅ Standardized error codes — dApps can detect and handle specific error types
- ✅ User-friendly — errors are communicated back to the caller appropriately
- ✅ No console needed — replaces `console.error()` with structured error responses

---

## Available Error Classes

All error classes are imported from `@metamask/snaps-sdk`:

| Error Class | Error Code | Use Case |
|-------------|------------|----------|
| `ChainDisconnectedError` | 4901 | Provider disconnected from requested chain |
| `DisconnectedError` | 4900 | Provider is disconnected |
| `InternalError` | -32603 | Internal error occurred |
| `InvalidInputError` | -32000 | Method input is invalid |
| `InvalidParamsError` | -32602 | Method parameters are invalid |
| `InvalidRequestError` | -32600 | Request is invalid |
| `LimitExceededError` | -32005 | A limit has been exceeded |
| `MethodNotFoundError` | -32601 | Method does not exist |
| `MethodNotSupportedError` | -32004 | Method is not supported |
| `ParseError` | -32700 | Request is not valid JSON |
| `ResourceNotFoundError` | -32001 | Resource does not exist |
| `ResourceUnavailableError` | -32002 | Resource is unavailable |
| `TransactionRejected` | -32003 | Transaction has been rejected |
| `UnauthorizedError` | 4100 | Method/account not authorized by user |
| `UnsupportedMethodError` | 4200 | Method not supported by provider |
| `UserRejectedRequestError` | 4001 | User rejected the request |

---

## Usage Pattern

### Basic Import

```typescript
import { 
  MethodNotFoundError, 
  InternalError,
  ResourceUnavailableError 
} from '@metamask/snaps-sdk';
```

### Basic Usage

```typescript
// Simple error without custom message
throw new MethodNotFoundError();
```

### With Custom Message

```typescript
// Error with custom message
throw new InternalError('Failed to fetch account data');
```

### With Custom Message and Data

```typescript
// Error with custom message and additional context
throw new ResourceUnavailableError('GraphQL endpoint unavailable', {
  endpoint: 'https://testnet.intuition.sh/v1/graphql',
  retryAfter: 5000,
  chainId: '13579'
});
```

---

## Error Structure

All known errors follow this structure:

```typescript
class SnapJsonRpcError extends SnapError {
  new(message?: string, data?: Record<string, Json>)
}
```

**Properties:**
- `code`: Numeric error code (see table above)
- `message`: Error message string (optional, uses default if not provided)
- `data`: Optional JSON-serializable object with additional context

**Both parameters are optional:**
- If `message` is not provided, a pre-determined message is used
- If `data` is not provided, an empty object is passed
- `data` can be any JSON-serializable object

---

## Example: Replacing Console Errors

### ❌ Don't Do This

```typescript
try {
  const account = await fetchAccountData(address);
} catch (error) {
  console.error('Failed to fetch account data:', error);
  throw new Error('Failed');
}
```

### ✅ Do This Instead

```typescript
import { ResourceUnavailableError, InternalError } from '@metamask/snaps-sdk';

try {
  const account = await fetchAccountData(address);
} catch (error) {
  // Use appropriate error class with context
  throw new ResourceUnavailableError('Failed to fetch account data', {
    address: address,
    chainId: chainId,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
}
```

---

## Common Use Cases for Intuition Snap

### Network/API Failures

```typescript
import { ResourceUnavailableError } from '@metamask/snaps-sdk';

try {
  const response = await fetch(graphQLUrl, { ... });
  if (!response.ok) {
    throw new ResourceUnavailableError('GraphQL endpoint unavailable', {
      status: response.status,
      endpoint: graphQLUrl
    });
  }
} catch (error) {
  if (error instanceof ResourceUnavailableError) {
    throw error; // Re-throw known errors
  }
  throw new ResourceUnavailableError('Network request failed', {
    endpoint: graphQLUrl
  });
}
```

### Invalid Input

```typescript
import { InvalidInputError } from '@metamask/snaps-sdk';

if (!isValidAddress(address)) {
  throw new InvalidInputError('Invalid Ethereum address', {
    address: address,
    expectedFormat: '0x...'
  });
}
```

### Chain Mismatch

```typescript
import { ChainDisconnectedError } from '@metamask/snaps-sdk';

if (transactionChainId !== expectedChainId) {
  throw new ChainDisconnectedError('Transaction on wrong chain', {
    transactionChainId: transactionChainId,
    expectedChainId: expectedChainId
  });
}
```

### User Rejection

```typescript
import { UserRejectedRequestError } from '@metamask/snaps-sdk';

const userApproved = await requestUserApproval();
if (!userApproved) {
  throw new UserRejectedRequestError('User rejected the request');
}
```

---

## Error Detection in dApps

Known errors are thrown back to the caller as JSON-RPC errors with:
- `code`: Numeric error code
- `message`: Error message string
- `data`: Additional context object

**Example dApp error handling:**

```typescript
try {
  const result = await ethereum.request({
    method: 'wallet_requestSnaps',
    params: {
      'npm:revel8-snap': {}
    }
  });
} catch (error) {
  if (error.code === 4901) {
    // ChainDisconnectedError
    console.log('Wrong chain');
  } else if (error.code === -32002) {
    // ResourceUnavailableError
    console.log('Service unavailable:', error.data);
  }
}
```

---

## References

- **Official Documentation:** [How to Communicate Errors](https://docs.metamask.io/snaps/how-to/communicate-errors/)
- **Error Reference:** [Snaps Known Errors](https://docs.metamask.io/snaps/reference/known-errors/)
- **Example Snap:** [@metamask/error-example-snap](https://github.com/MetaMask/snaps/tree/main/packages/examples/packages/errors)
- **SDK Package:** [@metamask/snaps-sdk](https://github.com/MetaMask/snaps/tree/main/packages/snaps-sdk)

---

## Migration Checklist

When removing `console.error()` statements from the Intuition Snap:

- [ ] Identify the type of error (network, validation, user action, etc.)
- [ ] Choose the appropriate error class from the table above
- [ ] Replace `console.error()` + generic `throw Error()` with the known error class
- [ ] Include relevant context in the `data` parameter
- [ ] Test error handling in dApps that consume the Snap
- [ ] Verify errors are properly serialized and don't expose sensitive information

---

*This document should be updated as MetaMask adds new error classes or changes error handling APIs.*

