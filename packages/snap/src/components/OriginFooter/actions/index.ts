/**
 * OriginFooter action components - each is self-gating based on origin state.
 *
 * Priority order (highest to lowest):
 * 1. OriginCreateAtom - no atom exists (unknown dApp) - add to knowledge graph
 * 2. OriginStakePrompt - origin atom exists (with or without trust triple)
 * 3. OriginViewMore - always shown when origin atom exists
 */
export { OriginCreateAtom } from './OriginCreateAtom';
export { OriginStakePrompt } from './OriginStakePrompt';
export { OriginViewMore } from './OriginViewMore';

