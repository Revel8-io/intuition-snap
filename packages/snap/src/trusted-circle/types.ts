/**
 * Types for Trusted Circle feature.
 *
 * The trusted circle represents accounts that the current user has staked FOR
 * on trust triples (i.e., accounts they consider trustworthy).
 *
 * @module trusted-circle/types
 */

/**
 * A trusted contact with minimal display information.
 */
export interface TrustedContact {
  /** The account's term_id (subject_id from the trust triple) */
  accountId: string;
  /** Display label (address, ENS, or other identifier) */
  label: string;
}

/**
 * Cached trusted circle data with timestamp for TTL validation.
 */
export interface CachedTrustedCircle {
  /** List of trusted contacts */
  contacts: TrustedContact[];
  /** Timestamp when cache was created (ms since epoch) */
  timestamp: number;
}

/**
 * State structure stored via snap_manageState.
 * Keyed by user address for multi-account support.
 */
export interface TrustedCircleState {
  /** Map of user address to their cached trusted circle */
  [userAddress: string]: CachedTrustedCircle;
}

/**
 * Contacts from the trusted circle who have positions on a triple.
 * Used to display "Your Trusted Contacts" section.
 */
export interface TrustedCirclePositions {
  /** Trusted contacts who staked FOR */
  forContacts: TrustedContact[];
  /** Trusted contacts who staked AGAINST */
  againstContacts: TrustedContact[];
}

