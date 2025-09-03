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
import { Account, Identity, TripleWithPositions } from './types';

export type OnTransactionContext = {
  address: `0x${string}`;
  chainId: `epi155:${string}`;
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
  address = '0x0000000000000000600000000000000000000000';
  console.log('onTransaction chainId', chainId);

  const accountData = await getAccountData(address, chainId);
  const accountType = getAccountType(accountData);

  const initialUI = renderOnTransaction({
    ...accountData,
    accountType,
    address,
    chainId,
  });
  const context: Identity = {
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
