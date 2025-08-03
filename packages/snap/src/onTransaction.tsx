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
  renderAccountNoAtom,
  renderAccountAtomNoTriple,
  renderAccountAtomTriple,
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

  const { account, triple, isContract } = accountData;
  switch (accountType) {
    case AccountType.NoAccount:
      console.log('AccountType.NoAccount', to, chainId);
      return {
        content: renderNoAccount(to, chainId),
      };
    case AccountType.AccountNoAtom:
      console.log('AccountType.AccountNoAtom', to, chainId);
      return {
        // same as renderNoAccount
        content: renderAccountNoAtom(to, chainId),
      };
    case AccountType.AccountAtomNoTriple:
      console.log('AccountType.AccountAtomNoTriple', to, chainId);
      return {
        content: renderAccountAtomNoTriple(account, chainId),
      };
    case AccountType.AccountAtomTriple:
      return {
        content: renderAccountAtomTriple(account, triple, isContract, chainId),
      };
    default:
      return null;
  }
  // return {
  //   content: await renderAccounts(i7nAccountsData),
  // };
};
