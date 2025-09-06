import { Identity } from 'src/types';
import { type Vendor } from '.';
import { getChainConfigByChainId, type ChainConfig } from '../config';

const origin = 'https://localhost:3000';

export const revel8: Vendor = {
  name: 'Revel8',
  NoAccount: (params: Identity) => {
    const { address, chainId } = params;
    return {
      url: `${origin}/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  AccountWithoutAtom: (params: Identity) => {
    const { address, chainId } = params;
    return {
      url: `${origin}/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  AccountWithoutTrustData: (params: Identity) => {
    const { chainId, account } = params;
    if (!account)
      throw new Error('getAccountAtomNoTrustData account not found');
    const { atom_id: atomId } = account;
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig) {
      throw new Error(
        `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
      );
    }
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;
    return {
      url: `${origin}/atoms/${atomId}?modal=complete_triple&chain_id=${chainId}&atom_ids=${atomId},${isAtomId},${trustworthyAtomId}`,
    };
  },
  AccountWithTrustData: (params: Identity) => {
    const { triple } = params;
    if (!triple) throw new Error('getAccountWithTrustData triple not found');
    const { term_id: tripleId } = triple;
    return {
      url: `${origin}/triples/${tripleId}?modal=stake_triple&triple_id=${tripleId}&direction=support`,
    };
  },
};
