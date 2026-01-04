/**
 * Trusted Circle Service.
 *
 * Fetches and manages the user's trusted circle (accounts they trust)
 * and cross-references with positions on triples.
 *
 * @module trusted-circle/service
 */

import { graphQLQuery, getUserTrustedCircleQuery } from '../queries';
import { chainConfig, ChainConfig } from '../config';
import { getTrustedCircleCache, setTrustedCircleCache } from './cache';
import type { TrustedContact, TrustedCirclePositions } from './types';

/**
 * Response shape from the trusted circle GraphQL query.
 */
interface TrustedCircleQueryResponse {
  data: {
    positions: {
      triple: {
        subject_id: string;
        subject: {
          label: string;
        };
      };
    }[];
  };
}

/**
 * Fetches the user's trusted circle from GraphQL.
 * These are accounts the user has staked FOR on trust triples.
 *
 * @param userAddress - The user's wallet address
 * @returns Array of trusted contacts
 */
async function fetchTrustedCircleFromAPI(
  userAddress: string,
): Promise<TrustedContact[]> {
  const { hasTagAtomId, trustworthyAtomId } = chainConfig as ChainConfig;

  const response = (await graphQLQuery(getUserTrustedCircleQuery, {
    userAddress,
    predicateId: hasTagAtomId,
    objectId: trustworthyAtomId,
  })) as TrustedCircleQueryResponse;

  const positions = response?.data?.positions || [];

  // Extract unique contacts (user might have multiple positions on same triple)
  const contactMap = new Map<string, TrustedContact>();

  for (const position of positions) {
    const { subject_id, subject } = position.triple;
    if (!contactMap.has(subject_id)) {
      contactMap.set(subject_id, {
        accountId: subject_id,
        label: subject?.label || subject_id,
      });
    }
  }

  return Array.from(contactMap.values());
}

/**
 * Gets the user's trusted circle, using cache when available.
 *
 * @param userAddress - The user's wallet address
 * @returns Array of trusted contacts (may be empty)
 */
export async function getTrustedCircle(
  userAddress: string,
): Promise<TrustedContact[]> {
  // Try cache first
  const cached = await getTrustedCircleCache(userAddress);
  if (cached !== null) {
    return cached;
  }

  // Cache miss or expired, fetch fresh data
  const contacts = await fetchTrustedCircleFromAPI(userAddress);

  // Store in cache for next time
  await setTrustedCircleCache(userAddress, contacts);

  return contacts;
}

/**
 * Position data from a triple query.
 */
interface PositionWithAccount {
  account_id: string;
  account?: {
    id: string;
    label: string;
  };
}

/**
 * Filters positions to only include trusted contacts.
 * Cross-references the user's trusted circle with positions on a triple.
 *
 * @param trustedCircle - The user's trusted contacts
 * @param forPositions - Positions staking FOR
 * @param againstPositions - Positions staking AGAINST
 * @returns Trusted contacts with their stance (FOR/AGAINST)
 */
export function getTrustedContactsWithPositions(
  trustedCircle: TrustedContact[],
  forPositions: PositionWithAccount[],
  againstPositions: PositionWithAccount[],
): TrustedCirclePositions {
  // Create a Set for O(1) lookup of trusted account IDs
  const trustedIds = new Set(
    trustedCircle.map((c) => c.accountId.toLowerCase()),
  );

  // Also create a map for quick label lookup
  const trustedLabels = new Map(
    trustedCircle.map((c) => [c.accountId.toLowerCase(), c.label]),
  );

  // Filter FOR positions to trusted contacts
  const forContacts: TrustedContact[] = [];
  for (const position of forPositions) {
    const accountId = position.account_id?.toLowerCase();
    if (accountId && trustedIds.has(accountId)) {
      forContacts.push({
        accountId: position.account_id,
        label:
          trustedLabels.get(accountId) ||
          position.account?.label ||
          formatAddress(position.account_id),
      });
    }
  }

  // Filter AGAINST positions to trusted contacts
  const againstContacts: TrustedContact[] = [];
  for (const position of againstPositions) {
    const accountId = position.account_id?.toLowerCase();
    if (accountId && trustedIds.has(accountId)) {
      againstContacts.push({
        accountId: position.account_id,
        label:
          trustedLabels.get(accountId) ||
          position.account?.label ||
          formatAddress(position.account_id),
      });
    }
  }

  return { forContacts, againstContacts };
}

/**
 * Formats an address for display (first 6 + last 4 chars).
 *
 * @param address - Full address string
 * @returns Truncated address like "0x1234...5678"
 */
function formatAddress(address: string): string {
  if (!address || address.length < 12) {
    return address || 'Unknown';
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

