import { OnRpcRequestHandler, getImageComponent, getImageData, OnTransactionHandler } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Heading, Image, Link } from '@metamask/snaps-sdk/jsx';
import type { OnHomePageHandler } from "@metamask/snaps-sdk";
import { AtomResponse, AccountResponse } from "./types";
import { formatEther } from 'viem';
/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  const Comp = await getImageComponent("https://i7n.app/?f=png", {
    width: 400,
  })

  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Text>
                Hello, <Bold>{origin}</Bold>!
              </Text>
              <Text>
                This custom confirmation is just for display purposes.
              </Text>
              <Image
                src={Comp.value}
                alt="A random image"
              />

              <Text>
                But you can edit the snap source code to make it do something,
                if you want to!
              </Text>
            </Box>
          ),
        },
      });
    default:
      throw new Error('Method not found.');
  }
};


const getAccountData = async (acc: string) => {

  const result: {
    account: string,
    data?: AccountResponse,
    atom?: AtomResponse
    image?: string
  } = {
    account: acc,
  }

  try {
    const res = await fetch("https://i7n.app/acc/" + acc + "/json")

    if (res.ok) {
      result.data = await res.json() as AccountResponse;
      if (result.data?.account?.atomId) {
        try {
          const atomRes = await fetch("https://i7n.app/a/" + result.data.account.atomId + "/json")
          if (atomRes.ok) {
            result.atom = await atomRes.json() as AtomResponse;
            result.image = (await getImageComponent("https://i7n.app/a/" + result.data.account.atomId + "/png", {
              width: 200,
              height: 100,
            })).value;

          }
        } catch (e) {
          console.error(e);
        }
      }

    }
  } catch (e) {
    console.error(e);
  }

  return result;
}

export const renderAccounts = async (i7nAccountsData: {
  account: string;
  data?: AccountResponse;
  atom?: AtomResponse;
  image?: string;
}[]) => {
  return (<Box>
    {i7nAccountsData.map((acc) => {
      const usd = acc.data?.prices?.usd ? acc.data?.prices?.usd : 1;

      const positions = acc.data?.positions ? acc.data?.positions?.map((position) => {
        return (
          <Box direction='horizontal' alignment='space-between'>
            <Text>{position.atom?.label || position.triple?.label || ''}</Text>
            <Text>${(parseFloat(formatEther(position.shares))
              * parseFloat(formatEther(position.vault.currentSharePrice!))
              * usd).toFixed(2)}</Text>
          </Box>
        )
      }) : (<Text>No positions</Text>);

      const triples = acc.atom?.triples ? acc.atom?.triples?.map((triple) => {
        return (
          <Box direction='horizontal' alignment='space-between'>
            <Text>{triple.label}</Text>
            <Text>${(parseFloat(formatEther(triple.vault.totalShares))
              * parseFloat(formatEther(triple.vault.currentSharePrice!))
              * usd).toFixed(2)}</Text>
          </Box>
        )
      }) : (<Text>No triples</Text>);

      return (
        <Box>
          {acc.image !== undefined && (
            <Image
              src={acc.image}
              alt="Account"
            />
          )}
          <Box direction='horizontal' alignment='space-between'>
            <Link href={"https://i7n.app/acc/" + acc.account}>
              Account
            </Link>
            {acc.data?.account?.atomId !== undefined && <Link href={"https://i7n.app/a/" + acc.data.account.atomId}>
              Atom
            </Link>}
          </Box>
          <Heading>Active positions</Heading>
          <Box>
            {positions}
          </Box>

          <Heading>Mentioned in</Heading>
          <Box>
            {triples}
          </Box>

        </Box>
      )
    })}
  </Box>)
}

export const onHomePage: OnHomePageHandler = async () => {
  const accounts = await ethereum.request<string[]>({
    method: 'eth_requestAccounts',
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

  const i7nAccounts = accounts.map(acc => getAccountData(acc || ''));
  const i7nAccountsData = await Promise.all(i7nAccounts);

  return {
    content: await renderAccounts(i7nAccountsData)
  };
};


export const onTransaction: OnTransactionHandler = async ({
  transaction,
}) => {
  const i7nAccounts = [transaction.to].map(acc => getAccountData(acc || ''));
  const i7nAccountsData = await Promise.all(i7nAccounts);
  return {
    content: await renderAccounts(i7nAccountsData),
  };
};
