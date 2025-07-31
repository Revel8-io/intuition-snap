import type {
  ChainId,
  EIP1559Transaction,
  LegacyTransaction,
  OnTransactionHandler,
} from '@metamask/snaps-sdk';

import {
  getAccountData,
  getAccountType,
  AccountType,
  renderNoAccount,
} from './account';

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}: {
  transaction: EIP1559Transaction | LegacyTransaction;
  chainId: ChainId;
}) => {
  const { to, from } = transaction;
  // MetaMask addresses come in as 0x______
  const accountData = await getAccountData(to, from, chainId);
  console.log('accountData', accountData, chainId);
  const accountType = getAccountType(accountData);

  switch (accountType) {
    case AccountType.NoAccount:
      return {
        content: renderNoAccount(to, chainId),
      };
    default:
      return null;
  }
  // return {
  //   content: await renderAccounts(i7nAccountsData),
  // };
};
