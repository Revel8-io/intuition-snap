import {
  Box,
  Row,
  Text,
  Heading,
  Section,
  Bold,
  Value,
} from '@metamask/snaps-sdk/jsx';
import { OriginType, PropsForOriginType } from '../types';
import { stringToDecimal } from '../util';
import { chainConfig } from '../config';

/**
 * Section header for the dApp origin.
 */
const OriginHeader = () => (
  <Heading size="sm">dApp Origin</Heading>
);

/**
 * Returns a trust badge string and color based on trust ratio.
 */
const getTrustInfo = (
  supportMarketCap: number,
  opposeMarketCap: number,
): { badge: string; color: 'success' | 'warning' | 'muted' } => {
  const total = supportMarketCap + opposeMarketCap;
  if (total === 0) return { badge: 'No Stakes', color: 'muted' };
  
  const trustRatio = (supportMarketCap / total) * 100;
  if (trustRatio >= 70) return { badge: 'Trusted', color: 'success' };
  if (trustRatio >= 30) return { badge: 'Mixed', color: 'warning' };
  return { badge: 'Untrusted', color: 'warning' };
};

/**
 * Origin display when no transaction origin was provided.
 * This can happen for direct RPC calls or certain wallet interactions.
 * Returns null to hide the section entirely.
 */
export const NoOrigin = (
  params: PropsForOriginType<OriginType.NoOrigin>,
) => {
  // Don't render anything if no origin - this is not an error state
  return null;
};

/**
 * Origin display when the origin URL has no atom on Intuition.
 * Shows a warning that the dApp is unknown to the community.
 */
export const OriginNoAtom = (
  params: PropsForOriginType<OriginType.NoAtom>,
) => {
  const { hostname } = params;

  return (
    <Section>
      <OriginHeader />
      <Row label="From">
        <Text><Bold>{hostname || 'Unknown'}</Bold></Text>
      </Row>
      <Row label="Status" variant="warning">
        <Text color="warning"><Bold>Unknown dApp</Bold></Text>
      </Row>
      <Text color="default">No community data. Proceed with caution.</Text>
    </Section>
  );
};

/**
 * Origin display when atom exists but no trust triple.
 * The dApp is known but hasn't been rated for trustworthiness.
 */
export const OriginAtomWithoutTrustTriple = (
  params: PropsForOriginType<OriginType.AtomWithoutTrustTriple>,
) => {
  const { hostname, origin } = params;

  return (
    <Section>
      <OriginHeader />
      <Row label="From">
        <Text><Bold>{hostname || origin?.label || 'Unknown'}</Bold></Text>
      </Row>
      <Row label="Status">
        <Text color="default">No trust rating yet</Text>
      </Row>
      <Text color="default">Known dApp, awaiting community votes</Text>
    </Section>
  );
};

/**
 * Origin display when atom and trust triple both exist.
 * Shows full trust data with support/oppose market caps and trust badge.
 */
export const OriginAtomWithTrustTriple = (
  params: PropsForOriginType<OriginType.AtomWithTrustTriple>,
) => {
  const { hostname, origin, triple } = params;

  const supportVault = triple.term?.vaults?.[0];
  const counterVault = triple.counter_term?.vaults?.[0];

  const supportMarketCap = supportVault?.market_cap || '0';
  const supportMarketCapNative = stringToDecimal(supportMarketCap, 18);
  const opposeMarketCap = counterVault?.market_cap || '0';
  const opposeMarketCapNative = stringToDecimal(opposeMarketCap, 18);

  const supportCount = triple.positions?.length || 0;
  const opposeCount = triple.counter_positions?.length || 0;

  const { badge, color } = getTrustInfo(supportMarketCapNative, opposeMarketCapNative);

  return (
    <Section>
      <OriginHeader />
      <Row label="From">
        <Text><Bold>{hostname || origin?.label || 'Unknown'}</Bold></Text>
      </Row>
      <Row label="Trust">
        <Text color={color}><Bold>{badge}</Bold></Text>
      </Row>
      <Row label={`FOR (${supportCount})`}>
        <Value
          value={`${supportMarketCapNative.toFixed(2)} ${chainConfig.currencySymbol}`}
          extra=""
        />
      </Row>
      <Row label={`AGAINST (${opposeCount})`}>
        <Value
          value={`${opposeMarketCapNative.toFixed(2)} ${chainConfig.currencySymbol}`}
          extra=""
        />
      </Row>
    </Section>
  );
};

// Type mapping for origin components - mirrors AccountComponents pattern
export type OriginComponents = {
  [K in OriginType]: (params: PropsForOriginType<K>) => JSX.Element | null;
};

export const OriginComponents: OriginComponents = {
  [OriginType.NoOrigin]: NoOrigin,
  [OriginType.NoAtom]: OriginNoAtom,
  [OriginType.AtomWithoutTrustTriple]: OriginAtomWithoutTrustTriple,
  [OriginType.AtomWithTrustTriple]: OriginAtomWithTrustTriple,
};
