import { AccountProps, AccountType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../FooterLink';

/**
 * CTA to create an alias triple for an address.
 *
 * Renders when:
 * - Atom exists (AtomWithoutTrustTriple or AtomWithTrustTriple)
 * - AND no alias is set
 *
 * Returns null when:
 * - AccountType.NoAtom
 * - Alias already exists
 */
export const CreateAlias = (props: AccountProps) => {
  // Self-gate: don't render for NoAtom state
  if (props.accountType === AccountType.NoAtom) {
    return null;
  }

  // Don't show if alias already exists
  if (props.alias) {
    return null;
  }

  const { url } = vendor.createAlias(props);

  return (
    <FooterLink
      href={url}
      label={`Add alias`}
      icon="🏷️"
    />
  );
};

