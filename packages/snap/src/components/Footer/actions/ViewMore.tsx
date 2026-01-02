import { AccountProps, AccountType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../FooterLink';

/**
 * CTA to view more details about the address on the vendor site.
 *
 * Always renders (except for NoAtom where there's nothing to view).
 * This is the lowest priority action, shown at the bottom.
 */
export const ViewMore = (props: AccountProps) => {
  // For NoAtom, there's no atom page to view
  // The CreateTrustTriple action handles this case
  if (props.accountType === AccountType.NoAtom) {
    return null;
  }

  const { url } = vendor.viewAtom(props);

  return (
    <FooterLink
      href={url}
      label="View more about this address"
    />
  );
};

