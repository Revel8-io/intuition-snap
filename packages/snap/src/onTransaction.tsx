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
  renderAccountAtomNoTriple,
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
  const { to, from } = transaction;
  // MetaMask addresses come in as 0x______
  const accountData = await getAccountData(to, from, chainId);
  const accountType = getAccountType(accountData);

  const { account, triple } = accountData as GetAccountDataResult;
  switch (accountType) {
    case AccountType.NoAccount:
    case AccountType.AccountNoAtom:
      return { content: renderNoAccount(to, chainId) };
    case AccountType.AccountAtomNoTriple:
      return {
        content: renderAccountAtomNoTriple(account as Account, chainId),
      };
    case AccountType.AccountAtomTriple:
      return {
        content: renderAccountAtomTriple(triple as TripleWithPositions),
      };
    default:
      return null;
  }
};
