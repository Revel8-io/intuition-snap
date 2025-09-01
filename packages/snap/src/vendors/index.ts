import type { Vendor } from '../types';
import { revel8 } from './revel8';

// change to array?
export const VENDORS_LIST: Vendor[] = [revel8];

export const VENDORS: Record<string, Vendor> = {
  revel8,
};
