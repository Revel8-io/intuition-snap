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
import { ChainId, Transaction } from '@metamask/snaps-sdk';

export type GetAccountDataResult = {
  account: Account | null;
  triple: TripleWithPositions | null;
  isContract: boolean;
  nickname: string | null;
};

export const getAccountData = async (
  transaction: Transaction,
  chainId: ChainId,
): Promise<GetAccountDataResult> => {
  const { to: destinationAddress, data: transactionData } = transaction;
  const { chainId: configChainId } = chainConfig;
  const caipAddress = addressToCaip10(destinationAddress, chainId);

  // if it is a contract then grab the right type of atom (caip)
  let hasCode = transactionData !== '0x';

  // even if its data is 0x it could still be a contract
  if (!hasCode) {
    try {
      // Switch chain if needed (only if different)
      const txChainId = chainId.split(':')[1];
      if (txChainId !== configChainId.toString()) {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      }

      // Get code (works regardless of whether we switched)
      const codeResponse = await ethereum.request({
        method: 'eth_getCode',
        params: [destinationAddress, 'latest'],
      });

      console.log('codeResponse', codeResponse);
      hasCode = codeResponse !== '0x';

    } catch (err) {
      console.error('getCode or switchChain error', JSON.stringify(err));
      // fallback to true because CAIP atom is more specific and therefore
      // better if we don't know whether it's a contract or not
      hasCode = true;
    }
  }

  const isContract = hasCode;
  console.log('isContract', isContract);
  try {
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
  // TypeScript now knows the exact prop shape for each accountType
  const initialUI = AccountComponents[accountType](props as any);
  return initialUI;
};
