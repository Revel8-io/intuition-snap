import { AccountProps, AccountType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../FooterLink';

/**
 * CTA to stake on a trust triple.
 *
 * Renders when:
 * - AccountType.AtomWithoutTrustTriple (prompt to complete the triple)
 * - AccountType.AtomWithTrustTriple AND user has no existing position
 *
 * Returns null when:
 * - AccountType.NoAtom
 * - User already has a position on the trust triple
 */
export const StakePrompt = (props: AccountProps) => {
  // Self-gate: don't render for NoAtom state
  if (props.accountType === AccountType.NoAtom) {
    return null;
  }

  // Case 1: Atom exists but no trust triple - prompt to complete it
  if (props.accountType === AccountType.AtomWithoutTrustTriple) {
    const { url } = vendor.atomWithoutTrustTriple(props);
    return (
      <FooterLink
        href={url}
        label="Is this address trustworthy? Vote"
      />
    );
  }

  // Case 2: Trust triple exists - check if user has position
  if (props.accountType === AccountType.AtomWithTrustTriple) {
    const { triple, userAddress } = props;

    // Check if user already has a position on this triple
    // Positions are stored in positions (support) and counter_positions (oppose)
    const hasPosition = userAddress ? (
      triple.positions.some(p => p.account_id?.toLowerCase() === userAddress.toLowerCase()) ||
      triple.counter_positions.some(p => p.account_id?.toLowerCase() === userAddress.toLowerCase())
    ) : false;

    // Don't show stake prompt if user already has a position
    if (hasPosition) {
      return null;
    }

    const { url } = vendor.atomWithTrustTriple(props);
    return (
      <FooterLink
        href={url}
        label="Is this address trustworthy? Vote"
      />
    );
  }

  return null;
};

