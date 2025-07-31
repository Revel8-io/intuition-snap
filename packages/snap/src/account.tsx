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

import { backendUrl } from './config';
import {
  getAccountQuery,
  getAccountTrustQuery,
  getTripleExistsQuery,
  searchAtomsQuery,
} from './queries';
import { VENDORS } from './vendors';
import { getChainConfigByChainId } from './config';
import { addressToCaip10 } from './util';

export const getAccountData = async (
  destinationAddress: string,
  fromAddress: string | null,
  chainId: string,
) => {
  console.log('getAccountData', destinationAddress, fromAddress, chainId);
  const caipAddress = addressToCaip10(destinationAddress, chainId);
  try {
    const accountPromise = axios.post(backendUrl, {
      query: getAccountQuery,
      variables: {
        address: destinationAddress,
        caipAddress,
      },
    });
    const codePromise = ethereum.request({
      method: 'eth_getCode',
      params: [destinationAddress, 'latest'],
    });
    const [accountResponse, accountType] = await Promise.all([
      accountPromise,
      codePromise,
    ]);
    console.log('accountResponse', JSON.stringify(accountResponse));
    console.log('accountType', accountType);
    const {
      data: {
        data: { accounts },
      },
    } = accountResponse;
    console.log('accounts', accounts);
    const isContract = accountType !== '0x';
    if (accounts.length === 0) {
      console.log('no accounts found');
      return { account: null, isContract };
    }

    if (accounts[0].atom_id === null) {
      console.log('account has no atom');
      return { account: accounts[0], isContract };
    }

    // account exists, now check if atom exists
    const { atom_id: atomId } = accounts[0];
    console.log('atomId', atomId);
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig) {
      throw new Error(
        `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
      );
    }
    console.log('chainConfig', chainConfig);
    const { IS_ATOM_ID, MALICIOUS_ATOM_ID } = chainConfig;
    const payload = {
      subjectId: atomId,
      predicateId: IS_ATOM_ID,
      objectId: MALICIOUS_ATOM_ID,
    };
    console.log('payload', payload);
    const { data: accountTrustData } = await axios.post(backendUrl, {
      query: getTripleExistsQuery,
      variables: payload,
    });
    console.log('accountTrustData', JSON.stringify(accountTrustData));
    const { triples } = accountTrustData.data;
    console.log('triples', triples);
    if (true) {
      console.log('triple does not exist');
      return { account: accounts[0], triple: null, isContract };
    }

    // if account and atom exist, but no triple

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
    console.log('USING FALLBACK');
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
  AccountNoAtom = 'ACCOUNT_NO_ATOM',
  AccountAtomNoTriple = 'ACCOUNT_ATOM_NO_TRIPLE',
}

export const getAccountType = (accountData: any): AccountType => {
  console.log('getAccountType accountData', accountData);
  const { account } = accountData;
  if (account === null) {
    return AccountType.NoAccount;
  }
  if (account.atom_id === null) {
    return AccountType.AccountNoAtom;
  }
  if (true /* account.triple === null */) {
    return AccountType.AccountAtomNoTriple;
  }
  console.log('getAccountType FALLBACK: AccountType.NoAccount');
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

export const renderAccountNoAtom = renderNoAccount;

// need to complete the triple, we already have atom_id
export const renderAccountAtomNoTriple = (
  account: {
    atom: any;
    triple: any;
    isContract: boolean;
  },
  chainId: string,
) => {
  console.log('renderAccountAtomNoTriple', JSON.stringify(account), chainId);
  const links = [];
  for (const vendor of Object.values(VENDORS)) {
    const { name, getAccountAtomNoTripleInfo } = vendor;
    const { url } = getAccountAtomNoTripleInfo(account, chainId);
    console.log('url', url);
    console.log('vendor', vendor);
    console.log('name', name);
    links.push(
      <Link href={url}>Is this address trustworthy? Vote on {name}</Link>,
    );
  }
  console.log('links', links);
  return (
    <Box>
      <Text>Atom exists for {account.id}</Text>
      {links.map((linkComponent) => linkComponent)}
    </Box>
  );
};
