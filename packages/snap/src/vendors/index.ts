import { revel8 } from './revel8';
import { type OnTransactionProps } from '../cta';

type VendorCtaResponse = {
  url: string;
};

export type Vendor = {
  name: string;
  getNoAccountAtomData?: (props: OnTransactionProps) => VendorCtaResponse;
  getAccountAtomNoTrustData?: (props: OnTransactionProps) => VendorCtaResponse;
  getAccountAtomTrustData?: (props: OnTransactionProps) => VendorCtaResponse;
};
// change to array?
export const VENDORS_LIST: Vendor[] = [revel8];

export const VENDORS: Record<string, Vendor> = {
  revel8,
};
