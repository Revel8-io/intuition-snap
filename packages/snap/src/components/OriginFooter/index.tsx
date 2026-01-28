import { Box, Divider } from '@metamask/snaps-sdk/jsx';
import { OriginProps, OriginType } from '../../types';
import { OriginCreateAtom } from './actions/OriginCreateAtom';
import { OriginStakePrompt } from './actions/OriginStakePrompt';
import { OriginViewMore } from './actions/OriginViewMore';

/**
 * Footer component for dApp Origin that renders contextual CTAs.
 *
 * Actions are rendered in priority order:
 * 1. OriginCreateAtom - when no atom exists (add dApp to knowledge graph)
 * 2. OriginStakePrompt - when origin atom exists (vote on trustworthiness)
 * 3. OriginViewMore - when origin atom exists (link to full details)
 *
 * Returns null when:
 * - No origin provided (OriginType.NoOrigin)
 *
 * Each action component is self-gating: it returns null if conditions aren't met.
 */
export const OriginFooter = (props: OriginProps) => {
  // Don't render footer if no origin at all
  if (props.originType === OriginType.NoOrigin) {
    return null;
  }

  // Check if origin has an atom (known dApp)
  const hasOriginAtom =
    props.originType === OriginType.AtomWithoutTrustTriple ||
    props.originType === OriginType.AtomWithTrustTriple;

  return (
    <Box>
      <Divider />
      <Box>
        {/* Priority 1: Add unknown dApp to knowledge graph */}
        <OriginCreateAtom {...props} />

        {/* Priority 2: Vote on dApp trustworthiness (known dApps only) */}
        {hasOriginAtom && <OriginStakePrompt {...props} />}

        {/* Priority 3: View more about dApp on vendor site (known dApps only) */}
        {hasOriginAtom && <OriginViewMore {...props} />}
      </Box>
    </Box>
  );
};

