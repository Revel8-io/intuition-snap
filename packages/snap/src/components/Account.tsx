import {
  Address,
  Box,
  Button,
  Container,
  Link,
  Row,
  Text,
  Value,
} from '@metamask/snaps-sdk/jsx';
import { VENDOR_LIST } from '../vendors';
import { AccountType, PropsForAccountType } from '../types';
import { stringToDecimal } from '../util';

export const NoAccount = (
  params: PropsForAccountType<AccountType.NoAccount>,
) => {
  const { address, accountType } = params;
  return (
    <Box>
      <Address address={address as `0x${string}`} />
      <Text>No information about this account on Intuition, yet!</Text>
      <Button name={`rate_${accountType}`}>Create atom</Button>
    </Box>
  );
};

export const AccountWithoutAtom = (
  params: PropsForAccountType<AccountType.AccountWithoutAtom>,
) => {
  const { accountType } = params;
  const links: any[] = [];
  VENDOR_LIST.forEach((vendor) => {
    const { name } = vendor;
    const vendorFn = vendor[accountType];
    if (!vendorFn) {
      return;
    }
    const { url } = vendorFn(params);
    links.push(<Link href={url}>{name}</Link>);
  });

  return (
    <Box>
      <Text>No information about this account on Intuition, yet!</Text>
      {links}
    </Box>
  );
};

export const AccountWithoutTrustData = (
  params: PropsForAccountType<AccountType.AccountWithoutTrustData>,
) => {
  const { account, nickname, accountType } = params;
  const links: any[] = [];
  VENDOR_LIST.forEach((vendor) => {
    const { name } = vendor;
    const vendorFn = vendor[accountType];
    if (!vendorFn) {
      return;
    }
    const { url } = vendorFn(params);
    links.push(
      <Link href={url}>Is this address trustworthy? Vote on {name}</Link>,
    );
  });

  return (
    <Box>
      <Text>Atom exists for {account.id}</Text>
      {!!nickname && <Text>Nickname: {nickname}</Text>}
      <Button name={`rate_${accountType}`}>Rate account</Button>
    </Box>
  );
};

export const AccountWithTrustData = (
  params: PropsForAccountType<AccountType.AccountWithTrustData>,
) => {
  const { account, triple, nickname, accountType } = params;
  const chainlinkPrices: { usd: number } = { usd: 4300 };
  const {
    counter_term: {
      vaults: [counterVault],
    },
    term: {
      vaults: [vault],
    },
    positions,
    counter_positions,
  } = triple;

  const supportMarketCap = vault?.market_cap || '0';
  const supportMarketCapEth = stringToDecimal(supportMarketCap, 18);
  const supportMarketCapFiat = chainlinkPrices.usd * supportMarketCapEth;
  const opposeMarketCap = counterVault?.market_cap || '0';
  const opposeMarketCapEth = stringToDecimal(opposeMarketCap, 18);
  const opposeMarketCapFiat = chainlinkPrices.usd * opposeMarketCapEth;
  const links: any[] = [];
  VENDOR_LIST.forEach((vendor) => {
    const { name } = vendor;
    const vendorFn = vendor[accountType];
    if (!vendorFn) {
      return;
    }
    const { url } = vendorFn(params);
    links.push(<Link href={url}>Voice your opinion on {name}</Link>);
  });

  return (
    <Container>
      <Box>
        <Row label="Address">
          <Address address={account.id as `0x${string}`} />
        </Row>
        {!!nickname && (
          <Row label="Nickname">
            <Value value={`"${nickname}"`} extra="" />
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
        <Button name={`rate_${accountType}`}>Rate account</Button>
      </Box>
    </Container>
  );
};

// Update the AccountComponents type to use the discriminated union
export type AccountComponents = {
  [K in AccountType]: (params: PropsForAccountType<K>) => JSX.Element;
};

export const AccountComponents: AccountComponents = {
  [AccountType.NoAccount]: NoAccount,
  [AccountType.AccountWithoutAtom]: AccountWithoutAtom,
  [AccountType.AccountWithoutTrustData]: AccountWithoutTrustData,
  [AccountType.AccountWithTrustData]: AccountWithTrustData,
};
