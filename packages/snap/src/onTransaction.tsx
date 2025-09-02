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

export type NavigationContext = {
  address: string;
  chainId: string;
  initialUI: string | null;
};

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}: {
  transaction: EIP1559Transaction | LegacyTransaction;
  chainId: ChainId;
}) => {
  // MetaMask addresses come in as 0x______
  let { to } = transaction;
  // to = '0x0000000000000000400000000000000000000000';
  console.log('onTransaction chainId', chainId);

  const accountData = await getAccountData(to, chainId);
  const accountType = getAccountType(accountData);

  const initialUI = renderOnTransaction({
    ...accountData,
    accountType,
    to,
    chainId,
  });
  const context: NavigationContext = {
    address: to,
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
