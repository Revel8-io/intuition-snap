import { AccountType, PropsForAccountType } from '../types';
import { type Vendor } from '.';
import { chainConfig, type ChainConfig } from '../config';
import { addressToCaip10 } from '../util';

const origins: Record<string, string> = {
  '13579': 'https://explorer.revel8.io',
  '1155': 'https://testnet.explorer.revel8.io',
} as const;

const getExplorerOrigin = (chainId: number) => {
  return origins[chainId];
}

const getCurrentExplorerOrigin = () => {
  return getExplorerOrigin(chainConfig.chainId);
}

export const revel8Base: Partial<Vendor> = {
  name: 'Revel8',

  [AccountType.NoAtom]: function(
    params: PropsForAccountType<AccountType.NoAtom>,
  ): { url: string } {
    const { address, chainId, isContract } = params;
    const addressToUse = isContract ? addressToCaip10(address, chainId) : address;
    return {
      url: `${getCurrentExplorerOrigin()}/redirect/complete_address_trustworthy_triple?address=${addressToUse}&chain_id=${chainId}`,
    };
  },

  [AccountType.AtomWithoutTrustTriple]: function(
    params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ): { url: string } {
    const { account } = params;
    if (!account)
      throw new Error('getAccountAtomNoTrustData account not found');
    const { term_id: atomId } = account;
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;
    return {
      url: `${getCurrentExplorerOrigin()}/atoms/${atomId}?modal=complete_triple&atom_ids=${atomId},${isAtomId},${trustworthyAtomId}`,
    };
  },

  [AccountType.AtomWithTrustTriple]: function(
    params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ): { url: string } {
    const { triple } = params;
    if (!triple) throw new Error('getAccountWithTrustData triple not found');
    const { term_id: tripleId } = triple;
    return {
      url: `${getCurrentExplorerOrigin()}/triples/${tripleId}?modal=stake_triple&triple_id=${tripleId}&direction=support`,
    };
  },
};

const getVendor = (chainId: number): Vendor => {
  return {
    ...revel8Base,
    // explorer origin based on chainId, determined at runtime
    explorerOrigin: getExplorerOrigin(chainId),
  } as Vendor;
}
export const revel8 = getVendor(chainConfig.chainId);
