import { getAccountQuery, getClaimsFromFollowingQuery, searchAtomsQuery } from './queries'
import { backendUrl } from './config'
import { getImageComponent, OnTransactionHandler, type OnHomePageHandler } from '@metamask/snaps-sdk'
import { Box, Text, Heading, Link, Section, Card } from '@metamask/snaps-sdk/jsx';
import { getAddress } from 'viem';

export const getAccountData = async (acc: string, from: string | null, chainId: string) => {
  const result: {
    account: string,
    atom?: any,
    image?: string
    label?: string
    claims: any
    followingCount?: string
    chainId?: string
  } = {
    account: acc,
    claims: [],
    chainId: chainId,
  }

  try {
    const res = await fetch(backendUrl, {
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
    result.image = json.data?.account?.image;
    result.label = json.data?.account?.label;
    result.atom = json.data?.account?.atom;
    if (result.atom === undefined) {
      const address = getAddress(acc);
      result.account = `caip10:${chainId}:${address}`;
      console.log(result.account);
      console.log({ acc, address });
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchAtomsQuery,
          variables: {
            uri: result.account,
          },
        }),
      });
      const resJson = await res.json();
      if (resJson.data?.atoms?.length > 0) {
        result.atom = resJson.data.atoms[0];
      }

    }
    result.followingCount = json.data?.following_aggregate?.aggregate?.count?.toString();
    if (result.image) {
      result.image = (await getImageComponent(result.image, {
        width: 50,
        height: 50,
      })).value
    }
    if (from !== undefined && from !== null && result.atom?.id !== undefined) {
      const res2 = await fetch(backendUrl, {
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
  label?: string;
  claims: any[];
  followingCount?: string;
  chainId?: string;
}[]) => {
  return (<Box>
    {i7nAccountsData.map((acc) => {
      if (acc.atom === undefined) {
        return (
          <Box>
            <Text>
              No information about this on intuition, yet. {acc.account}
            </Text>
          </Box>
        )
      }

      const globalTriples = acc.atom?.as_subject_triples?.map((triple: any) => {
        const emoji = triple.predicate.id === '4' ? triple.predicate.emoji : '🗣️';

        return (
          <Card
            title={`${emoji} ${triple.predicate.id === '4' ? '' : triple.predicate.label} ${triple.object.label}`}
            value={triple.vault?.position_count.toString()}
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

          {acc.atom?.type !== 'Unknown' && acc.atom?.type !== 'Caip10' && (<Box>
            <Card
              title={acc.label || ''}
              image={acc.image}
              value={''}
            />
            <Box direction='horizontal' alignment='space-between'>
              <Text>Following: {acc.followingCount || ''}</Text>
              <Link href={"https://beta.portal.intuition.systems/app/profile/" + acc.account}>
                Account
              </Link>
            </Box>
            <Box direction='horizontal' alignment='space-between'>
              {acc.atom?.followers.length > 0 && <Text>Followers: {acc.atom?.followers[0]?.vault?.position_count.toString()}</Text>}
            </Box></Box>)}

          {acc.claims !== undefined && acc.claims?.length > 0 && <Heading>From Accounts You’re Following</Heading>}
          <Section>
            {followingTriples}
          </Section>

          {acc.atom !== undefined && acc.atom?.as_subject_triples?.length > 0 && <Heading>From everyone</Heading>}
          <Section>
            {globalTriples}
          </Section>

        </Box>
      )
    })}
  </Box>)
}

