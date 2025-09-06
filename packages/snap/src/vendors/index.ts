import { revel8 } from './revel8';
import { Identity } from 'src/types';

type VendorCtaResponse = {
  url: string;
};

export type Vendor = {
  name: string;
  NoAccount?: (props: Identity) => VendorCtaResponse;
  AccountWithoutAtom?: (props: Identity) => VendorCtaResponse;
  AccountWithoutTrustData?: (props: Identity) => VendorCtaResponse;
  AccountWithTrustData?: (props: Identity) => VendorCtaResponse;
};
// change to array?
export const VENDOR_LIST: Vendor[] = [revel8];

export const VENDORS: Record<string, Vendor> = {
  revel8,
};
