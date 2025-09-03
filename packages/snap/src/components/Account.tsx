import { Address, Box, Button, Container, Link, Row, Text, Value } from "@metamask/snaps-sdk/jsx";
import { VENDORS } from '../vendors';
import { Identity } from 'src/types';
import { stringToDecimal } from '../util';

export const NoAccount = (params: Identity) => {
  console.log('Account->NoAccount params', params);
  const address = params.address;
  console.log('NoAccount address', address);
  if (!address) {
    throw new Error('Missing address');
  }
  return (
    <Box>
      <Address address={address as `0x${string}`} />
      <Text>
        No information about this account on Intuition, yet! Click a link below
        to contribute:
      </Text>
      <Button name="rate_noAccount">Create atom</Button>
    </Box>
  );
};

export const AccountWithoutAtom = (params: Identity) => {
  console.log('Account->AccountWithoutAtom params', params);
  const { address, chainId } = params;
  const links = [];
  for (const vendor of Object.values(VENDORS)) {
    const { name, accountWithoutAtom } = vendor;
    if (!accountWithoutAtom) {
      continue;
    }
    const { url } = accountWithoutAtom(address, chainId);
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

export const AccountWihoutTrustData = (params: Identity) => {
  console.log('Account->AccountWihoutTrustData params', params);
  const { account, chainId, nickname } = params;
  const links = [];

  for (const vendor of Object.values(VENDORS)) {
    const { name, accountWithoutTrustData } = vendor;
    if (!accountWithoutTrustData) {
      continue;
    }
    //
    const { url } = accountWithoutTrustData(account.atom_id, chainId);
    links.push(
      <Link href={url}>Is this address trustworthy? Vote on {name}</Link>,
    );
  }

  return (
    <Box>
      <Text>Atom exists for {account.id}</Text>
      {!!nickname && <Text>Nickname: {nickname}</Text>}
      <Button name="rate_accountWithoutTrustData">Rate account</Button>
    </Box>
  );
};

export const AccountWithTrustData = (params: Identity) => {
  console.log('AccountWithTrustData params', JSON.stringify(params, null, 2));
  const { account, triple, nickname } = params;
  const chainlinkPrices: { usd: number } = { usd: 3500 };
  const { counter_term, term, positions, counter_positions, term_id } = triple;

  const supportMarketCap = term.vaults[0]?.market_cap || '0';
  const supportMarketCapEth = stringToDecimal(supportMarketCap, 18);
  const supportMarketCapFiat = chainlinkPrices.usd * supportMarketCapEth;
  const opposeMarketCap = counter_term.vaults[0]?.market_cap || '0';
  const opposeMarketCapEth = stringToDecimal(opposeMarketCap, 18);
  const opposeMarketCapFiat = chainlinkPrices.usd * opposeMarketCapEth;
  const links = [];
  for (const vendor of Object.values(VENDORS)) {
    const { name, accountWithTrustData } = vendor;
    if (!accountWithTrustData) {
      continue;
    }
    const { url } = accountWithTrustData(params);
    links.push(<Link href={url}>Voice your opinion on {name}</Link>);
  }
  return (
    <Container>
      <Box>
        <Row label="Address">
          <Address address={account.id} />
        </Row>
        {nickname && (
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
        <Button name="rate_accountWithTrustData">Rate account</Button>
      </Box>
    </Container>
  );
};

export const AccountComponents = {
  NoAccount, // NoAccount and AccountWithoutAtom render the same UI
  AccountWithoutAtom,
  AccountWihoutTrustData,
  AccountWithTrustData,
};
