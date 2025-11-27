import { AccountType, PropsForAccountType, AccountProps } from '../types';
import { revel8 } from './revel8';

type VendorCtaResponse = {
  url: string;
};

/** Props for actions that require an atom to exist */
type PropsWithAtom =
  | PropsForAccountType<AccountType.AtomWithoutTrustTriple>
  | PropsForAccountType<AccountType.AtomWithTrustTriple>;

export type Vendor = {
  name: string;
  logo?: string;

  /** Generate URL for creating a trust triple (no atom exists) */
  noAtom: (
    props: PropsForAccountType<AccountType.NoAtom>,
  ) => VendorCtaResponse;

  /** Generate URL for completing a trust triple (atom exists, no trust data) */
  atomWithoutTrustTriple: (
    props: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ) => VendorCtaResponse;

  /** Generate URL for staking on a trust triple */
  atomWithTrustTriple: (
    props: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ) => VendorCtaResponse;

  /** Generate URL for viewing an atom's details */
  viewAtom: (props: PropsWithAtom) => VendorCtaResponse;

  /** Generate URL for creating a nickname triple */
  createNickname: (props: PropsWithAtom) => VendorCtaResponse;
};

// change to array?
export const VENDOR_LIST: Vendor[] = [revel8];
