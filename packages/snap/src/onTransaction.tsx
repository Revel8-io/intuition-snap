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
}: {
  transaction: Transaction;
  chainId: ChainId;
}) => {
  // MetaMask addresses come in as 0x______
  const { to: address } = transaction;

  const accountData = await getAccountData(address, chainId);
  const accountType = getAccountType(accountData);

  // Create properly typed props based on account type
  const props: AccountProps = {
    ...accountData,
    accountType,
    address,
    chainId,
  } as AccountProps; // Type assertion needed due to the discriminated union

  const initialUI = renderOnTransaction(props);

  // Remove initialUI from context to fix serialization issue
  const context: OnTransactionContext = {
    ...accountData,
    address,
    chainId,
    accountType,
  };

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
