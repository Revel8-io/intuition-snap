import { revel8 } from './revel8';
import { type OnTransactionProps } from '../onTransaction';
import { Identity } from 'src/types';

type VendorCtaResponse = {
  url: string;
};

export type Vendor = {
  name: string;
  noAccount?: (props: Identity) => VendorCtaResponse;
  getNoAccountAtomData?: (props: Identity) => VendorCtaResponse;
  getAccountAtomNoTrustData?: (props: Identity) => VendorCtaResponse;
  getAccountAtomTrustData?: (props: Identity) => VendorCtaResponse;
};
// change to array?
export const VENDORS_LIST: Vendor[] = [revel8];

export const VENDORS: Record<string, Vendor> = {
  revel8,
};
