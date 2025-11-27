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

  /**
   * Generate URL for creating a trust triple when no atom exists.
   * Links should send ALL critical info to the vendor website
   * so actions/modals can be created from any page.
   */
  noAtom: (
    params: PropsForAccountType<AccountType.NoAtom>,
  ) => {
    console.log('params', JSON.stringify(params, null, 2))
    const { address, chainId, isContract } = params;
    const addressToUse = isContract ? addressToCaip10(address, chainId) : address;

    const url = new URL('/snap/action', baseUrl);
    url.searchParams.set('intent', 'complete_address_trustworthy_triple');
    url.searchParams.set('address', addressToUse);
    url.searchParams.set('chain_id', chainId);

    return { url: url.toString() };
  },

  /**
   * Generate URL for completing a trust triple (atom exists, no trust data).
   */
  atomWithoutTrustTriple: (
    params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ) => {
    console.log('params', JSON.stringify(params, null, 2))
    const { account } = params;
    if (!account)
      throw new Error('atomWithoutTrustTriple: account not found');
    const { term_id: atomId } = account;
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;

    const url = new URL('/snap/action', baseUrl);
    url.searchParams.set('intent', 'complete_triple');
    url.searchParams.set('atom_id', atomId);
    url.searchParams.set('atom_ids', `${atomId},${isAtomId},${trustworthyAtomId}`);

    return { url: url.toString() };
  },

  /**
   * Generate URL for staking on a trust triple.
   */
  atomWithTrustTriple: (
    params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ) => {
    console.log('params', JSON.stringify(params, null, 2))
    const { triple } = params;
    if (!triple) throw new Error('atomWithTrustTriple: triple not found');
    const { term_id: tripleId } = triple;

    const url = new URL('/snap/action', baseUrl);
    url.searchParams.set('intent', 'stake_triple');
    url.searchParams.set('triple_id', tripleId);

    return { url: url.toString() };
  },

  /**
   * Generate URL for viewing an atom's details page.
   */
  viewAtom: (params) => {
    const { account } = params;
    if (!account)
      throw new Error('viewAtom: account not found');
    const { term_id: atomId } = account;

    const url = new URL(`/atoms/${atomId}`, baseUrl);

    return { url: url.toString() };
  },

  /**
   * Generate URL for creating a nickname triple.
   * Uses the 'has nickname' predicate to link the address atom to a text atom.
   */
  createNickname: (params) => {
    const { account } = params;
    if (!account)
      throw new Error('createNickname: account not found');
    const { term_id: atomId } = account;
    const { relatedNicknamesAtomId } = chainConfig as ChainConfig;

    const url = new URL('/snap/action', baseUrl);
    url.searchParams.set('intent', 'create_nickname');
    url.searchParams.set('subject_id', atomId);
    url.searchParams.set('predicate_id', relatedNicknamesAtomId);

    return { url: url.toString() };
  },
};
