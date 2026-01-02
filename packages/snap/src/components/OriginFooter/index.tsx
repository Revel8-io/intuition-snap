import { Box, Divider } from '@metamask/snaps-sdk/jsx';
import { OriginProps, OriginType } from '../../types';
import { OriginStakePrompt } from './actions/OriginStakePrompt';
import { OriginViewMore } from './actions/OriginViewMore';

/**
 * Footer component for dApp Origin that renders contextual CTAs.
 *
 * Actions are rendered in priority order:
 * 1. OriginStakePrompt - when origin atom exists (vote on trustworthiness)
 * 2. OriginViewMore - when origin atom exists (link to full details)
 *
 * Returns null when:
 * - No origin provided
 * - Origin has no atom (unknown dApp - we don't encourage creating atoms for unknown dApps mid-transaction)
 *
 * Each action component is self-gating: it returns null if conditions aren't met.
 */
export const OriginFooter = (props: OriginProps) => {
  // Don't render footer for NoOrigin or NoAtom states
  // For NoAtom (unknown dApp), we intentionally don't show CTAs
  // to avoid encouraging users to engage with potentially suspicious dApps
  if (
    props.originType === OriginType.NoOrigin ||
    props.originType === OriginType.NoAtom
  ) {
    return null;
  }

  return (
    <Box>
      <Divider />
      <Box>
        {/* Priority 1: Vote on dApp trustworthiness */}
        <OriginStakePrompt {...props} />

        {/* Priority 2: View more about dApp on vendor site */}
        <OriginViewMore {...props} />
      </Box>
    </Box>
  );
};

