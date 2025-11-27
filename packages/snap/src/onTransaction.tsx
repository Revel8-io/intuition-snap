import type {
  ChainId,
  OnTransactionHandler,
  Transaction,
} from '@metamask/snaps-sdk';

import { getAccountData, getAccountType, renderOnTransaction } from './account';
import {
  Account,
  TripleWithPositions,
  AccountType,
  AccountProps,
} from './types';

export type OnTransactionContext = {
  address: string;
  chainId: ChainId;
  account: Account | null;
  triple: TripleWithPositions | null;
  nickname: string | null;
  isContract: boolean;
  accountType: AccountType;
};

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}: {
  transaction: Transaction;
  chainId: ChainId;
  transactionOrigin?: string;
}) => {
  console.log('onTransaction', JSON.stringify({ transaction, chainId, transactionOrigin }, null, 2));

  // Get user's connected wallet address for position checking
  let userAddress: string | undefined;
  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
    userAddress = accounts?.[0];
  } catch (err) {
    console.error('Failed to get user accounts', err);
  }

  // Execute both queries in parallel for performance
  const [accountData,] = await Promise.all([
    getAccountData(transaction, chainId),
    // add more here
  ]);

  const accountType = getAccountType(accountData);

  // Create properly typed props based on account type
  const props: AccountProps = {
    ...accountData,
    accountType,
    address: transaction.to,
    userAddress,
    chainId,
    transactionOrigin,
  } as AccountProps; // Type assertion needed due to the discriminated union

  const initialUI = renderOnTransaction(props);

  // Use full props as context to preserve origin data
  const context = props;

  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: initialUI,
      context,
    },
  });
  return {
    id: interfaceId,
  };
};
