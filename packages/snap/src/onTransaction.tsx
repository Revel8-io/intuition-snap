import type {
  ChainId,
  OnTransactionHandler,
  Transaction,
  Json,
} from '@metamask/snaps-sdk';
import { Box } from '@metamask/snaps-sdk/jsx';

import { getAccountData, getAccountType, renderOnTransaction } from './account';
import { getOriginData, getOriginType, renderOriginInsight } from './origin';
import {
  AccountType,
  AccountProps,
  OriginType,
  OriginProps,
} from './types';
import { UnifiedFooter } from './components';

/** Combined context for both account and origin data */
type TransactionContext = {
  account: AccountProps;
  origin: OriginProps;
};

/**
 * Converts props to a JSON-serializable context object.
 * MetaMask Snap context must be Record<string, Json> which doesn't allow undefined.
 * This function converts undefined values to null for JSON compatibility.
 */
const toSerializableContext = (context: TransactionContext): Record<string, Json> => {
  // JSON.parse(JSON.stringify()) handles the conversion cleanly:
  // - undefined values are stripped from objects
  // - null remains null
  // - All other values are preserved
  return JSON.parse(JSON.stringify(context)) as Record<string, Json>;
};

export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
  transactionOrigin,
}: {
  transaction: Transaction;
  chainId: ChainId;
  transactionOrigin?: string;
}) => {
  // Get user's connected wallet address *for position checking*
  // Note: This is optional - if it fails, we continue without position checking
  let userAddress: string | undefined;
  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[];
    userAddress = accounts?.[0];
  } catch (_err) {
    // eth_accounts failure is non-critical - Snap can function without userAddress
    // The UI will render without position-specific features (e.g., stake prompt)
    // Silently continue with userAddress = undefined
    // Error could be: DisconnectedError, ChainDisconnectedError, or InternalError
    // but since this is optional data, we don't need to surface it to the user
  }

  // Execute queries in parallel for performance
  // Fetch both account (destination) and origin (dApp) data simultaneously
  const [accountData, originData] = await Promise.all([
    getAccountData(transaction, chainId),
    getOriginData(transactionOrigin),
  ]);

  const accountType = getAccountType(accountData);
  const originType = getOriginType(originData, transactionOrigin);

  // Create properly typed props based on account type
  const accountProps: AccountProps = {
    ...accountData,
    accountType,
    address: transaction.to,
    userAddress,
    chainId,
    transactionOrigin,
  } as AccountProps; // Type assertion needed due to the discriminated union

  // Create origin props
  const originProps: OriginProps = {
    ...originData,
    originType,
    originUrl: transactionOrigin,
  } as OriginProps; // Type assertion needed due to the discriminated union

  // Render both account and origin insights (information sections only)
  const accountUI = renderOnTransaction(accountProps);
  const originUI = renderOriginInsight(originProps);

  // Render unified footer with all CTAs at the bottom
  const footerUI = (
    <UnifiedFooter accountProps={accountProps} originProps={originProps} />
  );

  // Combine into final UI: info sections first, then all CTAs at bottom
  const initialUI = (
    <Box>
      {accountUI}
      {originUI}
      {footerUI}
    </Box>
  );

  // Convert props to JSON-serializable context (strips undefined values)
  const context = toSerializableContext({
    account: accountProps,
    origin: originProps,
  });

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
