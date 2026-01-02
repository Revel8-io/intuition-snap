import { Box, Divider } from '@metamask/snaps-sdk/jsx';
import { AccountProps, OriginProps, OriginType } from '../types';
import { CreateTrustTriple } from './Footer/actions/CreateTrustTriple';
import { StakePrompt } from './Footer/actions/StakePrompt';
import { CreateAlias } from './Footer/actions/CreateAlias';
import { ViewMore } from './Footer/actions/ViewMore';
import { OriginStakePrompt } from './OriginFooter/actions/OriginStakePrompt';
import { OriginViewMore } from './OriginFooter/actions/OriginViewMore';

/**
 * Unified footer component that renders all CTAs at the bottom.
 * Combines account (destination address) and origin (dApp) CTAs.
 *
 * Structure:
 * 1. Divider for visual separation
 * 2. Account CTAs (address-related actions)
 * 3. Origin CTAs (dApp-related actions)
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
  // Check if we should show origin CTAs
  // Only show for origins that have atoms (known dApps)
  const showOriginCtas =
    originProps.originType === OriginType.AtomWithoutTrustTriple ||
    originProps.originType === OriginType.AtomWithTrustTriple;

  return (
    <Box>
      <Divider />
      <Box>
        {/* ─────────────────────────────────────────────────────────────────
         * Account CTAs - Destination Address Actions
         * ───────────────────────────────────────────────────────────────── */}

        {/* Priority 1: Create trust triple (no atom) */}
        <CreateTrustTriple {...accountProps} />

        {/* Priority 2: Stake on trust triple */}
        <StakePrompt {...accountProps} />

        {/* Priority 3: Create alias */}
        <CreateAlias {...accountProps} />

        {/* Always: View more on vendor site */}
        <ViewMore {...accountProps} />

        {/* ─────────────────────────────────────────────────────────────────
         * Origin CTAs - dApp Actions (only for known dApps)
         * ───────────────────────────────────────────────────────────────── */}

        {showOriginCtas && (
          <>
            {/* Vote on dApp trustworthiness */}
            <OriginStakePrompt {...originProps} />

            {/* View more about dApp */}
            <OriginViewMore {...originProps} />
          </>
        )}
      </Box>
    </Box>
  );
};

