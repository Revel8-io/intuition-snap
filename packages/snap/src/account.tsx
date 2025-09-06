import { type ChainConfig, getChainConfigByChainId } from './config';
import {
  getAccountQuery,
  getListWithHighestStakeQuery,
  getTripleWithPositionsDataQuery,
  graphQLQuery,
} from './queries';
import type {
  Account,
  AccountType,
  TripleWithPositions,
  AccountProps,
} from './types';
import { addressToCaip10 } from './util';
import { AccountComponents } from './components';

export type GetAccountDataResult = {
  account: Account | null;
  triple: TripleWithPositions | null;
  isContract: boolean;
  nickname: string | null;
};

export const getAccountData = async (
  destinationAddress: string,
  chainId: string,
): Promise<GetAccountDataResult> => {
  const caipAddress = addressToCaip10(destinationAddress, chainId);
  const chainConfig = getChainConfigByChainId(chainId);
  if (!chainConfig) {
    throw new Error(
      `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
    );
  }
  try {
    const accountPromise = graphQLQuery(getAccountQuery, {
      address: destinationAddress,
      caipAddress,
    });
    const codePromise = ethereum.request({
      method: 'eth_getCode',
      params: [destinationAddress, 'latest'],
    });
    const [accountResponse, accountType] = await Promise.all([
      accountPromise,
      codePromise,
    ]);
    const {
      data: { accounts },
    } = accountResponse;
    const isContract = accountType !== '0x';
    if (accounts.length === 0) {
      return { account: null, triple: null, isContract, nickname: null };
    }

    if (accounts[0].atom_id === null) {
      return { account: accounts[0], triple: null, isContract, nickname: null };
    }

    // account exists, now check if atom exists
    const { atom_id: atomId } = accounts[0];
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig) {
      throw new Error(
        `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
      );
    }
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
        account: accounts[0],
        triple: null,
        isContract,
        nickname,
      };
    }

    if (trustTriple) {
      return {
        account: accounts[0],
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

  if (account === null) {
    return AccountType.NoAccount;
  }
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

export const renderOnTransaction = (props: AccountProps) => {
  console.log('renderOnTransaction props', JSON.stringify(props, null, 2));
  const { accountType } = props;
  console.log('renderOnTransaction accountType', accountType);

  // TypeScript now knows the exact prop shape for each accountType
  const initialUI = AccountComponents[accountType]?.(props);
  console.log('renderOnTransaction initialUI', initialUI);
  return initialUI;
};
