import { Box, Divider } from '@metamask/snaps-sdk/jsx';
import { AccountProps } from '../../types';
import { CreateTrustTriple } from './actions/CreateTrustTriple';
import { StakePrompt } from './actions/StakePrompt';
import { CreateNickname } from './actions/CreateNickname';
import { ViewMore } from './actions/ViewMore';

/**
 * Footer component that renders contextual CTAs based on account state.
 *
 * Actions are rendered in priority order:
 * 1. CreateTrustTriple - when no atom exists (most critical)
 * 2. StakePrompt - when trust triple exists but user hasn't staked
 * 3. CreateNickname - when atom exists but has no nickname
 * 4. ViewMore - always shown (links to full atom view)
 *
 * Each action component is self-gating: it returns null if conditions aren't met.
 */
export const Footer = (props: AccountProps) => {
  return (
    <Box>
      <Divider />
      <Box>
        {/* Priority 1: Create trust triple (no atom) */}
        <CreateTrustTriple {...props} />

        {/* Priority 2: Stake on trust triple */}
        <StakePrompt {...props} />

        {/* Priority 3: Create nickname */}
        <CreateNickname {...props} />

        {/* Always: View more on vendor site */}
        <ViewMore {...props} />
      </Box>
    </Box>
  );
};

