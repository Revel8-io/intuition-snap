import { AccountType, PropsForAccountType } from '../types';
import { type Vendor } from '.';
import { getChainConfigByChainId, type ChainConfig } from '../config';

const origin = 'https://testnet.trust-scan.io';

export const revel8: Vendor = {
  name: 'Revel8',
  [AccountType.NoAccount]: (
    params: PropsForAccountType<AccountType.NoAccount>,
  ) => {
    const { address, chainId } = params;
    return {
      url: `${origin}/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  [AccountType.AccountWithoutAtom]: (
    params: PropsForAccountType<AccountType.AccountWithoutAtom>,
  ) => {
    const { address, chainId } = params;
    return {
      url: `${origin}/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  [AccountType.AccountWithoutTrustData]: (
    params: PropsForAccountType<AccountType.AccountWithoutTrustData>,
  ) => {
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
  [AccountType.AccountWithTrustData]: (
    params: PropsForAccountType<AccountType.AccountWithTrustData>,
  ) => {
    const { triple } = params;
    if (!triple) throw new Error('getAccountWithTrustData triple not found');
    const { term_id: tripleId } = triple;
    return {
      url: `${origin}/triples/${tripleId}?modal=stake_triple&triple_id=${tripleId}&direction=support`,
    };
  },
};
