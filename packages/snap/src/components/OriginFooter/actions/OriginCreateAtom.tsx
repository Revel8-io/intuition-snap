import { OriginProps, OriginType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../../Footer/FooterLink';

/**
 * CTA to create an atom for an unknown dApp origin.
 * Allows users to be the first to add trust data for a dApp.
 *
 * Renders when: OriginType.NoAtom (unknown dApp)
 * Returns null when: Any other origin type or no origin URL
 */
export const OriginCreateAtom = (props: OriginProps) => {
  // Self-gate: only render for NoAtom state
  if (props.originType !== OriginType.NoAtom) {
    return null;
  }

  // Don't render if no origin URL to work with
  if (!props.hostname && !props.originUrl) {
    return null;
  }

  const { url } = vendor.originNoAtom(props);

  return (
    <FooterLink
      href={url}
      label="Add this dApp to knowledge graph"
    />
  );
};
