import { revel8 } from './revel8';
import { AccountType, PropsForAccountType } from '../types';

type VendorCtaResponse = {
  url: string;
};

export type Vendor = {
  name: string;
  [AccountType.NoAccount]?: (
    props: PropsForAccountType<AccountType.NoAccount>,
  ) => VendorCtaResponse;
  [AccountType.AccountWithoutAtom]?: (
    props: PropsForAccountType<AccountType.AccountWithoutAtom>,
  ) => VendorCtaResponse;
  [AccountType.AccountWithoutTrustData]?: (
    props: PropsForAccountType<AccountType.AccountWithoutTrustData>,
  ) => VendorCtaResponse;
  [AccountType.AccountWithTrustData]?: (
    props: PropsForAccountType<AccountType.AccountWithTrustData>,
  ) => VendorCtaResponse;
};
// change to array?
export const VENDOR_LIST: Vendor[] = [revel8];
