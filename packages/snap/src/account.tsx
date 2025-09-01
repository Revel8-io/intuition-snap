import {
  Box,
  Text,
  Link,
  Row,
  Value,
  Container,
  Address,
  Button,
} from '@metamask/snaps-sdk/jsx';
import { type ChainConfig, getChainConfigByChainId } from './config';
import {
  getAccountQuery,
  getListWithHighestStakeQuery,
  getTripleWithPositionsDataQuery,
  graphQLQuery,
} from './queries';
import type { Account, TripleWithPositions } from './types';
import { addressToCaip10, stringToDecimal } from './util';
import { VENDORS } from './vendors';

// State management utilities
export const getSnapState = async (): Promise<{ uiMode: string } | null> => {
  return (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as { uiMode: string } | null;
};

export const setSnapState = async (newState: { uiMode: string }) => {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState },
  });
};

export const getInterfaceContext = async (interfaceId: string) =>
  await snap.request({
    method: 'snap_getInterfaceContext',
    params: {
      id: interfaceId,
    },
  });

export type GetAccountDataResult = {
  account: Account | null;
  triple: TripleWithPositions | null;
  isContract?: boolean;
  nickname?: string;
};

export enum AccountType {
  NoAccount = 'NoAccount',
  AccountNoAtom = 'AccountNoAtom',
  AccountAtomNoTrustData = 'AccountAtomNoTrustData',
  AccountAtomTrustData = 'AccountAtomTrustData',
}

export const getAccountData = async (
  destinationAddress: string,
  chainId: string,
): Promise<GetAccountDataResult | undefined> => {
  const caipAddress = addressToCaip10(destinationAddress, chainId);
  const chainConfig = getChainConfigByChainId(chainId);
  if (!chainConfig) {
    throw new Error(
      `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
    );
  }
  try {
    console.log(
      'getAccountData destinatinoAddress',
      destinationAddress,
      'caipAddress',
      caipAddress,
    );
    const accountPromise = graphQLQuery(getAccountQuery, {
      address: destinationAddress,
      caipAddress,
    });
    const codePromise = ethereum.request({
      method: 'eth_getCode',
      params: [destinationAddress, 'latest'],
    });
    const [accountResponse, accountType] = await Promise.all([
      accountPromise,
      codePromise,
    ]);
    console.log('accountResponse', JSON.stringify(accountResponse, null, 2));
    const {
      data: { accounts },
    } = accountResponse;
    const isContract = accountType !== '0x';
    if (accounts.length === 0) {
      console.log('getAccountData accounts is empty');
      return { account: null, triple: null, isContract };
    }

    if (accounts[0].atom_id === null) {
      console.log('getAccountData accounts[0].atom_id is null');
      return { account: accounts[0], triple: null, isContract };
    }

    // account exists, now check if atom exists
    const { atom_id: atomId } = accounts[0];
    console.log('getAccountData atomId', atomId);
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig) {
      throw new Error(
        `Chain config not found for chainId: ${chainId} (${typeof chainId})`,
      );
    }
    const {
      isAtomId,
      trustworthyAtomId,
      relatedImagesAtomId,
      relatedNicknamesAtomId,
    } = chainConfig as ChainConfig;
    const trustQuery = graphQLQuery(getTripleWithPositionsDataQuery, {
      subjectId: atomId,
      predicateId: isAtomId,
      objectId: trustworthyAtomId,
    });
    const imageQuery = graphQLQuery(getListWithHighestStakeQuery, {
      subjectId: atomId,
      predicateId: relatedImagesAtomId,
    });
    const nicknameQuery = graphQLQuery(getListWithHighestStakeQuery, {
      subjectId: atomId,
      predicateId: relatedNicknamesAtomId,
    });
    const [trustResponse, imageResponse, nicknameResponse] = await Promise.all([
      trustQuery,
      imageQuery,
      nicknameQuery,
    ]);
    console.log('getAccountData trustQueryResponse', trustResponse);
    console.log('getAccountData imageResponse', imageResponse);
    console.log('getAccountData nicknameResponse', nicknameResponse);
    const trustTriple = trustResponse.data.triples[0];
    const imageTriple = imageResponse.data.triples[0];
    const nicknameTriple = nicknameResponse.data.triples[0];
    const nickname = nicknameTriple?.object?.label;
    const image = imageTriple?.object?.image;
    console.log('getAccountData trustTriple', trustTriple);
    if (!trustTriple) {
      console.log(
        'getAccountData triples is empty, accounts[0] is',
        accounts[0],
      );
      return {
        account: accounts[0],
        triple: null,
        isContract,
        nickname,
      };
    }

    if (trustTriple) {
      return {
        account: accounts[0],
        triple: trustTriple || null,
        nickname,
        isContract,
      };
    }
    console.log('getAccountData end of function');
    return { account: null, triple: null, isContract };
  } catch (error: any) {
    console.error('getAccountData error', JSON.stringify(error));
  }
};

export const getAccountType = (accountData: any): AccountType => {
  const { account, triple } = accountData;
  console.log('getAccountType accounData', accountData);

  if (account === null) {
    return AccountType.NoAccount;
  }
  if (account.atom_id === null) {
    return AccountType.AccountNoAtom;
  }
  if (triple === null) {
    console.log('getAccountType triple is null');
    return AccountType.AccountAtomNoTrustData;
  }
  if (triple) {
    return AccountType.AccountAtomTrustData;
  }
  return AccountType.NoAccount; // default
};

export const renderNoAccount = (address: string, chainId: string) => {
  const links = [];
  for (const vendor of Object.values(VENDORS)) {
    const { name, getNoAccountAtomData } = vendor;
    if (!getNoAccountAtomData) {
      continue;
    }
    const { url } = getNoAccountAtomData(address, chainId);
    links.push(<Link href={url}>{name}</Link>);
  }

  return (
    <Box>
      <Text>
        No information about this account on Intuition, yet! Click a link below
        to contribute
      </Text>
      {links.map((linkComponent) => linkComponent)}
    </Box>
  );
};

export const renderAccountNoAtom = renderNoAccount;

// need to complete the triple, we already have atom_id
export const RenderAccountAtomNoTrustData = ({
  account,
  chainId,
  isContract,
  nickname,
}: {
  account: Account;
  chainId: string;
  isContract: boolean;
  nickname: string;
  triple: null;
}) => {
  console.log(
    'RenderAccountAtomNoTrustData chainId',
    chainId,
    ' account',
    account,
  );
  const links = [];

  for (const vendor of Object.values(VENDORS)) {
    const { name, getAccountAtomNoTrustData } = vendor;
    if (!getAccountAtomNoTrustData) {
      continue;
    }
    const { url } = getAccountAtomNoTrustData(account, chainId);
    links.push(
      <Link href={url}>Is this address trustworthy? Vote on {name}</Link>,
    );
  }

  console.log('renderAccountAtomNoTrustData account', account);
  console.log('renderAccountAtomNoTrustData nickname', nickname);
  return (
    <Box>
      <Text>Atom exists for {account.id}</Text>
      {!!nickname && <Text>Nickname: {nickname}</Text>}
      <Button name="rate_accountAtomNoTrustData">Rate account</Button>
    </Box>
  );
};

export const renderAccountAtomTrustData = (
  tripleQueryResponse: TripleWithPositions,
  accountData: GetAccountDataResult,
  chainlinkPrices: { usd: number } = { usd: 3500 },
) => {
  console.log(
    'renderAccountAtomTrustData tripleQueryResponse',
    tripleQueryResponse,
    'accountData',
    accountData,
  );
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
    const { name, getAccountAtomTrustData } = vendor;
    if (!getAccountAtomTrustData) {
      continue;
    }
    const { stakeTripleUrl } = getAccountAtomTrustData(term_id);
    links.push(<Link href={stakeTripleUrl}>Voice your opinion on {name}</Link>);
  }

  console.log(
    'renderAccountAtomTrustData accountData.account',
    accountData.account,
  );
  return (
    <Container>
      <Box>
        {/* <Heading>Trustworthy:</Heading> */}
        <Row label="Address">
          <Address address={accountData.account?.id || ''} />
        </Row>
        {accountData.nickname && (
          <Row label="Nickname">
            <Value value={`"${accountData.nickname}"`} extra="" />
          </Row>
        )}
        {/* <Row label="Nickname">
          <Value value={accountData.nickname || ''} />
        </Row> */}
        <Row label={`Trustworthy (${positions.length})`}>
          <Value
            value={`${supportMarketCapEth.toFixed(6)} Ξ`}
            extra={`$${supportMarketCapFiat.toFixed(2)} `}
          />
        </Row>
        <Row label={`Not trustworthy (${counter_positions.length})`}>
          <Value
            value={`${opposeMarketCapEth.toFixed(6)} Ξ`}
            extra={`$${opposeMarketCapFiat.toFixed(2)} `}
          />
        </Row>
        {links.map((linkComponent) => linkComponent)}
      </Box>
    </Container>
  );
};
