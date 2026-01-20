/**
 * Cache utilities for Trusted Circle data.
 *
 * Uses MetaMask Snap's snap_manageState for persistent storage.
 * Implements TTL-based cache invalidation (1 hour default).
 *
 * @module trusted-circle/cache
 */

import type {
  TrustedContact,
  CachedTrustedCircle,
  TrustedCircleState,
} from './types';

/** Cache TTL in milliseconds (1 hour) */
const CACHE_TTL_MS = 60 * 60 * 1000;

/**
 * Checks if a cached entry is still valid based on TTL.
 *
 * @param timestamp - When the cache was created
 * @returns True if cache is still valid
 */
export function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL_MS;
}

/**
 * Retrieves the cached trusted circle for a user.
 * Returns null if cache doesn't exist or is expired.
 *
 * @param userAddress - The user's wallet address
 * @returns Cached trusted contacts or null
 */
export async function getTrustedCircleCache(
  userAddress: string,
): Promise<TrustedContact[] | null> {
  try {
    const state = (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    })) as TrustedCircleState | null;

    if (!state) {
      return null;
    }

    const normalizedAddress = userAddress.toLowerCase();
    const cached = state[normalizedAddress];

    if (!cached) {
      return null;
    }

    if (!isCacheValid(cached.timestamp)) {
      // Cache expired, return null to trigger refresh
      return null;
    }

    return cached.contacts;
  } catch {
    // If state retrieval fails, return null to proceed without cache
    return null;
  }
}

/**
 * Stores the trusted circle for a user in persistent cache.
 *
 * @param userAddress - The user's wallet address
 * @param contacts - List of trusted contacts to cache
 */
export async function setTrustedCircleCache(
  userAddress: string,
  contacts: TrustedContact[],
): Promise<void> {
  try {
    // Get existing state to preserve other users' data
    const existingState = (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    })) as TrustedCircleState | null;

    const normalizedAddress = userAddress.toLowerCase();

    const newEntry: CachedTrustedCircle = {
      contacts,
      timestamp: Date.now(),
    };

    const newState: TrustedCircleState = {
      ...(existingState || {}),
      [normalizedAddress]: newEntry,
    };

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState: JSON.parse(JSON.stringify(newState)), // Ensure newState is serializable as Json
      },
    });
  } catch {
    // Cache write failure is non-critical, continue silently
  }
}

/**
 * Clears the trusted circle cache for a specific user or all users.
 *
 * @param userAddress - Optional user address. If omitted, clears all.
 */
export async function clearTrustedCircleCache(
  userAddress?: string,
): Promise<void> {
  try {
    if (!userAddress) {
      // Clear all
      await snap.request({
        method: 'snap_manageState',
        params: {
          operation: 'update',
          newState: {},
        },
      });
      return;
    }

    const existingState = (await snap.request({
      method: 'snap_manageState',
      params: { operation: 'get' },
    })) as TrustedCircleState | null;

    if (!existingState) {
      return;
    }

    const normalizedAddress = userAddress.toLowerCase();
    const { [normalizedAddress]: _, ...rest } = existingState;

    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState: JSON.parse(JSON.stringify(rest)), // Ensure newState is serializable as Json
      },
    });
  } catch {
    // Clear cache failure is non-critical, continue silently
  }
}

