import type {
  ChainId,
  EIP1559Transaction,
  LegacyTransaction,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';

import {
  getAccountData,
  getAccountType,
  setSnapState,
  renderOnTransaction,
} from './account';
import { Account, TripleWithPositions } from './types';

export type NavigationContext = {
  address: string;
  chainId: string;
  initialUI: string | null;
};

export type OnTransactionContext = {
  address: string;
  chainId: `0x${string}`;
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
  transaction: EIP1559Transaction | LegacyTransaction;
  chainId: ChainId;
}) => {
  // MetaMask addresses come in as 0x______
  let { to: address } = transaction;
  address = '0x0000000000000000500000000000000000000000';
  console.log('onTransaction chainId', chainId);

  const accountData = await getAccountData(address, chainId);
  const accountType = getAccountType(accountData);

  const initialUI = renderOnTransaction({
    ...accountData,
    accountType,
    address,
    chainId,
  });
  const context: NavigationContext = {
    address,
    chainId,
    initialUI,
    accountType,
    ...accountData,
  };
  setSnapState(context);
  console.log('onTransaction context', context);
  const interfaceId = await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: initialUI,
      context,
    },
  });
  console.log('onTransaction interfaceId', interfaceId);
  return {
    id: interfaceId,
  };
};
