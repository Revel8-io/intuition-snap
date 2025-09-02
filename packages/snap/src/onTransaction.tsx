import type {
  ChainId,
  EIP1559Transaction,
  LegacyTransaction,
  OnTransactionHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';

import {
  getAccountData,
  getAccountType,
  AccountType as Type,
  renderNoAccount,
  renderAccountAtomNoTrustData,
  renderAccountAtomTrustData,
  type GetAccountDataResult,
  setSnapState,
  RenderAccountAtomNoTrustData,
  renderOnTransaction,
} from './account';
import { VENDORS } from './vendors';
import { Account, TripleWithPositions } from './types';
import { Box, Button, Text } from '@metamask/snaps-sdk/jsx';
import { rate } from './cta';
import { AccountComponents as account } from './account';

type NavigationContext = {
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
  to = '0x0000000000000000400000000000000000000000';
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

type OnUserInputProps = {
  event: {
    name: string;
  };
  context: NavigationContext;
  id: string;
};

const components = {
  account,
  rate,
};

export const onUserInput: OnUserInputHandler = async (
  props: OnUserInputProps,
) => {
  // Handle your specific "Rate account" button
  if (!props.event.name) return;
  console.log('Rate account button clicked! props.context', props.context);
  const [type, method] = props.event.name.split('_');
  console.log('onUserInput type', type, 'method', method);
  const renderFn = components[type]?.[method];

  const params = { ...props, context: props.context };
  console.log('onUserInput params', params);
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id: props.id,
      ui: renderFn(params),
    },
  });
};
