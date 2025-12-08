/**
 * Footer action components - each is self-gating based on account state.
 *
 * Priority order (highest to lowest):
 * 1. CreateTrustTriple - no atom exists
 * 2. StakePrompt - trust triple exists but user hasn't staked
 * 3. CreateAlias - atom exists but no alias
 * 4. ViewMore - always shown
 */
export { CreateTrustTriple } from './CreateTrustTriple';
export { StakePrompt } from './StakePrompt';
export { CreateAlias } from './CreateAlias';
export { ViewMore } from './ViewMore';

