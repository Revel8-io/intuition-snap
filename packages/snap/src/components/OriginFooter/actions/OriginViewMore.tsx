import { OriginProps, OriginType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../../Footer/FooterLink';

/**
 * CTA to view more details about the dApp origin on the vendor site.
 *
 * Renders when origin atom exists.
 * Returns null when: NoOrigin or NoAtom (nothing to view)
 */
export const OriginViewMore = (props: OriginProps) => {
  // Self-gate: only render when origin atom exists
  if (
    props.originType === OriginType.NoOrigin ||
    props.originType === OriginType.NoAtom
  ) {
    return null;
  }

  const { url } = vendor.viewOriginAtom(props);

  return (
    <FooterLink
      href={url}
      label="View more about this dApp"
    />
  );
};

