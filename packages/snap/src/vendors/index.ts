import { AccountType, PropsForAccountType } from '../types';
import { revel8 } from './revel8';

type VendorCtaResponse = {
  url: string;
};

export type Vendor = {
  name: string;
  logo?: string;

  noAtom: (
    props: PropsForAccountType<AccountType.NoAtom>,
  ) => VendorCtaResponse;
  atomWithoutTrustTriple: (
    props: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ) => VendorCtaResponse;
  atomWithTrustTriple: (
    props: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ) => VendorCtaResponse;
};
// change to array?
export const VENDOR_LIST: Vendor[] = [revel8];
