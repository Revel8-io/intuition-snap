/**
 * Footer action components - each is self-gating based on account state.
 *
 * Priority order (highest to lowest):
 * 1. CreateTrustTriple - no atom exists
 * 2. StakePrompt - trust triple exists but user hasn't staked
 * 3. CreateNickname - atom exists but no nickname
 * 4. ViewMore - always shown
 */
export { CreateTrustTriple } from './CreateTrustTriple';
export { StakePrompt } from './StakePrompt';
export { CreateNickname } from './CreateNickname';
export { ViewMore } from './ViewMore';

