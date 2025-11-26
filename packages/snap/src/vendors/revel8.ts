import { AccountType, PropsForAccountType } from '../types';
import { type Vendor } from '.';
import { chainConfig, type ChainConfig } from '../config';
import { addressToCaip10 } from '../util';

const CHAIN_URLS: Record<number, string> = {
  // 13579: 'https://explorer.revel8.io',
  // 1155: 'https://testnet.explorer.revel8.io',
  13579: 'https://localhost:3000',
  1155: 'https://localhost:3000',
};

// Get the base URL for the current chain at module load time
console.log('chainConfig', JSON.stringify(chainConfig, null, 2))
console.log('CHAIN_URLS', JSON.stringify(CHAIN_URLS, null, 2))
const baseUrl = CHAIN_URLS[chainConfig.chainId];
console.log('baseUrl', baseUrl)
export const revel8: Vendor = {
  name: 'Revel8 Explorer',

  // links should send ALL critical info to the vendor website
  // that way actions / modals can be created from any
  // page on the vendor website
  noAtom: (
    params: PropsForAccountType<AccountType.NoAtom>,
  ) => {
    const { address, chainId, isContract } = params;
    const addressToUse = isContract ? addressToCaip10(address, chainId) : address;

    const url = new URL('/redirect/complete_address_trustworthy_triple', baseUrl);
    url.searchParams.set('address', addressToUse);
    url.searchParams.set('chain_id', chainId);
    return {
      // http://localhost:3000/rankings/,0x5cc8...1801,0xa037...05110ca
      // ?modal=complete_triple
      // &atom_type=evm_address
      // &evm_address=caip10%3Aeip155%3A13579%3Aundefined
      // &chain_id=eip155%3A13579
      // &atom_ids=%2C0x5cc843bd9...8811801%2C0xa037a2b9...10ca
      url: url.toString(),
    };
  },

  atomWithoutTrustTriple: (
    params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ) => {
    const { account } = params;
    if (!account)
      throw new Error('getAccountAtomNoTrustData account not found');
    const { term_id: atomId } = account;
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;
    const url = new URL(`/atoms/${atomId}`, baseUrl);
    url.searchParams.set('modal', 'complete_triple');
    url.searchParams.set('atom_ids', `${atomId},${isAtomId},${trustworthyAtomId}`);

    return {
      url: url.toString(),
    };
  },

  atomWithTrustTriple: (
    params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ) => {
    const { triple } = params;
    if (!triple) throw new Error('getAccountWithTrustData triple not found');
    const { term_id: tripleId } = triple;
    const url = new URL(`/triples/${tripleId}`, baseUrl);
    url.searchParams.set('modal', 'stake_triple');
    url.searchParams.set('triple_id', tripleId);
    url.searchParams.set('direction', 'support');

    return {
      url: url.toString(),
    };
  },
};
