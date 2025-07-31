import { getChainConfigByChainId } from '../config';

export const REVEL8 = {
  name: 'Revel8',
  getNoAccountAtomInfo: (address: string, chainId: string) => {
    return {
      url: `https://localhost:3000/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  getAccountAtomNoTripleInfo: (account: any, chainId: string) => {
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig) {
      throw new Error(
        `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
      );
    }
    const { IS_ATOM_ID, MALICIOUS_ATOM_ID } = chainConfig;
    console.log('getAccountAtomNoTripleInfo account', JSON.stringify(account));
    const { atom_id: atomId } = account;
    return {
      url: `https://localhost:3000/atoms/${atomId}?modal=complete_triple&chain_id=${chainId}&atom_ids=${atomId},${IS_ATOM_ID},${MALICIOUS_ATOM_ID}`,
    };
  },
};
