import {
  Box,
  Text,
  Heading,
  Link,
  Row,
  Value,
  Container,
} from '@metamask/snaps-sdk/jsx';
import axios from 'axios';

import { type ChainConfig, getChainConfigByChainId } from './config';
import { getAccountQuery, getTripleWithPositionsDataQuery } from './queries';
import type { Account, TripleWithPositions } from './types';
import { addressToCaip10, stringToDecimal } from './util';
import { VENDORS } from './vendors';

export type GetAccountDataResult = {
  account: Account | null;
  triple: TripleWithPositions | null;
  isContract?: boolean;
};

export enum AccountType {
  NoAccount = 'NoAccount',
  AccountNoAtom = 'AccountNoAtom',
  AccountAtomNoTriple = 'AccountAtomNoTriple',
  AccountAtomTriple = 'AccountAtomTriple',
}

export const getAccountData = async (
  destinationAddress: string,
  _fromAddress: string | null,
  chainId: string,
): Promise<GetAccountDataResult | undefined> => {
  const caipAddress = addressToCaip10(destinationAddress, chainId);
  const chainConfig = getChainConfigByChainId(chainId);
  if (!chainConfig) {
    throw new Error(
      `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
    );
  }
  const { backendUrl } = chainConfig as ChainConfig;
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
    const {
      data: {
        data: { accounts },
      },
    } = accountResponse;
    const isContract = accountType !== '0x';
    if (accounts.length === 0) {
      return { account: null, triple: null, isContract };
    }

    if (accounts[0].atom_id === null) {
      return { account: accounts[0], triple: null, isContract };
    }

    // account exists, now check if atom exists
    const { atom_id: atomId } = accounts[0];
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig) {
      throw new Error(
        `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
      );
    }
    const { isAtomId, maliciousAtomId } = chainConfig as ChainConfig;
    const payload = {
      subjectId: atomId,
      predicateId: isAtomId,
      objectId: maliciousAtomId,
    };
    const {
      data: { data: triples },
    }: { data: { data: TripleWithPositions[] } } = await axios.post(
      backendUrl,
      {
        query: getTripleWithPositionsDataQuery,
        variables: payload,
      },
    );
    if (triples.length === 0) {
      return { account: accounts[0], triple: null, isContract };
    }

    if (triples.length > 0) {
      return { account: accounts[0], triple: triples[0] || null, isContract };
    }
    return { account: null, triple: null, isContract };
  } catch (error: any) {
    console.error('getAccountData error', JSON.stringify(error));
  }
};

export const getAccountType = (accountData: any): AccountType => {
  const { account, triple } = accountData;
  if (account === null) {
    return AccountType.NoAccount;
  }
  if (account.atom_id === null) {
    return AccountType.AccountNoAtom;
  }
  if (triple === null) {
    return AccountType.AccountAtomNoTriple;
  }
  if (triple) {
    return AccountType.AccountAtomTriple;
  }
  return AccountType.NoAccount; // default
};

export const renderNoAccount = (address: string, chainId: string) => {
  const links = [];
  for (const vendor of Object.values(VENDORS)) {
    const { name, getNoAccountAtomInfo } = vendor;
    if (!getNoAccountAtomInfo) {
      continue;
    }
    const { url } = getNoAccountAtomInfo(address, chainId);
    links.push(<Link href={url}>Create atom on {name}</Link>);
  }

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
  account: Account,
  chainId: string,
) => {
  const links = [];

  for (const vendor of Object.values(VENDORS)) {
    const { name, getAccountAtomNoTripleInfo } = vendor;
    if (!getAccountAtomNoTripleInfo) {
      continue;
    }
    const { url } = getAccountAtomNoTripleInfo(account, chainId);
    links.push(
      <Link href={url}>Is this address trustworthy? Vote on {name}</Link>,
    );
  }

  return (
    <Box>
      <Text>Atom exists for {account.id}</Text>
      {links.map((linkComponent) => linkComponent)}
    </Box>
  );
};

export const renderAccountAtomTriple = (
  tripleQueryResponse: TripleWithPositions,
  chainlinkPrices: { usd: number } = { usd: 3500 },
) => {
  const { counter_term, term, positions, counter_positions, term_id } =
    tripleQueryResponse;

  const supportMarketCap = term.vaults[0]?.market_cap || '0';
  const supportMarketCapEth = stringToDecimal(supportMarketCap, 18);
  const supportMarketCapFiat = chainlinkPrices.usd * supportMarketCapEth;

  const opposeMarketCap = counter_term.vaults[0]?.market_cap || '0';
  const opposeMarketCapEth = stringToDecimal(opposeMarketCap, 18);
  const opposeMarketCapFiat = chainlinkPrices.usd * opposeMarketCapEth;

  const links = [];
  for (const vendor of Object.values(VENDORS)) {
    const { name, getAccountAtomTripleInfo } = vendor;
    if (!getAccountAtomTripleInfo) {
      continue;
    }
    const { stakeTripleUrl } = getAccountAtomTripleInfo(term_id);
    links.push(<Link href={stakeTripleUrl}>Voice your opinion on {name}</Link>);
  }

  return (
    <Container>
      <Box>
        <Heading>Is trustworthy:</Heading>
        <Row label={`Support (${positions.length})`}>
          <Value
            value={`${supportMarketCapEth.toFixed(6)} ETH`}
            extra={`$${supportMarketCapFiat.toFixed(2)} `}
          />
        </Row>
        <Row label={`Oppose (${counter_positions.length})`}>
          <Value
            value={`${opposeMarketCapEth.toFixed(6)} ETH`}
            extra={`$${opposeMarketCapFiat.toFixed(2)} `}
          />
        </Row>
        {links.map((linkComponent) => linkComponent)}
      </Box>
    </Container>
  );
};
