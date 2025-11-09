import { AccountType, PropsForAccountType, OriginType } from '../types';
import { type Vendor } from '.';
import { chainConfig, type ChainConfig } from '../config';

const origin = 'https://localhost:3000';

export const revel8: Vendor = {
  name: 'Revel8',
  [AccountType.NoAtom]: ( // will want to push user to COMPLETE triple (create atom + 2 existing)
    params: PropsForAccountType<AccountType.NoAtom>,
  ) => {
    const { address, chainId } = params;
    return {
      url: `${origin}/redirect/complete_address_trustworthy_triple?address=${address}&chain_id=${chainId}`,
    };
  },
  [AccountType.AtomWithoutTrustTriple]: ( // will want to push user to CREATE triple (3 atoms exist)
    params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
  ) => {
    const { chainId, account, address } = params;
    if (!account)
      throw new Error('getAccountAtomNoTrustData account not found');
    const { term_id: atomId } = account;
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;
    return {
      url: `${origin}/atoms/${atomId}?modal=complete_triple&atom_type=evm_address&evm_address=${address}&chain_id=${chainId}&atom_ids=${atomId},${isAtomId},${trustworthyAtomId}`,
    };
  },
  [AccountType.AtomWithTrustTriple]: (
    params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
  ) => {
    const { triple } = params;
    if (!triple) throw new Error('getAccountWithTrustData triple not found');
    const { term_id: tripleId } = triple;
    return {
      url: `${origin}/triples/${tripleId}?modal=stake_triple&triple_id=${tripleId}&direction=support`,
    };
  },

  // Origin-specific methods
  [`origin_${OriginType.NoAtom}`]: (params: any) => {
    const { transactionOrigin, chainId } = params;
    // For URL atoms, we create them differently than address atoms
    return {
      url: `${origin}/redirect/create_url_atom?url=${encodeURIComponent(transactionOrigin)}&chain_id=${chainId}`,
    };
  },

  [`origin_${OriginType.AtomWithoutTrust}`]: (params: any) => {
    const { originData, chainId } = params;
    if (!originData?.originAtom) throw new Error('Origin atom not found');
    const { term_id: atomId } = originData.originAtom;
    const { isAtomId, trustworthyAtomId } = chainConfig as ChainConfig;
    return {
      url: `${origin}/atoms/${atomId}?modal=complete_triple&chain_id=${chainId}&atom_ids=${atomId},${isAtomId},${trustworthyAtomId}`,
    };
  },

  [`origin_${OriginType.AtomWithTrust}`]: (params: any) => {
    const { originData } = params;
    if (!originData?.originTriple) throw new Error('Origin triple not found');
    const { term_id: tripleId } = originData.originTriple;
    return {
      url: `${origin}/triples/${tripleId}?modal=stake_triple&triple_id=${tripleId}&direction=support`,
    };
  },
};

// https://testnet.explorer.revel8.io/redirect/complete_address_trustworthy_triple?address=0x2ece8d4dedcb9918a398528f3fa4688b1d2cab91&chain_id=eip155:13579
// http://localhost:3000/redirect/complete_address_trustworthy_triple?address=0x2ece8d4dedcb9918a398528f3fa4688b1d2cab91&chain_id=eip155:13579
