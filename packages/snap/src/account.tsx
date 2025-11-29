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
  AddressClassification,
  AlternateTrustData,
  ClassificationFailureReason,
} from './types';
import { addressToCaip10 } from './util';
import { AccountComponents } from './components';
import { ChainId, Transaction } from '@metamask/snaps-sdk';

export type GetAccountDataResult = {
  account: Account | null;
  triple: TripleWithPositions | null;
  isContract: boolean;
  nickname: string | null;
  classification: AddressClassification;
  alternateTrustData: AlternateTrustData;
};

/**
 * Classifies an address as EOA, contract, or unknown.
 * Tracks certainty level so we can handle uncertain cases appropriately.
 */
const classifyAddress = async (
  destinationAddress: string,
  transactionData: string,
  chainId: ChainId,
  configChainId: number,
): Promise<AddressClassification> => {
  // If transaction has data, it's definitely a contract interaction
  if (transactionData !== '0x') {
    return { type: 'contract', certainty: 'definite' };
  }

  // Transaction data is empty, but could still be a contract receiving tokens
  // Need to check eth_getCode
  try {
    // Switch chain if needed (only if different)
    const txChainId = chainId.split(':')[1];
    if (txChainId !== configChainId.toString()) {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        });
      } catch (switchErr) {
        console.error('chain switch failed', JSON.stringify(switchErr));
        return { type: 'unknown', certainty: 'uncertain', reason: 'chain_switch_failed' };
      }
    }

    // Get code to determine if it's a contract
    const codeResponse = await ethereum.request({
      method: 'eth_getCode',
      params: [destinationAddress, 'latest'],
    });

    console.log('codeResponse', codeResponse);

    if (codeResponse === '0x' || codeResponse === null) {
      return { type: 'eoa', certainty: 'definite' };
    } else {
      return { type: 'contract', certainty: 'definite' };
    }
  } catch (err) {
    console.error('eth_getCode error', JSON.stringify(err));
    return { type: 'unknown', certainty: 'uncertain', reason: 'eth_getCode_failed' };
  }
};

/**
 * Calculates the total market cap of a trust triple (support + counter).
 * Returns 0n if triple is null or has no vault data.
 */
const getTrustMarketCap = (triple: TripleWithPositions | null): bigint => {
  if (!triple) return 0n;
  const supportCap = BigInt(triple.term?.vaults?.[0]?.market_cap ?? '0');
  const counterCap = BigInt(triple.counter_term?.vaults?.[0]?.market_cap ?? '0');
  return supportCap + counterCap;
};

/**
 * Selects the primary atom based on classification and trust signal.
 * For uncertain classifications, uses whichever format has higher trust stake.
 */
const selectPrimaryAtom = (
  classification: AddressClassification,
  plainAtom: Account | null,
  caipAtom: Account | null,
  plainTrustTriple: TripleWithPositions | null,
  caipTrustTriple: TripleWithPositions | null,
): {
  primary: Account | null;
  primaryTriple: TripleWithPositions | null;
  alternate: Account | null;
  alternateTriple: TripleWithPositions | null;
  usedCaip: boolean;
} => {
  // Neither exists
  if (!caipAtom && !plainAtom) {
    return {
      primary: null,
      primaryTriple: null,
      alternate: null,
      alternateTriple: null,
      usedCaip: false,
    };
  }

  // Only one format exists
  if (!caipAtom) {
    return {
      primary: plainAtom,
      primaryTriple: plainTrustTriple,
      alternate: null,
      alternateTriple: null,
      usedCaip: false,
    };
  }
  if (!plainAtom) {
    return {
      primary: caipAtom,
      primaryTriple: caipTrustTriple,
      alternate: null,
      alternateTriple: null,
      usedCaip: true,
    };
  }

  // Both exist - selection depends on classification
  if (classification.certainty === 'definite') {
    if (classification.type === 'contract') {
      // Definite contract: use CAIP as primary
      return {
        primary: caipAtom,
        primaryTriple: caipTrustTriple,
        alternate: plainAtom,
        alternateTriple: plainTrustTriple,
        usedCaip: true,
      };
    } else {
      // Definite EOA: use plain as primary
      return {
        primary: plainAtom,
        primaryTriple: plainTrustTriple,
        alternate: caipAtom,
        alternateTriple: caipTrustTriple,
        usedCaip: false,
      };
    }
  }

  // Uncertain classification: compare trust signal, use higher market cap
  const caipMarketCap = getTrustMarketCap(caipTrustTriple);
  const plainMarketCap = getTrustMarketCap(plainTrustTriple);

  console.log('Uncertain classification - comparing market caps:', {
    caipMarketCap: caipMarketCap.toString(),
    plainMarketCap: plainMarketCap.toString(),
  });

  if (caipMarketCap >= plainMarketCap) {
    return {
      primary: caipAtom,
      primaryTriple: caipTrustTriple,
      alternate: plainAtom,
      alternateTriple: plainTrustTriple,
      usedCaip: true,
    };
  } else {
    return {
      primary: plainAtom,
      primaryTriple: plainTrustTriple,
      alternate: caipAtom,
      alternateTriple: caipTrustTriple,
      usedCaip: false,
    };
  }
};

export const getAccountData = async (
  transaction: Transaction,
  chainId: ChainId,
): Promise<GetAccountDataResult> => {
  const { to: destinationAddress, data: transactionData } = transaction;
  const { chainId: configChainId } = chainConfig;
  const caipAddress = addressToCaip10(destinationAddress, chainId);

  // Step 1: Classify the address with certainty tracking
  const classification = await classifyAddress(
    destinationAddress,
    transactionData,
    chainId,
    configChainId,
  );

  console.log('Address classification:', classification);

  // Derive isContract from classification (for backwards compatibility)
  const isContract =
    classification.type === 'contract' ||
    (classification.certainty === 'uncertain'); // Default to contract when uncertain

  // Step 2: Query both atom formats
  try {
    const [atomsResponse] = await Promise.all([
      graphQLQuery(getAddressAtomsQuery, {
        plainAddress: destinationAddress,
        caipAddress: caipAddress,
      }),
    ]);
    const { plainAtoms, caipAtoms } = atomsResponse.data;
    const plainAtom = plainAtoms?.[0] as Account | undefined;
    const caipAtom = caipAtoms?.[0] as Account | undefined;

    console.log('Atoms found:', {
      plainAtom: plainAtom?.term_id,
      caipAtom: caipAtom?.term_id,
    });

    // If neither atom exists, return early
    if (!plainAtom && !caipAtom) {
      return {
        account: null,
        triple: null,
        isContract,
        nickname: null,
        classification,
        alternateTrustData: { hasAlternateTrustData: false },
      };
    }

    // Step 3: Query trust triples for BOTH atom formats (if they exist)
    const { hasCharacteristicAtomId, trustworthyAtomId, relatedNicknamesAtomId } =
      chainConfig as ChainConfig;

    // Build parallel queries for trust data
    const trustQueries: Promise<any>[] = [];
    const queryKeys: ('plain' | 'caip')[] = [];

    if (plainAtom) {
      trustQueries.push(
        graphQLQuery(getTripleWithPositionsDataQuery, {
          subjectId: plainAtom.term_id,
          predicateId: hasCharacteristicAtomId,
          objectId: trustworthyAtomId,
        }),
      );
      queryKeys.push('plain');
    }

    if (caipAtom) {
      trustQueries.push(
        graphQLQuery(getTripleWithPositionsDataQuery, {
          subjectId: caipAtom.term_id,
          predicateId: hasCharacteristicAtomId,
          objectId: trustworthyAtomId,
        }),
      );
      queryKeys.push('caip');
    }

    const trustResponses = await Promise.all(trustQueries);

    // Map responses back to their keys
    const trustResults: { plain?: TripleWithPositions; caip?: TripleWithPositions } = {};
    queryKeys.forEach((key, idx) => {
      trustResults[key] = trustResponses[idx].data.triples[0] || null;
    });

    console.log('Trust triples found:', {
      plain: trustResults.plain?.term_id,
      caip: trustResults.caip?.term_id,
    });

    // Step 4: Select primary atom based on classification and trust signal
    const selection = selectPrimaryAtom(
      classification,
      plainAtom || null,
      caipAtom || null,
      trustResults.plain || null,
      trustResults.caip || null,
    );

    // Step 5: Check if alternate has significant trust data
    const alternateMarketCap = getTrustMarketCap(selection.alternateTriple);
    const alternateTrustData: AlternateTrustData = {
      hasAlternateTrustData: alternateMarketCap > 0n,
      alternateAtomId: selection.alternate?.term_id,
      alternateMarketCap: alternateMarketCap.toString(),
      alternateIsCaip: !selection.usedCaip, // If we used CAIP, alternate is plain (and vice versa)
    };

    console.log('Alternate trust data:', alternateTrustData);

    // Step 6: Query nickname for the primary atom
    let nickname: string | null = null;
    if (selection.primary) {
      const nicknameResponse = await graphQLQuery(getListWithHighestStakeQuery, {
        subjectId: selection.primary.term_id,
        predicateId: relatedNicknamesAtomId,
      });
      const nicknameTriple = nicknameResponse.data.triples[0];
      nickname = nicknameTriple?.object?.label || null;
    }

    return {
      account: selection.primary,
      triple: selection.primaryTriple,
      isContract,
      nickname,
      classification,
      alternateTrustData,
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

/**
 * Helper to get a human-readable description of the address classification.
 * Used for UI display and logging.
 */
export const getClassificationLabel = (
  classification: AddressClassification,
): string => {
  if (classification.certainty === 'definite') {
    return classification.type === 'contract' ? 'Smart Contract' : 'EOA';
  }
  return 'Unknown (classification uncertain)';
};

export const renderOnTransaction = (props: AccountProps) => {
  const { accountType } = props;
  // TypeScript now knows the exact prop shape for each accountType
  const initialUI = AccountComponents[accountType](props as any);
  return initialUI;
};
