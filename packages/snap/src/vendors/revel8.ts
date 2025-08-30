import { getChainConfigByChainId, type ChainConfig } from '../config';
import type { Account } from '../types';

const origin = 'https://localhost:3000';

export const revel8 = {
  name: 'Revel8',
  getNoAccountAtomInfo: (address: string, chainId: string) => {
    return {
      url: `${origin}/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  getAccountAtomNoTripleInfo: (account: Account, chainId: string) => {
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig) {
      throw new Error(
        `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
      );
    }
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;
    const { atom_id: atomId } = account;
    return {
      url: `${origin}/atoms/${atomId}?modal=complete_triple&chain_id=${chainId}&atom_ids=${atomId},${isAtomId},${trustworthyAtomId}`,
    };
  },
  getAccountAtomTripleInfo: (
    tripleId: string,
    _chainId?: string, // needed or no?
  ) => {
    return {
      stakeTripleUrl: `${origin}/triples/${tripleId}?modal=stake_triple&direction=support`,
    };
  },
};
