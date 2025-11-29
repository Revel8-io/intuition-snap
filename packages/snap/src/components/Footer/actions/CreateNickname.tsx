import { AccountProps, AccountType } from '../../../types';
import { vendor } from '../../../vendors';
import { FooterLink } from '../FooterLink';

/**
 * CTA to create a nickname triple for an address.
 *
 * Renders when:
 * - Atom exists (AtomWithoutTrustTriple or AtomWithTrustTriple)
 * - AND no nickname is set
 *
 * Returns null when:
 * - AccountType.NoAtom
 * - Nickname already exists
 */
export const CreateNickname = (props: AccountProps) => {
  // Self-gate: don't render for NoAtom state
  if (props.accountType === AccountType.NoAtom) {
    return null;
  }

  // Don't show if nickname already exists
  if (props.nickname) {
    return null;
  }

  const { url } = vendor.createNickname(props);

  return (
    <FooterLink
      href={url}
      label={`Add nickname`}
      icon="🏷️"
    />
  );
};

