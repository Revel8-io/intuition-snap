import { type Vendor } from '.';
import { getChainConfigByChainId, type ChainConfig } from '../config';
import { type OnTransactionProps } from '../cta';

const origin = 'https://localhost:3000';

export const revel8: Vendor = {
  name: 'Revel8',
  getNoAccountAtomData: (params: OnTransactionProps) => {
    const {
      context: { address, chainId },
    } = params;
    return {
      url: `${origin}/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  getAccountAtomNoTrustData: (params: OnTransactionProps) => {
    const {
      context: { chainId, account },
    } = params;
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
  getAccountAtomTrustData: (params: OnTransactionProps) => {
    const {
      context: { triple },
    } = params;
    if (!triple) throw new Error('getAccountAtomTrustData triple not found');
    const { term_id: tripleId } = triple;
    return {
      url: `${origin}/triples/${tripleId}?modal=stake_triple&direction=support`,
    };
  },
};
