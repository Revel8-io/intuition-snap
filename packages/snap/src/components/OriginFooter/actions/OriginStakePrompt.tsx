import { OriginProps, OriginType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../../Footer/FooterLink';

/**
 * CTA to stake on a dApp origin's trust triple.
 *
 * Renders when:
 * - OriginType.AtomWithoutTrustTriple (prompt to complete the triple)
 * - OriginType.AtomWithTrustTriple (prompt to stake)
 *
 * Returns null when:
 * - OriginType.NoOrigin
 * - OriginType.NoAtom
 */
export const OriginStakePrompt = (props: OriginProps) => {
  // Self-gate: don't render for NoOrigin or NoAtom states
  if (
    props.originType === OriginType.NoOrigin ||
    props.originType === OriginType.NoAtom
  ) {
    return null;
  }

  // Case 1: Origin atom exists but no trust triple - prompt to complete it
  if (props.originType === OriginType.AtomWithoutTrustTriple) {
    const { url } = vendor.originAtomWithoutTrustTriple(props);
    return (
      <FooterLink
        href={url}
        label="Is this dApp trustworthy? Vote"
      />
    );
  }

  // Case 2: Trust triple exists - prompt to stake
  if (props.originType === OriginType.AtomWithTrustTriple) {
    const { url } = vendor.originAtomWithTrustTriple(props);
    return (
      <FooterLink
        href={url}
        label="Is this dApp trustworthy? Vote"
      />
    );
  }

  return null;
};

