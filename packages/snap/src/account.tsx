import { type ChainConfig, chainConfig } from './config';
import {
  getListWithHighestStakeQuery,
  getTripleWithPositionsDataQuery,
  graphQLQuery,
  getAddressAtomsQuery,
} from './queries';
import {
  Account,
  AccountType,
  TripleWithPositions,
  AccountProps,
} from './types';
import { addressToCaip10 } from './util';
import { AccountComponents } from './components';
import { ChainId } from '@metamask/snaps-sdk';
import axios from 'axios';

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
  const { chainId: configChainId, rpcUrl } = chainConfig;
  const caipAddress = addressToCaip10(destinationAddress, chainId);

  try {
    // if it's on our chain (Intuitin Mainnet) then use our own node
    const simpleChainId = chainId.split(':')[1];
    let isContract = true
    if (simpleChainId === configChainId.toString()) {
      // use our own node to see if smart contract
      // todo: switch back if they fix ethereum.request()
      const codeResponse = await axios.post(rpcUrl, {
        method: 'POST',
        data: {
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [destinationAddress, 'latest']
        },
      });
      isContract = codeResponse.data.result !== '0x';
    }

    const [atomsResponse] = await Promise.all([
      graphQLQuery(getAddressAtomsQuery, {
        plainAddress: destinationAddress,
        caipAddress: caipAddress,
      }),
    ]);
    const { plainAtoms, caipAtoms } = atomsResponse.data;

    // Choose the appropriate atom based on address type
    const relevantAtom = isContract
      ? caipAtoms?.[0]   // Use CAIP format for smart contracts
      : plainAtoms?.[0]; // Use plain format for EOAs


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

  // Since we're now using atoms directly, check if we have atom data
  if (!account) {
    return AccountType.NoAtom;
  }

  if (triple === null) {
    return AccountType.AtomWithoutTrustTriple;
  }

  if (triple) {
    return AccountType.AtomWithTrustTriple;
  }

  return AccountType.NoAtom; // default
};

export const renderOnTransaction = (props: AccountProps) => {
  const { accountType } = props;
  console.log('renderOnTransaction accountType', accountType);
  // TypeScript now knows the exact prop shape for each accountType
  const initialUI = AccountComponents[accountType](props as any);
  return initialUI;
};
