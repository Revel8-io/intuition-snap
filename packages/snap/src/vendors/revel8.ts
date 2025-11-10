import { AccountType, PropsForAccountType } from '../types';
import { type Vendor } from '.';
import { chainConfig, type ChainConfig } from '../config';

const origin = 'https://localhost:3000';

// change to class?
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
};
