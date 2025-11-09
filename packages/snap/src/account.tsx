import { type ChainConfig, chainConfig } from './config';
import {
  getAccountQuery,
  getListWithHighestStakeQuery,
  getTripleWithPositionsDataQuery,
  getOriginAtomQuery,
  graphQLQuery,
  getAddressAtomsQuery,
} from './queries';
import {
  Account,
  AccountType,
  TripleWithPositions,
  AccountProps,
  GetOriginDataResult,
  OriginAtom,
  OriginType,
} from './types';
import { addressToCaip10 } from './util';
import { AccountComponents } from './components';
import { ChainId } from '@metamask/snaps-sdk';

export type GetAccountDataResult = {
  account: Account | null;
  triple: TripleWithPositions | null;
  isContract: boolean;
  nickname: string | null;
};

export const getAccountData = async (
  destinationAddress: string,
  chainId: ChainId,
): Promise<GetAccountDataResult> => {
  const caipAddress = addressToCaip10(destinationAddress, chainId);

  try {
    console.log('Starting parallel queries for:', destinationAddress, caipAddress);

    // PARALLEL: Fetch atoms in both formats and check if it's a contract
    const [atomsResponse, codeResponse] = await Promise.all([
      graphQLQuery(getAddressAtomsQuery, {
        plainAddress: destinationAddress,
        caipAddress: caipAddress,
      }),
      ethereum.request({
        method: 'eth_getCode',
        params: [destinationAddress, 'latest'],
      }),
    ]);

    console.log('atomsResponse', JSON.stringify(atomsResponse, null, 2));
    console.log('codeResponse', codeResponse);

    const isContract = codeResponse !== '0x';
    const { plainAtoms, caipAtoms } = atomsResponse.data;

    // Choose the appropriate atom based on address type
    const relevantAtom = isContract
      ? caipAtoms?.[0]   // Use CAIP format for smart contracts
      : plainAtoms?.[0]; // Use plain format for EOAs

    console.log('isContract:', isContract, 'relevantAtom:', relevantAtom);

    if (!relevantAtom) {
      return { account: null, triple: null, isContract, nickname: null };
    }

    // Use the relevant atom to check for trust data
    const { term_id: atomId } = relevantAtom;
    const { isAtomId, trustworthyAtomId, relatedNicknamesAtomId } =
      chainConfig as ChainConfig;

    // PARALLEL: Get trust and nickname data
    const [trustResponse, nicknameResponse] = await Promise.all([
      graphQLQuery(getTripleWithPositionsDataQuery, {
        subjectId: atomId,
        predicateId: isAtomId,
        objectId: trustworthyAtomId,
      }),
      graphQLQuery(getListWithHighestStakeQuery, {
        subjectId: atomId,
        predicateId: relatedNicknamesAtomId,
      }),
    ]);

    const trustTriple = trustResponse.data.triples[0];
    const nicknameTriple = nicknameResponse.data.triples[0];
    const nickname = nicknameTriple?.object?.label;

    // Return the account data with the relevant atom
    return {
      account: relevantAtom as Account,  // Using atom as account for now
      triple: trustTriple || null,
      isContract,
      nickname: nickname || null,
    };
  } catch (error: any) {
    console.error('getAccountData error', JSON.stringify(error));
    throw error;
  }
};

export const getAccountType = (
  accountData: GetAccountDataResult,
): AccountType => {
  const { account, triple } = accountData;

  if (account === null) {
    return AccountType.NoAccount;
  }

  // Since we're now using atoms directly, check if we have atom data
  if (!account.term_id) {
    return AccountType.NoAtom;
  }

  if (triple === null) {
    return AccountType.AtomWithoutTrustTriple;
  }

  if (triple) {
    return AccountType.AtomWithTrustTriple;
  }

  return AccountType.NoAccount; // default
};

export const getOriginData = async (
  transactionOrigin: string | undefined,
): Promise<GetOriginDataResult | null> => {
  if (!transactionOrigin) {
    return null;
  }

  try {
    // 1. Query for atom by label
    const atomResponse = await graphQLQuery(getOriginAtomQuery, {
      originLabel: transactionOrigin,
    });

    const atoms = atomResponse.data.atoms;
    if (!atoms || atoms.length === 0) {
      return {
        originAtom: null,
        originTriple: null, // is - trustworthy triple
        originNickname: null,
      };
    }

    const originAtom: OriginAtom = atoms[0];
    const { term_id: atomId } = originAtom;

    // 2. Check for trust triple and nickname
    const { isAtomId, trustworthyAtomId, relatedNicknamesAtomId } = chainConfig as ChainConfig;

    const [trustResponse, nicknameResponse] = await Promise.all([
      graphQLQuery(getTripleWithPositionsDataQuery, {
        subjectId: atomId,
        predicateId: isAtomId,
        objectId: trustworthyAtomId,
      }),
      graphQLQuery(getListWithHighestStakeQuery, {
        subjectId: atomId,
        predicateId: relatedNicknamesAtomId,
      }),
    ]);

    const trustTriple = trustResponse.data.triples[0];
    const nicknameTriple = nicknameResponse.data.triples[0];
    const nickname = nicknameTriple?.object?.label;

    return {
      originAtom,
      originTriple: trustTriple || null,
      originNickname: nickname || null,
    };

  } catch (error: any) {
    console.error('[getOriginData] error', JSON.stringify(error));
    // Return null instead of throwing to handle gracefully
    return null;
  }
};

export const getOriginType = (
  originData: GetOriginDataResult | null,
): OriginType => {
  if (!originData) {
    return OriginType.NoOrigin;
  }

  const { originAtom, originTriple } = originData;

  if (!originAtom) {
    return OriginType.NoAtom;
  }

  if (!originTriple) {
    return OriginType.AtomWithoutTrust;
  }

  return OriginType.AtomWithTrust;
};

export const renderOnTransaction = (props: AccountProps) => {
  const { accountType } = props;
  console.log('renderOnTransaction accountType', accountType);
  // TypeScript now knows the exact prop shape for each accountType
  const initialUI = AccountComponents[accountType](props as any);
  return initialUI;
};
