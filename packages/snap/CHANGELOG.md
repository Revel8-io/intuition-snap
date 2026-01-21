# Changelog

All notable changes to the Hive Mind Snap for MetaMask will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2026-01-20

### Changed

- Documentation updates: added atom IDs to README for reference

## [1.3.0] - 2026-01-20

### Added

- **Your Position Display**: Show user's own trust/distrust stakes as the primary signal when viewing transaction insights
- User position detection via GraphQL aliases (`user_position` and `user_counter_position`)

### Changed

- Renamed "Your Trusted Contacts" to "Your Trust Circle" for consistency
- Removed 'metamask' origin from trust signals (not relevant to users)

### Fixed

- ENS address matching: correctly use `subject.data` for wallet addresses instead of ENS names
- Trusted Circle ID matching: use wallet addresses instead of atom term IDs for position filtering
- GraphQL query schema path for trusted circle positions
- JSON serialization for `snap_manageState` - ensure state is properly serializable

## [1.2.4] - 2026-01-05

### Fixed

- Remove extraneous comments from SVG logo file

## [1.2.3] - 2026-01-05

### Fixed

- SVG logo adjustments for better display

## [1.2.2] - 2026-01-05

### Changed

- Reverted logo to transparent background

## [1.2.1] - 2026-01-05

### Changed

- Updated logo design

### Fixed

- Atom query ranking now favors higher market cap for better relevance

## [1.2.0] - 2026-01-05

> Note: This version was not tagged separately but changes were included in v1.2.1

### Added

- **Trusted Circle Feature**: See how addresses in your trust network have staked on the destination address
- **Origin/URL Trust Data**: Display trust signals for the dApp/website initiating the transaction
- **Distribution Analysis**: Stake distribution visualization with Gini coefficient and concentration metrics
- Top 30 positions analyzed for trusted circle matching

### Changed

- Migrated from axios to native fetch API
- Improved test coverage and documentation
- Brand name updates throughout the codebase

### Fixed

- Chain switching issues when checking contract code
- Mainnet vs testnet configuration detection
- Testnet currency symbol display

## [1.0.1] - 2025-12-07

### Changed

- Updated atom terminology based on community feedback:
  - 'nickname' → 'alias'
  - 'has characteristic' → 'has tag'
  - 'trustworthy' → 'trustworthiness'
- Updated atom IDs to match production protocol values
- Default network set to testnet for safety

## [1.0.0] - 2025-12-02

### Added

- Initial release of the Intuition Snap for MetaMask
- **Transaction Insights**: View trust signals for destination addresses before signing
- **Account Trust Display**: See aggregate trust/distrust positions and stake amounts
- **Triple Creation CTAs**: Links to create trust triples for addresses without existing claims
- **Staking CTAs**: Links to stake on existing trust triples
- Support for both EVM addresses (`0x...`) and CAIP-10 formatted addresses
- Smart contract detection with separate handling
- Atom search with relevance ranking
- Integration with Intuition Protocol GraphQL API
- Support for Intuition Testnet and Mainnet

---

[1.3.1]: https://github.com/user/repo/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/user/repo/compare/v1.2.4...v1.3.0
[1.2.4]: https://github.com/user/repo/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/user/repo/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/user/repo/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/user/repo/compare/v1.0.1...v1.2.1
[1.0.1]: https://github.com/user/repo/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
