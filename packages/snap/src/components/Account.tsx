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
import { AccountType, PropsForAccountType, GetOriginDataResult, OriginType } from '../types';
import { stringToDecimal } from '../util';
import { getOriginType } from '../account';

// Helper component to render origin section
const OriginSection = ({
  originData,
  transactionOrigin,
  chainId,
}: {
  originData?: GetOriginDataResult | null;
  transactionOrigin?: string;
  chainId: string;
}) => {
  if (!transactionOrigin || !originData) return null;

  const originType = getOriginType(originData);
  const { originAtom, originTriple, originNickname } = originData;

  return (
    <Box>
      <Divider />
      <Box>
        <Box>
          <Row label="Transaction Origin">
            <Value value={transactionOrigin} extra="" />
          </Row>

          {originType === OriginType.NoAtom && (
            <Box>
              <Text>No atom exists for this origin yet</Text>
              <Button name={`rate_origin_${OriginType.NoAtom}`}>Create origin atom</Button>
            </Box>
          )}

          {originType === OriginType.AtomWithoutTrust && originAtom && (
            <Box>
              <Text>Atom exists for {transactionOrigin}</Text>
              {originNickname && (
                <Row label="Nickname">
                  <Value value={`"${originNickname}"`} extra="" />
                </Row>
              )}
              <Button name={`rate_origin_${OriginType.AtomWithoutTrust}`}>Rate origin</Button>
            </Box>
          )}

          {originType === OriginType.AtomWithTrust && originAtom && originTriple && (
            <Box>
              {originNickname && (
                <Row label="Nickname">
                  <Value value={`"${originNickname}"`} extra="" />
                </Row>
              )}

              {/* Trust data */}
              {(() => {
                const { term, counter_term, positions, counter_positions } = originTriple;
                const supportVault = term?.vaults?.[0];
                const opposeVault = counter_term?.vaults?.[0];

                const supportMarketCap = supportVault?.market_cap || '0';
                const supportMarketCapEth = stringToDecimal(supportMarketCap, 18);
                const supportMarketCapFiat = 4300 * supportMarketCapEth; // TODO: use real chainlink price

                const opposeMarketCap = opposeVault?.market_cap || '0';
                const opposeMarketCapEth = stringToDecimal(opposeMarketCap, 18);
                const opposeMarketCapFiat = 4300 * opposeMarketCapEth;

                return (
                  <Box>
                    <Row label={`Trustworthy (${positions?.length || 0})`}>
                      <Value
                        value={`${supportMarketCapEth.toFixed(6)} Ξ`}
                        extra={`$${supportMarketCapFiat.toFixed(2)} `}
                      />
                    </Row>
                    <Row label={`Not trustworthy (${counter_positions?.length || 0})`}>
                      <Value
                        value={`${opposeMarketCapEth.toFixed(6)} Ξ`}
                        extra={`$${opposeMarketCapFiat.toFixed(2)} `}
                      />
                    </Row>
                  </Box>
                );
              })()}

              <Button name={`rate_origin_${OriginType.AtomWithTrust}`}>Rate origin</Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const NoAccount = (
  params: PropsForAccountType<AccountType.NoAccount>,
) => {
  const { address, accountType, originData, transactionOrigin, chainId } = params;
  return (
    <Box>
      <Box>
        <Address address={address as `0x${string}`} />
        <Text>No information about this account on Intuition, yet!</Text>
        <Button name={`rate_${accountType}`}>Create atom</Button>
      </Box>
      <OriginSection originData={originData} transactionOrigin={transactionOrigin} chainId={chainId} />
    </Box>
  );
};

export const NoAtom = (
  params: PropsForAccountType<AccountType.NoAtom>,
) => {
  const { accountType, originData, transactionOrigin, chainId } = params;
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
      <OriginSection originData={originData} transactionOrigin={transactionOrigin} chainId={chainId} />
    </Box>
  );
};

export const AtomWithoutTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithoutTrustTriple>,
) => {
  const { account, nickname, accountType, originData, transactionOrigin, chainId } = params;
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
        <Text>Atom exists for {account.label || account.data}</Text>
        {!!nickname && <Text>Nickname: {nickname}</Text>}
        <Button name={`rate_${accountType}`}>Rate account</Button>
      </Box>
      <OriginSection originData={originData} transactionOrigin={transactionOrigin} chainId={chainId} />
    </Box>
  );
};

export const AtomWithTrustTriple = (
  params: PropsForAccountType<AccountType.AtomWithTrustTriple>,
) => {
  const { address, triple, nickname, accountType, originData, transactionOrigin, chainId } = params;
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
      <OriginSection originData={originData} transactionOrigin={transactionOrigin} chainId={chainId} />
    </Box>
  );
};

// Update the AccountComponents type to use the discriminated union
export type AccountComponents = {
  [K in AccountType]: (params: PropsForAccountType<K>) => JSX.Element;
};

export const AccountComponents: AccountComponents = {
  [AccountType.NoAccount]: NoAccount,
  [AccountType.NoAtom]: NoAtom,
  [AccountType.AtomWithoutTrustTriple]: AtomWithoutTrustTriple,
  [AccountType.AtomWithTrustTriple]: AtomWithTrustTriple,
};
