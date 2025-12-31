import { Box, Divider } from '@metamask/snaps-sdk/jsx';
import { AccountProps, OriginProps } from '../types';
import { CreateTrustTriple } from './Footer/actions/CreateTrustTriple';
import { StakePrompt } from './Footer/actions/StakePrompt';
import { CreateAlias } from './Footer/actions/CreateAlias';
import { ViewMore } from './Footer/actions/ViewMore';

/**
 * Unified footer component that renders all CTAs at the bottom.
 * Combines account (destination address) and origin (dApp) CTAs.
 *
 * Structure:
 * 1. Divider for visual separation
 * 2. Account CTAs (address-related actions)
 * 3. Origin CTAs (dApp-related actions - future)
 *
 * Each action component is self-gating: it returns null if conditions aren't met.
 */
export const UnifiedFooter = ({
  accountProps,
  originProps,
}: {
  accountProps: AccountProps;
  originProps: OriginProps;
}) => {
  return (
    <Box>
      <Divider />
      <Box>
        {/* Account CTAs - Address-related actions */}
        {/* Priority 1: Create trust triple (no atom) */}
        <CreateTrustTriple {...accountProps} />

        {/* Priority 2: Stake on trust triple */}
        <StakePrompt {...accountProps} />

        {/* Priority 3: Create alias */}
        <CreateAlias {...accountProps} />

        {/* Always: View more on vendor site */}
        <ViewMore {...accountProps} />

        {/* Origin CTAs - dApp-related actions */}
        {/* Future: Add origin-specific CTAs here if needed */}
        {/* Example: ViewOrigin, RateOrigin, etc. */}
      </Box>
    </Box>
  );
};

