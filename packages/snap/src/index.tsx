import { OnRpcRequestHandler, getImageComponent, getImageData, OnTransactionHandler } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Heading, Image, Link } from '@metamask/snaps-sdk/jsx';
import type { OnHomePageHandler } from "@metamask/snaps-sdk";
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
    data?: any,
    image?: string
  } = {
    account: acc,
  }

  try {
    const res = await fetch('https://api.i7n.app/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
query Account($address: String!) {
  account(id: $address) {
    atom {
      id
      label
      image
      followers: asObject(where: {subjectId: {_eq: 11}, predicateId: {_eq: 3}}) {
        id
        label
        vault {
          positionCount
        }
      }
      asSubject(
        where: {vault: {positionCount: {_gt: 0}}}
        order_by: {vault: {positionCount: desc}}
      ) {
        object {
          label
        }
        predicate {
          id
          label
          emoji
        }
        vault {
          positionCount
        }
      }
    }
  }
  following_aggregate(args: { address: $address }) {
    aggregate {
      count
    }
  }
}
      `,
        variables: {
          address: acc,
        },
      }),
    })
    const json = await res.json();
    result.data = json.data;
    if (json.data?.account?.atom?.image) {
      result.image = (await getImageComponent(json.data?.account?.atom?.image, {
        width: 50,
        height: 50,
      })).value
    }

  } catch (e) {
    console.error(e);
  }
  return result;
}


export const renderAccounts = async (i7nAccountsData: {
  account: string;
  data?: any;
  image?: string;
}[]) => {
  return (<Box>
    {i7nAccountsData.map((acc) => {

      const triples = acc.data.account.atom.asSubject.map((triple: any) => {
        return (
          <Box direction='horizontal' alignment='space-between'>
            <Text>{triple.predicate.id === '4' ? triple.predicate.emoji : triple.predicate.label} {triple.object.label}</Text>
            <Text>{triple.vault?.positionCount.toString()}</Text>
          </Box>
        )
      });

      return (
        <Box>
          <Box direction='horizontal' alignment='space-between'>
            {acc.image !== undefined && (
              <Image
                src={acc.image}
                alt="Account"
              />
            )}
            <Heading>{acc.data?.account?.atom?.label}</Heading>
          </Box>

          <Box direction='horizontal' alignment='space-between'>
            <Text>Following: {acc.data.following_aggregate?.aggregate?.count?.toString()}</Text>
            <Link href={"https://i7n.app/acc/" + acc.account}>
              Account
            </Link>
          </Box>
          <Box direction='horizontal' alignment='space-between'>

            <Text>Followers: {acc.data?.account?.atom?.followers[0]?.vault?.positionCount.toString()}</Text>
            {acc.data?.account.atom?.id !== undefined && <Link href={"https://i7n.app/a/" + acc.data?.account.atom?.id}>
              Atom
            </Link>}

          </Box>
          {acc.data.account.atom.asSubject.length > 0 && <Heading>Claims</Heading>}
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
