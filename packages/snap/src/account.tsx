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
export const getSnapState = async (): Promise<any> => {
  return await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  });
};

export const setSnapState = async (newState: { uiMode: string }) => {
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState },
  });
};

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
    const {
      data: { accounts },
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
    const { isAtomId, trustworthyAtomId, relatedNicknamesAtomId } =
      chainConfig as ChainConfig;
    const trustQuery = graphQLQuery(getTripleWithPositionsDataQuery, {
      subjectId: atomId,
      predicateId: isAtomId,
      objectId: trustworthyAtomId,
    });
    const nicknameQuery = graphQLQuery(getListWithHighestStakeQuery, {
      subjectId: atomId,
      predicateId: relatedNicknamesAtomId,
    });
    const [trustResponse, nicknameResponse] = await Promise.all([
      trustQuery,
      nicknameQuery,
    ]);
    const trustTriple = trustResponse.data.triples[0];
    const nicknameTriple = nicknameResponse.data.triples[0];
    const nickname = nicknameTriple?.object?.label;
    if (!trustTriple) {
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
        to contribute:
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
  nickname,
}: {
  account: Account;
  chainId: string;
  nickname: string;
}) => {
  const links = [];

  for (const vendor of Object.values(VENDORS)) {
    const { name, getAccountAtomNoTrustData } = vendor;
    if (!getAccountAtomNoTrustData) {
      continue;
    }
    //
    const { url } = getAccountAtomNoTrustData(account.atom_id, chainId);
    links.push(
      <Link href={url}>Is this address trustworthy? Vote on {name}</Link>,
    );
  }

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

  return (
    <Container>
      <Box>
        <Row label="Address">
          <Address address={accountData.account?.id || ''} />
        </Row>
        {accountData.nickname && (
          <Row label="Nickname">
            <Value value={`"${accountData.nickname}"`} extra="" />
          </Row>
        )}
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
        <Button name="rate_accountAtomTrustData">Rate account</Button>
      </Box>
    </Container>
  );
};

export const renderOnTransaction = (props) => {
  const combinedProps = { ...props, ...props.context };
  const { triple, accountType, to, chainId, account, nickname } = combinedProps;
  let initialUI = null;
  switch (accountType) {
    case AccountType.NoAccount:
    case AccountType.AccountNoAtom:
      initialUI = renderNoAccount(to, chainId);
      break;
    case AccountType.AccountAtomNoTrustData:
      initialUI = (
        <RenderAccountAtomNoTrustData
          account={account}
          chainId={chainId}
          nickname={nickname}
        />
      );
      break;
    case AccountType.AccountAtomTrustData:
      initialUI = renderAccountAtomTrustData(triple, { ...combinedProps });
      break;
    default:
      initialUI = null;
  }
  return initialUI;
};

export const AccountComponents = {
  renderOnTransaction,
};
