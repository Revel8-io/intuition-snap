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
    const addressAtomsPromise = graphQLQuery(getAddressAtomsQuery, {
      address: destinationAddress?.toLowerCase(),
      caipAddress: caipAddress?.toLowerCase(),
    });
    const codePromise = ethereum.request({
      method: 'eth_getCode',
      params: [destinationAddress, 'latest'],
    });
    const [addressAtomsResponse, accountType] = await Promise.all([
      addressAtomsPromise,
      codePromise,
    ]);
    console.log('addressAtomsResponse', JSON.stringify(addressAtomsResponse, null, 2));
    console.log('accountType', accountType);
    const {
      data: { atoms: [atom] },
    } = addressAtomsResponse;
    const isContract = accountType !== '0x';
    if (!atom) {
      return { account: atom, triple: null, isContract, nickname: null };
    }

    // account exists, now check if atom exists
    const { term_id: atomId } = atom;
    const { isAtomId, trustworthyAtomId, relatedNicknamesAtomId } =
      chainConfig as ChainConfig;
    const trustQuery = graphQLQuery(getTripleWithPositionsDataQuery, {
      subjectId: atomId,
      predicateId: isAtomId,
      objectId: trustworthyAtomId,
    });
    const nicknameQuery = graphQLQuery(getListWithHighestStakeQuery, {
      subjectId: atomId,
      predicateId: relatedNicknamesAtomId,
    });
    const [trustResponse, nicknameResponse] = await Promise.all([
      trustQuery,
      nicknameQuery,
    ]);
    const trustTriple = trustResponse.data.triples[0];
    const nicknameTriple = nicknameResponse.data.triples[0];
    const nickname = nicknameTriple?.object?.label;
    if (!trustTriple) {
      return {
        account: atom,
        triple: null,
        isContract,
        nickname,
      };
    }

    if (trustTriple) {
      return {
        account: atom,
        triple: trustTriple || null,
        nickname,
        isContract,
      };
    }
    return { account: null, triple: null, isContract, nickname: null };
  } catch (error: any) {
    console.error('getAccountData error', JSON.stringify(error));
    throw error;
  }
};

export const getAccountType = (
  accountData: GetAccountDataResult,
): AccountType => {
  const { account, triple } = accountData;

  if (account.atom_id === null) {
    return AccountType.AccountWithoutAtom;
  }
  if (triple === null) {
    return AccountType.AccountWithoutTrustData;
  }
  if (triple) {
    return AccountType.AccountWithTrustData;
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

  // TypeScript now knows the exact prop shape for each accountType
  const initialUI = AccountComponents[accountType](props as any);
  return initialUI;
};
