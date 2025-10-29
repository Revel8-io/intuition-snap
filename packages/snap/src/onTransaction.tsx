import type {
  ChainId,
  OnTransactionHandler,
  Transaction,
} from '@metamask/snaps-sdk';

import { getAccountData, getAccountType, getOriginData, renderOnTransaction } from './account';
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
  // MetaMask addresses come in as 0x______
  const { to: address } = transaction;

  // Execute both queries in parallel for performance
  const [accountData, originData] = await Promise.all([
    getAccountData(address, chainId),
    getOriginData(transactionOrigin, chainId),
  ]);

  const accountType = getAccountType(accountData);

  // Create properly typed props based on account type
  const props: AccountProps = {
    ...accountData,
    accountType,
    address,
    chainId,
    originData,
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
