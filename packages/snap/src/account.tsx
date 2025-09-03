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
import { AccountComponents } from './components';

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
  AccountWithoutAtom = 'AccountWithoutAtom',
  AccountWithoutTrustData = 'AccountWithoutTrustData',
  AccountWithTrustData = 'AccountWithTrustData',
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
    return AccountType.AccountWithoutAtom;
  }
  if (triple === null) {
    return AccountType.AccountWithoutTrustData;
  }
  if (triple) {
    return AccountType.AccountWithTrustData;
  }
  return AccountType.NoAccount; // default
};

export const renderNoAccount = () => {
  return (
    <Box>
      <Text>
        No information about this account on Intuition, yet! Click a link below
        to contribute:
      </Text>
      <Button name="rate_noAccount">Create atom</Button>
    </Box>
  );
};

export const renderAccountWithoutAtom = renderNoAccount;

export const renderAccountWithTrustData = (
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
    const { name, getAccountWithTrustData } = vendor;
    if (!getAccountWithTrustData) {
      continue;
    }
    const { url } = getAccountWithTrustData(term_id);
    links.push(<Link href={url}>Voice your opinion on {name}</Link>);
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
        <Button name="rate_accountWithTrustData">Rate account</Button>
      </Box>
    </Container>
  );
};

export const renderOnTransaction = (props: Identity) => {
  console.log('renderOnTransaction props', JSON.stringify(props, null, 2));
  const combinedProps = { ...props, ...props.context };
  const { accountType } = combinedProps;
  console.log('renderOnTransaction accountType', accountType);
  const initialUI = AccountComponents[accountType]?.(combinedProps);
  console.log('renderOnTransaction initialUI', initialUI);
  return initialUI;
};
