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
  renderAccountAtomNoTrustData,
  renderAccountAtomTriple,
  type GetAccountDataResult,
} from './account';
import { Account, TripleWithPositions } from './types';

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}: {
  transaction: EIP1559Transaction | LegacyTransaction;
  chainId: ChainId;
}) => {
  const { to } = transaction;
  // MetaMask addresses come in as 0x______
  const accountData = await getAccountData(to, chainId);
  const accountType = getAccountType(accountData);

  const { account, triple } = accountData as GetAccountDataResult;
  switch (accountType) {
    case AccountType.NoAccount:
    case AccountType.AccountNoAtom:
      console.log('onTransaction AccountType.NoAccount', accountData);
      return { content: renderNoAccount(to, chainId) };
    case AccountType.AccountAtomNoTrustData:
      console.log(
        'onTransaction AccountType.AccountAtomNoTrustData',
        accountData,
      );
      return {
        content: renderAccountAtomNoTrustData(account as Account, chainId),
      };
    case AccountType.AccountAtomTrustData:
      return {
        content: renderAccountAtomTriple(
          triple as TripleWithPositions,
          accountData,
        ),
      };
    default:
      return null;
  }
};
