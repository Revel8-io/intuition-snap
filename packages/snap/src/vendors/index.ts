import { AccountType, OriginType, PropsForAccountType } from '../types';
import { revel8 } from './revel8';

type VendorCtaResponse = {
  url: string;
};

export type Vendor = {
  name: string;
  [AccountType.NoAccount]?: (
    props: PropsForAccountType<AccountType.NoAccount>,
  ) => VendorCtaResponse;
  [AccountType.NoAtom]?: (
    props: PropsForAccountType<AccountType.NoAtom>,
  ) => VendorCtaResponse;
  [AccountType.AtomWithoutTrustTriple]?: (
    props: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ) => VendorCtaResponse;
  [AccountType.AtomWithTrustTriple]?: (
    props: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ) => VendorCtaResponse;
};
// change to array?
export const VENDOR_LIST: Vendor[] = [revel8];
