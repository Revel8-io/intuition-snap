import { AccountType, PropsForAccountType } from '../types';
import { type Vendor } from '.';
import { chainConfig, type ChainConfig } from '../config';
import { addressToCaip10 } from '../util';

const CHAIN_URLS: Record<number, string> = {
  13579: 'https://explorer.revel8.io',
  1155: 'https://testnet.explorer.revel8.io',
};

// Get the base URL for the current chain at module load time
const baseUrl = CHAIN_URLS[chainConfig.chainId] || CHAIN_URLS[13579];

export const revel8: Vendor = {
  name: 'Revel8',

  [AccountType.NoAtom]: (
    params: PropsForAccountType<AccountType.NoAtom>,
  ) => {
    const { address, chainId, isContract } = params;
    const addressToUse = isContract ? addressToCaip10(address, chainId) : address;
    return {
      url: `${baseUrl}/redirect/complete_address_trustworthy_triple?address=${addressToUse}&chain_id=${chainId}`,
    };
  },

  [AccountType.AtomWithoutTrustTriple]: (
    params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ) => {
    const { account } = params;
    if (!account)
      throw new Error('getAccountAtomNoTrustData account not found');
    const { term_id: atomId } = account;
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;
    return {
      url: `${baseUrl}/atoms/${atomId}?modal=complete_triple&atom_ids=${atomId},${isAtomId},${trustworthyAtomId}`,
    };
  },

  [AccountType.AtomWithTrustTriple]: (
    params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ) => {
    const { triple } = params;
    if (!triple) throw new Error('getAccountWithTrustData triple not found');
    const { term_id: tripleId } = triple;
    return {
      url: `${baseUrl}/triples/${tripleId}?modal=stake_triple&triple_id=${tripleId}&direction=support`,
    };
  },
};
