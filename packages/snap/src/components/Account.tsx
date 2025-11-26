import {
  Address,
  Box,
  Link,
  Row,
  Text,
  Value,
} from '@metamask/snaps-sdk/jsx';
import { revel8 as vendor } from '../vendors/revel8';
import { AccountType, PropsForAccountType } from '../types';
import { stringToDecimal } from '../util';
import { chainConfig } from '../config';

export const NoAtom = (
  params: PropsForAccountType<AccountType.NoAtom>,
) => {
  console.log('😎 NoAtom params', JSON.stringify(params, null, 2));
  const { accountType, isContract } = params;
  const links: any[] = [];
  const { name, noAtom } = vendor;
  const { url } = vendor.noAtom(params);
  links.push(<Link href={url}>{name}</Link>);

  const accountTypeSyntax = isContract ? 'contract' : 'address';

  return (
    <Box>
      <Box>
        <Text>No information about this {accountTypeSyntax} on Intuition, yet!</Text>
      </Box>
    </Box>
  );
};

export const AtomWithoutTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
) => {
  console.log('😎 NoAtom params', JSON.stringify(params, null, 2));
  const { account, nickname, accountType } = params;
  const links: any[] = [];
  const { name, atomWithoutTrustTriple } = vendor;
  const { url } = atomWithoutTrustTriple(params);
  links.push(
    <Link href={url}>Is this address trustworthy? Vote on {name}</Link>,
  );

  return (
    <Box>
      <Box>
        <Text>Atom exists for {account?.label || account?.data}, but it has no trust data yet</Text>
        {!!nickname && <Text>Nickname: {nickname}</Text>}
      </Box>
    </Box>
  );
};
// http://localhost:3000/atoms/0x5fe007...d9c8896?modal=complete_triple&atom_ids=0x5fe0...9c8896,0x5cc843bd9...811801,0xa037...05110ca
export const AtomWithTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
) => {
  console.log('😎 NoAtom params', JSON.stringify(params, null, 2));
  const { address, triple, nickname, accountType } = params;
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
  const supportMarketCapNative = stringToDecimal(supportMarketCap, 18);
  const opposeMarketCap = counterVault?.market_cap || '0';
  const opposeMarketCapNative = stringToDecimal(opposeMarketCap, 18);
  const links: any[] = [];
  const { url } = vendor.atomWithTrustTriple(params);
  links.push(<Link href={url}>Voice your opinion on {vendor.name}</Link>);

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
              value={`${supportMarketCapNative.toFixed(2)} ${chainConfig.currencySymbol}`}
              extra={``}
            />
          </Row>
          <Row label={`Not trustworthy (${counter_positions.length})`}>
            <Value
              value={`${opposeMarketCapNative.toFixed(2)} ${chainConfig.currencySymbol}`}
              extra={``}
            />
          </Row>
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
