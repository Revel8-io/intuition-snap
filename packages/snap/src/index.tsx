import { OnTransactionHandler } from '@metamask/snaps-sdk';
import { Box, Text, Heading } from '@metamask/snaps-sdk/jsx';
import type { OnHomePageHandler } from "@metamask/snaps-sdk";
import { getAccountData, renderAccounts } from './account';


export const onHomePage: OnHomePageHandler = async () => {
  const accounts = await ethereum.request<string[]>({
    method: 'eth_requestAccounts',
  });

  const chainId = await ethereum.request<string>({
    method: 'eth_chainId',
  });

  if (!accounts || accounts.length === 0) {
    return {
      content: (
        <Box>
          <Heading>Connect your wallet</Heading>
          <Text>
            To use this snap, connect your wallet to MetaMask.
          </Text>
        </Box>
      ),
    };
  }

  const i7nAccounts = accounts.map(acc => getAccountData(acc || '', acc || '', chainId as string));
  const i7nAccountsData = await Promise.all(i7nAccounts);

  return {
    content: await renderAccounts(i7nAccountsData)
  };
};


export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,

}) => {
  const i7nAccounts = [getAccountData(transaction.to, transaction.from, chainId)]
  const i7nAccountsData = await Promise.all(i7nAccounts);
  return {
    content: await renderAccounts(i7nAccountsData),
  };
};
