import { getImageComponent, OnTransactionHandler } from '@metamask/snaps-sdk';
import { Box, Text, Heading, Link, Section, Card } from '@metamask/snaps-sdk/jsx';
import type { OnHomePageHandler } from "@metamask/snaps-sdk";
import { getAccountQuery, getClaimsFromFollowingQuery, searchAtomsQuery } from "./queries";

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

const getAccountData = async (acc: string, from: string | null, chainId: string) => {
  const result: {
    account: string,
    atom?: any,
    image?: string
    claims: any
    followingCount?: string
    chainId?: string
  } = {
    account: acc,
    claims: [],
    chainId: chainId,
  }

  try {
    const res = await fetch('https://api.i7n.app/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getAccountQuery,
        variables: {
          address: acc,
        },
      }),
    })
    const json = await res.json();
    result.atom = json.data?.account?.atom;
    if (result.atom === undefined) {
      const res = await fetch('https://api.i7n.app/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchAtomsQuery,
          variables: {
            uri: `caip10:${chainId}:${acc.toLowerCase()}`,
          },
        }),
      });
      const resJson = await res.json();
      if (resJson.data?.atoms?.length > 0) {
        result.atom = resJson.data.atoms[0];
      }

    }
    result.followingCount = json.data.following_aggregate?.aggregate?.count?.toString();
    if (result.atom?.image) {
      result.image = (await getImageComponent(result.atom?.image, {
        width: 50,
        height: 50,
      })).value
    }
    if (from !== undefined && from !== null && result.atom?.id !== undefined) {
      const res2 = await fetch('https://api.i7n.app/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: getClaimsFromFollowingQuery,
          variables: {
            address: from.toLowerCase(),
            subjectId: result.atom?.id,
          },
        }),
      })
      const json2 = await res2.json();
      result.claims = json2.data?.claims_from_following || [];
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
  chainId?: string;
}[]) => {
  return (<Box>
    {i7nAccountsData.map((acc) => {

      const globalTriples = acc.atom?.asSubject?.map((triple: any) => {
        const emoji = triple.predicate.id === '4' ? triple.predicate.emoji : '🗣️';

        return (
          <Card
            title={`${emoji} ${triple.predicate.id === '4' ? '' : triple.predicate.label} ${triple.object.label}`}
            value={triple.vault?.positionCount.toString()}
          />

        )
      });

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

          {acc.atom?.type !== 'Unknown' && (<Box>
            <Card
              title={acc.atom.label}
              description={`did:i7n:8543:${acc.atom.id}`}
              image={acc.image}
              value={''}
            />
            <Box direction='horizontal' alignment='space-between'>
              <Text>Following: {acc.followingCount || ''}</Text>
              <Link href={"https://i7n.app/acc/" + acc.account}>
                Account
              </Link>
            </Box>
            <Box direction='horizontal' alignment='space-between'>
              {acc.atom?.followers.length > 0 && <Text>Followers: {acc.atom?.followers[0]?.vault?.positionCount.toString()}</Text>}
              {acc.atom?.id !== undefined && <Link href={"https://i7n.app/a/" + acc.atom?.id}>
                Atom
              </Link>}
            </Box></Box>)}

          {acc.claims !== undefined && acc.claims?.length > 0 && <Heading>From Accounts You’re Following</Heading>}
          <Section>
            {followingTriples}
          </Section>

          {acc.atom.asSubject?.length > 0 && <Heading>From everyone</Heading>}
          <Section>
            {globalTriples}
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

  // get chain id

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
  // const i7nAccounts = [transaction.to, transaction.from].map((to, from) => getAccountData(to || '', from));
  const i7nAccounts = [getAccountData(transaction.to, transaction.from, chainId)]
  const i7nAccountsData = await Promise.all(i7nAccounts);
  return {
    content: await renderAccounts(i7nAccountsData),
  };
};
