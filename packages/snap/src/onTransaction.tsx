import type {
  ChainId,
  OnTransactionHandler,
  Transaction,
} from '@metamask/snaps-sdk';

import { getAccountData, getAccountType, renderOnTransaction } from './account';
import { Account, TripleWithPositions } from './types';

export type OnTransactionContext = {
  address: string;
  chainId: ChainId;
  account: Account;
  triple: TripleWithPositions | null;
  nickname: string;
  isContract: boolean;
  initialUI?: any;
};

export type OnTransactionProps = {
  context: OnTransactionContext;
  method: string;
};

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}: {
  transaction: Transaction;
  chainId: ChainId;
}) => {
  // MetaMask addresses come in as 0x______
  let { to: address } = transaction;
  address = '0x0000000000000000a00000000000000000000000';
  console.log('onTransaction chainId', chainId);

  const accountData = await getAccountData(address, chainId);
  const accountType = getAccountType(accountData);

  const initialUI = renderOnTransaction({
    ...accountData,
    accountType,
    address,
    chainId,
  });
  const context = {
    ...accountData,
    address,
    chainId,
    initialUI,
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
