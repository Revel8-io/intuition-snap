import { AccountProps, AccountType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../FooterLink';

/**
 * CTA to create a trust triple for an address that has no atom yet.
 *
 * Renders when: AccountType.NoAtom
 * Returns null when: Any other account type
 */
export const CreateTrustTriple = (props: AccountProps) => {
  // Self-gate: only render for NoAtom state
  if (props.accountType !== AccountType.NoAtom) {
    return null;
  }

  const { url } = vendor.noAtom(props);

  return (
    <FooterLink
      href={url}
      label="Create trust claim"
    />
  );
};

