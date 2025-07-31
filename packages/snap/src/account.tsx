import { getImageComponent } from '@metamask/snaps-sdk';
import {
  Box,
  Text,
  Heading,
  Link,
  Section,
  Card,
  Address,
} from '@metamask/snaps-sdk/jsx';
import axios from 'axios';
import { getAddress } from 'viem';

import { backendUrl } from './config';
import {
  getAccountQuery,
  getClaimsFromFollowingQuery,
  searchAtomsQuery,
} from './queries';
import { VENDORS } from './vendors';

type GetAccountDataOutput = {
  account: string;
  atom?: any;
  image?: string;
  label?: string;
  claims: any;
  followingCount?: string;
  chainId?: string;
  isContract?: boolean;
};

export const getAccountData = async (
  destinationAddress: string,
  fromAddress: string | null,
  chainId: string,
) => {
  console.log('getAccountData', destinationAddress, fromAddress, chainId);

  try {
    const accountPromise = axios.post(backendUrl, {
      query: getAccountQuery,
      variables: {
        address: destinationAddress,
      },
    });
    const codePromise = ethereum.request({
      method: 'eth_getCode',
      params: [destinationAddress, 'latest'],
    });
    const [accounResponse, accountType] = await Promise.all([
      accountPromise,
      codePromise,
    ]);
    console.log('accounResponse', JSON.stringify(accounResponse));
    console.log('accountType', accountType);
    const {
      data: {
        data: { account },
      },
    } = accounResponse;
    console.log('account', account);
    const isContract = accountType !== '0x';
    if (!account) {
      return { account: null, isContract };
    }
    // if (output.atom === undefined) {
    //   // if no atom controlled by account
    //   const address = getAddress(destinationAddress);
    //   output.account = `caip10:${chainId}:${address}`;
    //   const { data: searchAtomsData } = await axios.post(backendUrl, {
    //     query: searchAtomsQuery,
    //     variables: {
    //       uri: output.account,
    //     },
    //   });
    //   console.log('searchAtomsData', JSON.stringify(searchAtomsData));
    //   if (!searchAtomsData.data?.atoms?.length) {
    //     return output;
    //   }
    //   console.log('ATOM EXISTS FOR ADDRESS', destinationAddress);
    //   output.atom = searchAtomsData.data.atoms[0];
    // }
    return { account: null, isContract };
  } catch (e) {
    console.error('getAccountData error', JSON.stringify(e));
  }
};

export const renderAccounts = async (
  i7nAccountsData: {
    account: string;
    atom?: any;
    image?: string;
    label?: string;
    claims: any[];
    followingCount?: string;
    chainId?: string;
  }[],
) => {
  // check if account atom exists
  // if no account atom, display explorer link to create atom (and trust triple?)
  // if atom exists, but no trust triple, display explorer link to create trust triple
  // if atom exists and triple exists, display triple info (graph)
  return (
    <Box>
      {i7nAccountsData.map((acc) => {
        if (acc.atom === undefined) {
          const links = [];
          for (const vendor of Object.values(VENDORS)) {
            const linkData = vendor.getNoAccountAtomInfo(
              acc.account,
              acc.chainId,
            );
            console.log('linkData', linkData);
            console.log('vendor', vendor);
            links.push(
              <Link href={linkData.url}>Create atom on {vendor.name}</Link>,
            );
          }
          console.log('links', links);
          return (
            <Box>
              <Text>
                No information about this account on intuition, yet.{' '}
                {acc.account}
              </Text>
              {links.map((linkComponent) => linkComponent)}
            </Box>
          );
        }

        const globalTriples = acc.atom?.as_subject_triples?.map(
          (triple: any) => {
            const emoji =
              triple.predicate.id === '4' ? triple.predicate.emoji : '🗣️';

            return (
              <Card
                title={`${emoji} ${
                  triple.predicate.id === '4' ? '' : triple.predicate.label
                } ${triple.object.label}`}
                value={triple.vault?.position_count.toString()}
              />
            );
          },
        );

        const triples: Array<{
          triple: Triple;
          claimsForCount: number;
          claimsAgainstCount: number;
        }> = [];

        // Group claims by triple ID
        const tripleGroups = acc.claims.reduce(
          (account: { [key: string]: any[] }, claim: any) => {
            const tripleId = claim.triple.id;
            if (!account[tripleId]) {
              account[tripleId] = [];
            }
            account[tripleId]?.push(claim);
            return account;
          },
          {},
        );

        // Process each unique triple
        Object.entries(tripleGroups).forEach(([tripleId, claims]) => {
          const claimsFor = claims.filter((claim) => claim.shares > 0);
          const claimsAgainst = claims.filter(
            (claim) => claim.counterShares > 0,
          );

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
          const emoji =
            t.triple.predicate.id === '4' ? t.triple.predicate.emoji : '🗣️';

          return (
            <Card
              title={`${emoji} ${
                t.triple.predicate.id === '4' ? '' : t.triple.predicate.label
              } ${t.triple.object.label}`}
              value={t.claimsForCount.toString()}
            />
          );
        });
        /*
          {acc.data.account.atom.asSubject.length > 0 && <Heading>🌐 Global</Heading>}
          <Section>
            {globalTriples}
          </Section>
       */

        return (
          <Box>
            {acc.atom?.type !== 'Unknown' && acc.atom?.type !== 'Caip10' && (
              <Box>
                <Card title={acc.label || ''} image={acc.image} value={''} />
                <Box direction="horizontal" alignment="space-between">
                  <Text>Following: {acc.followingCount || ''}</Text>
                  <Link
                    href={
                      'https://beta.portal.intuition.systems/app/profile/' +
                      acc.account
                    }
                  >
                    Account
                  </Link>
                </Box>
                <Box direction="horizontal" alignment="space-between">
                  {acc.atom?.followers.length > 0 && (
                    <Text>
                      Followers:{' '}
                      {acc.atom?.followers[0]?.vault?.position_count.toString()}
                    </Text>
                  )}
                </Box>
              </Box>
            )}

            {acc.claims !== undefined && acc.claims?.length > 0 && (
              <Heading>From Accounts You’re Following</Heading>
            )}
            <Section>{followingTriples}</Section>

            {acc.atom !== undefined &&
              acc.atom?.as_subject_triples?.length > 0 && (
                <Heading>From everyone</Heading>
              )}
            <Section>{globalTriples}</Section>
          </Box>
        );
      })}
    </Box>
  );
};

export enum AccountType {
  NoAccount = 'NO_ACCOUNT',
}

export const getAccountType = (accountData: any): AccountType => {
  const { account } = accountData;
  if (account === null) {
    return AccountType.NoAccount;
  }
  return AccountType.NoAccount; // default
};

export const renderNoAccount = (address: string, chainId: string) => {
  console.log('renderNoAccount', address, chainId);
  const links = [];
  for (const vendor of Object.values(VENDORS)) {
    const { name, getNoAccountAtomInfo } = vendor;
    const { url } = getNoAccountAtomInfo(address, chainId);
    console.log('url', url);
    console.log('vendor', vendor);
    links.push(<Link href={url}>Create atom on {name}</Link>);
  }
  console.log('links', links);
  return (
    <Box>
      <Text>
        No information about this account on intuition, yet! {address}
      </Text>
      {links.map((linkComponent) => linkComponent)}
    </Box>
  );
};
