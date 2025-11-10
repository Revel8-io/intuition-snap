import {
  Address,
  Box,
  Button,
  Divider,
  Link,
  Row,
  Text,
  Value,
} from '@metamask/snaps-sdk/jsx';
import { VENDOR_LIST } from '../vendors';
import { AccountType, PropsForAccountType } from '../types';
import { stringToDecimal } from '../util';

export const NoAtom = (
  params: PropsForAccountType<AccountType.NoAtom>,
) => {
  const { accountType, transactionOrigin, chainId } = params;
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
      <Box>
        <Text>No information about this account on Intuition, yet!</Text>
        {links}
      </Box>
    </Box>
  );
};

export const AtomWithoutTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
) => {
  const { account, nickname, accountType, transactionOrigin, chainId } = params;
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
      <Box>
        <Text>Atom exists for {account?.label || account?.data}</Text>
        {!!nickname && <Text>Nickname: {nickname}</Text>}
        <Button name={`rate_${accountType}`}>Rate account</Button>
      </Box>
    </Box>
  );
};

export const AtomWithTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
) => {
  const { address, triple, nickname, accountType, transactionOrigin, chainId } = params;
  const chainlinkPrices: { usd: number } = { usd: 0.22 };
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
    <Box>
      <Box>
        <Box>
          <Row label="Address">
            <Address address={address as `0x${string}`} />
          </Row>
          {!!nickname && (
            <Row label="Nickname">
              <Value value={`"${nickname}"`} extra="" />
            </Row>
          )}
          <Row label={`Trustworthy (${positions.length})`}>
            <Value
              value={`${supportMarketCapEth.toFixed(2)} TRUST`}
              extra={`$${supportMarketCapFiat.toFixed(2)} `}
            />
          </Row>
          <Row label={`Not trustworthy (${counter_positions.length})`}>
            <Value
              value={`${opposeMarketCapEth.toFixed(2)} TRUST`}
              extra={`$${opposeMarketCapFiat.toFixed(2)} `}
            />
          </Row>
          <Button name={`rate_${accountType}`}>Rate account</Button>
        </Box>
      </Box>
    </Box>
  );
};

// Update the AccountComponents type to use the discriminated union
export type AccountComponents = {
  [K in AccountType]: (params: PropsForAccountType<K>) => JSX.Element;
};

export const AccountComponents: AccountComponents = {
  [AccountType.NoAtom]: NoAtom,
  [AccountType.AtomWithoutTrustTriple]: AtomWithoutTrustTriple,
  [AccountType.AtomWithTrustTriple]: AtomWithTrustTriple,
};
