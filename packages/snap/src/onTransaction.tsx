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
} from './account';
import { VENDORS } from './vendors';
import { Account, TripleWithPositions } from './types';
import { Box, Button, Text } from '@metamask/snaps-sdk/jsx';
import { ctas } from './ctas';

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
  const { to } = transaction;
  console.log('onTransaction chainId', chainId);

  const accountData = await getAccountData(to, chainId);
  const accountType = getAccountType(accountData);

  const { account, triple, isContract, nickname } =
    accountData as GetAccountDataResult;
  let initialUI = null;
  switch (accountType) {
    case Type.NoAccount:
    case Type.AccountNoAtom:
      console.log('onTransaction AccountType.NoAccount', accountData);
      initialUI = renderNoAccount(to, chainId);
      break;
    case Type.AccountAtomNoTrustData:
      console.log(
        'onTransaction AccountType.AccountAtomNoTrustData',
        accountData,
      );
      initialUI = (
        <RenderAccountAtomNoTrustData {...accountData} chainId={chainId} />
      );
      break;
    case Type.AccountAtomTrustData:
      console.log(
        'onTransaction AccountType.AccountAtomTrustData',
        accountData,
      );
      initialUI = renderAccountAtomTrustData(triple, accountData);
      break;
    default:
      initialUI = null;
  }
  const context: NavigationContext = {
    address: to,
    chainId,
    initialUI,
    ...accountData,
  };
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

export const onUserInput: OnUserInputHandler = async (
  props: OnUserInputProps,
) => {
  // Handle your specific "Rate account" button
  if (!props.event.name) return;
  console.log('Rate account button clicked!');
  const [type, method] = props.event.name.split('_');
  console.log('onUserInput type', type, 'method', method);
  const renderFn = ctas[type]?.[method];

  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id: props.id,
      ui: renderFn(props),
    },
  });
};
