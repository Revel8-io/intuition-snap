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
import { Account, Identity, TripleWithPositions } from 'src/types';
import { stringToDecimal } from '../util';

export const NoAccount = (params: Identity) => {
  const { address, accountType } = params;
  return (
    <Box>
      <Address address={address as `0x${string}`} />
      <Text>No information about this account on Intuition, yet!</Text>
      <Button name={`rate_${accountType}`}>Create atom</Button>
    </Box>
  );
};

export const AccountWithoutAtom = (params: Identity) => {
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

type AccountWithoutTrustDataParams = Identity & {
  account: Account;
};

export const AccountWithoutTrustData = (
  params: AccountWithoutTrustDataParams,
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

type AccountWithTrustDataParams = Identity & {
  account: Account;
  triple: TripleWithPositions;
};

export const AccountWithTrustData = (params: AccountWithTrustDataParams) => {
  console.log('AccountWithTrustData params', JSON.stringify(params, null, 2));
  const { account, triple, nickname, accountType } = params;
  const chainlinkPrices: { usd: number } = { usd: 3500 };
  const { counter_term, term, positions, counter_positions } = triple;

  const supportMarketCap = term.vaults[0]?.market_cap || '0';
  const supportMarketCapEth = stringToDecimal(supportMarketCap, 18);
  const supportMarketCapFiat = chainlinkPrices.usd * supportMarketCapEth;
  const opposeMarketCap = counter_term.vaults[0]?.market_cap || '0';
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

export const AccountComponents = {
  NoAccount, // NoAccount and AccountWithoutAtom render the same UI
  AccountWithoutAtom,
  AccountWithoutTrustData,
  AccountWithTrustData,
};
