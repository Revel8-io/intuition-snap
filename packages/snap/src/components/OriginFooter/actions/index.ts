/**
 * OriginFooter action components - each is self-gating based on origin state.
 *
 * Priority order (highest to lowest):
 * 1. OriginStakePrompt - origin atom exists (with or without trust triple)
 * 2. OriginViewMore - always shown when origin atom exists
 */
export { OriginStakePrompt } from './OriginStakePrompt';
export { OriginViewMore } from './OriginViewMore';

