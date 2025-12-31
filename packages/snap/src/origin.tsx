import { type ChainConfig, chainConfig } from './config';
import {
  getOriginAtomQuery,
  getOriginTrustTripleQuery,
  graphQLQuery,
} from './queries';
import {
  Origin,
  OriginTriple,
  OriginType,
  OriginProps,
} from './types';
import { OriginComponents } from './components';

export type GetOriginDataResult = {
  origin: Origin | null;
  triple: OriginTriple | null;
  hostname: string | undefined;
};

/**
 * Extracts the hostname from a URL string.
 * Returns undefined if the URL is invalid or not provided.
 *
 * @param originUrl - The full origin URL (e.g., "https://app.uniswap.org")
 * @returns The hostname (e.g., "app.uniswap.org") or undefined
 */
const extractHostname = (originUrl: string | undefined): string | undefined => {
  if (!originUrl) return undefined;

  try {
    const url = new URL(originUrl);
    return url.hostname;
  } catch {
    // If URL parsing fails, try to extract hostname manually
    // Handle cases like "app.uniswap.org" without protocol
    const match = originUrl.match(/^(?:https?:\/\/)?([^\/]+)/);
    return match?.[1];
  }
};

/**
 * Fetches origin (dApp URL) data from Intuition's knowledge graph.
 * Queries for the origin atom and its trust triple if it exists.
 *
 * @param transactionOrigin - The origin URL from the transaction
 * @returns Origin data including atom and trust triple if found
 */
export const getOriginData = async (
  transactionOrigin: string | undefined,
): Promise<GetOriginDataResult> => {
  const hostname = extractHostname(transactionOrigin);

  // If no origin URL provided, return empty result
  if (!transactionOrigin || !hostname) {
    return {
      origin: null,
      triple: null,
      hostname: undefined,
    };
  }

  try {
    // Query for the origin atom using the full URL
    const atomResponse = await graphQLQuery(getOriginAtomQuery, {
      originUrl: transactionOrigin,
    });

    const originAtom = atomResponse.data.atoms?.[0] as Origin | undefined;

    // If no atom found, try with just the hostname
    if (!originAtom) {
      const hostnameResponse = await graphQLQuery(getOriginAtomQuery, {
        originUrl: hostname,
      });
      const hostnameAtom = hostnameResponse.data.atoms?.[0] as Origin | undefined;

      if (!hostnameAtom) {
        return {
          origin: null,
          triple: null,
          hostname,
        };
      }

      // Found atom via hostname, now query for trust triple
      return await fetchTrustTriple(hostnameAtom, hostname);
    }

    // Found atom via full URL, now query for trust triple
    return await fetchTrustTriple(originAtom, hostname);
  } catch (error) {
    // Log error but don't fail the transaction insight
    console.error('Error fetching origin data:', error);
    return {
      origin: null,
      triple: null,
      hostname,
    };
  }
};

/**
 * Fetches the trust triple for an origin atom.
 */
const fetchTrustTriple = async (
  originAtom: Origin,
  hostname: string,
): Promise<GetOriginDataResult> => {
  const { hasTagAtomId, trustworthyAtomId } = chainConfig as ChainConfig;

  try {
    const tripleResponse = await graphQLQuery(getOriginTrustTripleQuery, {
      subjectId: originAtom.term_id,
      predicateId: hasTagAtomId,
      objectId: trustworthyAtomId,
    });

    const triple = tripleResponse.data.triples?.[0] as OriginTriple | undefined;

    return {
      origin: originAtom,
      triple: triple || null,
      hostname,
    };
  } catch (error) {
    // If trust triple query fails, still return the atom
    console.error('Error fetching origin trust triple:', error);
    return {
      origin: originAtom,
      triple: null,
      hostname,
    };
  }
};

/**
 * Determines the OriginType based on the fetched data.
 * Mirrors the getAccountType pattern.
 */
export const getOriginType = (
  originData: GetOriginDataResult,
  transactionOrigin: string | undefined,
): OriginType => {
  // No origin URL provided at all
  if (!transactionOrigin) {
    return OriginType.NoOrigin;
  }

  const { origin, triple } = originData;

  // Origin URL provided but no atom exists
  if (!origin) {
    return OriginType.NoAtom;
  }

  // Atom exists but no trust triple
  if (!triple) {
    return OriginType.AtomWithoutTrustTriple;
  }

  // Atom and trust triple both exist
  return OriginType.AtomWithTrustTriple;
};

/**
 * Renders the origin insight UI based on origin type.
 * Mirrors the renderOnTransaction pattern.
 */
export const renderOriginInsight = (props: OriginProps) => {
  const { originType } = props;
  const originUI = OriginComponents[originType](props as any);
  return originUI;
};

