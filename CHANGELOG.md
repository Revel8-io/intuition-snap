# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2026-01-06

### Changed
- **Logo**: changed Hive Mind logo background to transparent

## [1.2.1] - 2026-01-06

### Changed
- **Logo**: changed Hive Mind logo to include a black circular background (not completely transparent)

## [1.2.0] - 2026-01-06

### Added

#### dApp Origin Insights
- **Origin Trust Display**: Show trust data for the dApp origin (transaction source) in addition to the destination address
- **Origin Trust Triple**: Display support/oppose positions on `[dApp URL] has tag trustworthy` assertions
- **Origin Footer Actions**: CTAs to stake on dApp trust triples or view more details

#### Trusted Circle Feature
- **Trusted Circle Detection**: Cross-reference your trusted contacts with positions on the current triple
- **Social Proof Display**: See which of your trusted contacts have staked FOR or AGAINST the address/dApp
- **Persistent Cache**: Trusted circle data cached for 1 hour using `snap_manageState` for optimal performance

#### Trust Distribution Analysis
- **Distribution Analysis**: Analyze stake distribution health (concentrated vs. distributed)
- **Whale Detection**: Identify when a single staker dominates the vault
- **Distribution Indicators**: Visual indicators showing distribution health (healthy, concentrated, whale-dominated)

### Changed
- **Branding**: Updated brand name from "Revel8" to "Hive Mind" throughout
- **Layout Improvements**: Enhanced UI layout for better readability
- **Currency Symbol**: Correct testnet currency symbol (tTRUST)

### Fixed
- **Chain Switch Issue**: Fixed bug where chain switching failed in certain edge cases
- **Mainnet vs Testnet Detection**: Improved detection of which network configuration to use

### Technical
- **New Components**: Added `Origin.tsx`, `TrustedCircle.tsx`, `UnifiedFooter.tsx`
- **New Modules**: Added `trusted-circle/` module with cache, service, and type definitions
- **Distribution Module**: Added `distribution.ts` for stake distribution analysis
- **Extended Types**: Added `OriginType`, `OriginProps`, `TrustedContact`, `TrustedCirclePositions`

### Permissions
- `snap_manageState` - Persist trusted circle cache across sessions (new in v1.2.0)

## [1.0.1] - 2025-12-07

### Changed
- **Atoms Used**: Changed 'has nickname' atom to 'has alias' atom, and 'has characteristic' to 'has tag'

## [1.0.0] - 2025-12-03

### Added

#### Core Features
- **Transaction Insights**: Display real-time trust and reputation data from the Intuition knowledge graph during transaction signing
- **Trust Triple Display**: Show support and oppose positions on `[address] has tag trustworthy` assertions
- **Alias Display**: Display community-assigned aliases for addresses
- **Stake Amount Visualization**: Show the economic weight (market cap) behind each trust signal
- **User Position Detection**: Display whether the connected wallet has already staked on an address

#### Address Classification
- **Smart Address Detection**: Automatically classify addresses as EOA (Externally Owned Account) or contract
- **CAIP-10 Support**: Support for both standard Ethereum addresses and CAIP-10 formatted addresses
- **Alternate Format Detection**: Detect and notify users when trust data exists in alternate address formats (CAIP vs 0x)

#### User Interface
- **Home Page**: Custom home page in MetaMask with welcome message and links to Hive Mind and Intuition
- **Transaction Insight UI**: Rich UI components displaying trust data before transaction confirmation
- **Footer Actions**: Interactive footer with links to:
  - Create trust triples for addresses without trust data
  - Create aliases for addresses
  - Stake on existing trust triples
  - View more details on the Hive Mind Explorer

#### Multi-Chain Support
- **Intuition Testnet**: Full support for Intuition Testnet (chain ID: 13579)
- **Intuition Mainnet**: Full support for Intuition Mainnet (chain ID: 1155)
- **Chain Configuration**: Environment-based chain selection (testnet/mainnet)

#### Developer Experience
- **TypeScript**: Full TypeScript support with comprehensive type definitions
- **Testing**: Test suite using `@metamask/snaps-jest` covering:
  - Transaction handlers
  - Account state components
  - All account type variations
- **Linting**: ESLint and Prettier configuration following MetaMask standards
- **Build System**: Automated build and manifest generation using `@metamask/snaps-cli`

#### Permissions
- `endowment:transaction-insight` - Display insights before transaction signing
- `endowment:page-home` - Custom home page in MetaMask
- `endowment:network-access` - Query the Intuition GraphQL API
- `endowment:rpc` - Communicate with dapps (dapps: true, snaps: false)

### Technical Details

#### GraphQL Integration
- Integration with Intuition GraphQL API for querying trust data
- Support for querying atoms, trust triples, and alias lists
- Parallel query execution for optimal performance

#### Atoms Used
- `hasTag` - Predicate for trust triples
- `trustworthy` - The "trustworthy" characteristic
- `hasAlias` - Predicate for alias relationships

#### Error Handling
- Graceful error handling for network failures
- Proper error propagation without exposing sensitive information
- Chain switch error handling with fallback classification

### Security
- No console statements in production code
- Proper error handling without information leakage
- Secure network requests to Intuition API
- No key management permissions required

### Documentation
- Comprehensive README with setup instructions
- Architecture documentation
- Configuration guide
- Contributing guidelines

### License
- Dual-licensed under Apache 2.0 and MIT

---

[1.0.0]: https://github.com/hivemindhq-io/snap/releases/tag/v1.0.0
[1.0.1]: https://github.com/hivemindhq-io/snap/releases/tag/v1.0.1
[1.2.0]: https://github.com/hivemindhq-io/snap/releases/tag/v1.2.0
[1.2.1]: https://github.com/hivemindhq-io/snap/releases/tag/v1.2.1
[1.2.2]: https://github.com/hivemindhq-io/snap/releases/tag/v1.2.2
