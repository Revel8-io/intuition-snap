import { OnRpcRequestHandler, getImageComponent, getImageData, OnTransactionHandler } from '@metamask/snaps-sdk';
import { Box, Text, Bold, Heading, Image, Link, Button, Card, Section } from '@metamask/snaps-sdk/jsx';
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


const getAccountData = async (acc: string, from?: string | null) => {
  const result: {
    account: string,
    atom?: any,
    image?: string
    claims: any
    followingCount?: string
  } = {
    account: acc,
    claims: [],
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
    result.atom = json.data.account.atom;
    result.followingCount = json.data.following_aggregate?.aggregate?.count?.toString();
    if (result.atom?.image) {
      result.image = (await getImageComponent(result.atom?.image, {
        width: 50,
        height: 50,
      })).value
    }
    console.log('json', json);
    if (from !== undefined && from !== null && result.atom?.id !== undefined) {

      const res2 = await fetch('https://api.i7n.app/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
query ClaimsFromFollowingAboutSubject($address: String!, $subjectId: numeric!) {
  claims_from_following(
    args: { address: $address }
    where: { subjectId: { _eq: $subjectId } }
  ) {
    shares
    counterShares
    triple {
      id
      vaultId
      counterVaultId
      label
      subject {
        emoji
        label
        image
        id
      }
      predicate {
        emoji
        label
        image
        id
      }
      object {
        emoji
        label
        image
        id
      }
      counterVault {
        id
        positionCount
        totalShares
        currentSharePrice
        myPosition: positions(
          limit: 1
          where: { accountId: { _eq: $address } }
        ) {
          shares
          accountId
        }
      }
      vault {
        id
        positionCount
        totalShares
        currentSharePrice
        myPosition: positions(
          limit: 1
          where: { accountId: { _eq: $address } }
        ) {
          shares
          accountId
        }
      }
    }
    account {
      id
      label
    }
  }
}
      `,
          variables: {
            address: from.toLowerCase(),
            subjectId: json.data?.account?.atom?.id,
          },
        }),
      })
      const json2 = await res2.json();
      result.claims = json2.data.claims_from_following;
    }

  } catch (e) {
    console.error(e);
  }
  return result;
}


export const renderAccounts = async (i7nAccountsData: {
  account: string;
  atom?: any;
  image?: string;
  claims: any[];
  followingCount?: string;
}[]) => {
  return (<Box>
    {i7nAccountsData.map((acc) => {

      const globalTriples = acc.atom.asSubject.map((triple: any) => {
        const emoji = triple.predicate.id === '4' ? triple.predicate.emoji : '🗣️';

        return (
          <Card
            title={`${emoji} ${triple.predicate.id === '4' ? '' : triple.predicate.label} ${triple.object.label}`}
            value={triple.vault?.positionCount.toString()}
          />

        )
      });

      type Triple = {
        id: string,
        vaultId: string,
        counterVaultId: string,
        label: string,
        subject: {
          emoji: string,
          label: string,
          image: string,
          id: string,
        },
        predicate: {
          emoji: string,
          label: string,
          image: string,
          id: string,
        },
        object: {
          emoji: string,
          label: string,
          image: string,
          id: string,
        },
      }

      const triples: Array<{
        triple: Triple,
        claimsForCount: number,
        claimsAgainstCount: number,
      }> = [];

      // Group claims by triple ID
      const tripleGroups = acc.claims.reduce((account: { [key: string]: any[] }, claim: any) => {
        const tripleId = claim.triple.id;
        if (!account[tripleId]) {
          account[tripleId] = [];
        }
        account[tripleId]?.push(claim);
        return account;
      }, {});

      // Process each unique triple
      Object.entries(tripleGroups).forEach(([tripleId, claims]) => {
        const claimsFor = claims.filter(claim => claim.shares > 0);
        const claimsAgainst = claims.filter(claim => claim.counterShares > 0);

        triples.push({
          triple: claims[0].triple,
          claimsForCount: claimsFor.length,
          claimsAgainstCount: claimsAgainst.length,
        });
      });
      // Sort triples by claims count
      triples.sort((a, b) => {
        return b.claimsForCount - a.claimsForCount;
      });

      const followingTriples = triples.map((t: any) => {
        const emoji = t.triple.predicate.id === '4' ? t.triple.predicate.emoji : '🗣️';

        return (

          <Card
            title={`${emoji} ${t.triple.predicate.id === '4' ? '' : t.triple.predicate.label} ${t.triple.object.label}`}
            value={t.claimsForCount.toString()}
          />
        )
      });
      /*
          {acc.data.account.atom.asSubject.length > 0 && <Heading>🌐 Global</Heading>}
          <Section>
            {globalTriples}
          </Section>
       */

      return (
        <Box>

          <Card
            title={acc.atom.label}
            description={`did:i7n:8543:${acc.atom.id}`}
            image={acc.image}
            value=''
          />

          <Box direction='horizontal' alignment='space-between'>
            <Text>Following: {acc.followingCount || ''}</Text>
            <Link href={"https://i7n.app/acc/" + acc.account}>
              Account
            </Link>
          </Box>
          <Box direction='horizontal' alignment='space-between'>

            <Text>Followers: {acc.atom?.followers[0]?.vault?.positionCount.toString()}</Text>
            {acc.atom?.id !== undefined && <Link href={"https://i7n.app/a/" + acc.atom?.id}>
              Atom
            </Link>}

          </Box>
          {acc.claims !== undefined && acc.claims?.length > 0 && <Heading>From Accounts You’re Following</Heading>}
          <Section>
            {followingTriples}
          </Section>


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

  const i7nAccounts = accounts.map(acc => getAccountData(acc || '', acc || ''));
  const i7nAccountsData = await Promise.all(i7nAccounts);

  return {
    content: await renderAccounts(i7nAccountsData)
  };
};


export const onTransaction: OnTransactionHandler = async ({
  transaction,
}) => {
  // const i7nAccounts = [transaction.to, transaction.from].map((to, from) => getAccountData(to || '', from));
  const i7nAccounts = [getAccountData(transaction.to, transaction.from)]
  const i7nAccountsData = await Promise.all(i7nAccounts);
  return {
    content: await renderAccounts(i7nAccountsData),
  };
};
