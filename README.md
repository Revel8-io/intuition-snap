# Intuition Snap

This is the first draft for a community-driven MetaMask Snap effort for the Intuition network.


## Main Features

<img height="180" alt="image" src="https://github.com/user-attachments/assets/6f599b3b-7198-48d9-ac40-ba33db0d0470" />


- `onTransaction` hook that displays any trust-related information (see details below) and nickname data for the account
- Vendor integration system allowing third-party dapps to provide CTAs for creating atoms, triples, and staking (see [Vendor Integration](#vendor-integration) below)

### Development

In order to run this Snap locally you need to do the following:
- install [MetaMask Flask](https://docs.metamask.io/snaps/get-started/install-flask)
- Run `pnpm i` in the root of this project
- Run `pnpm start` and a local server should start running on port `8000`
- Browse to `http://localhost:8000`
- Click the "Connect" button
- Approve the connection to the Snap via the MetaMask Extension

Great, now your changes in the code should show up when you are using your version of MetaMask Snap

### More Features to Build

1. Snap homepage
2. Display information about websites / dapps where the transaction originated from
3. Version for mobile app? (Snaps are currently not enabled within MetaMask mobile)
4. SVGs or animations to better convey position distribution
5. We will always need more vendors / third-party dapps for the CTAs since we cannot generate EVM transactions from within the Snap
6. Add support for other fiat currencies (currently just USD)
7. Add translations
8. Decide upon code style and enforce code quality via GitHub actions

### Atoms Used
These can be found in `packages/snap/src/config.ts` and are dependent upon which chain is enabled. (As of 2025-09-17 it is Intuition Testnet)

- Triple: `[address] is trustworthy`
  1. [address]: atom with target address as term_id
  2. "is": `config.isAtomId`
  3. "trustworthy": `config.trustworthyAtomId`

- List: `[address] has nickname [nickname]`
  1. [address]: atom with target address as term_id
  2. "has nickname": `config.relatedNicknamesAtomId`
  3. [nickname]: the label for that atom in the list

You can use this info to stake and unstake to the atoms and triples involved

### Vendor Integration

The Intuition Snap supports integration with third-party dapps (vendors) that can provide functionality for:
- Creating atoms (on-chain identities) for addresses
- Creating trust triples (relationships between atoms)
- Staking on existing trust relationships

#### For Vendors

To integrate your dapp with the Intuition Snap:

1. Create a vendor file in `packages/snap/src/vendors/your-app-name.ts`
2. Implement the `Vendor` interface with methods for each account state
3. Add your vendor to the `VENDOR_LIST` in `packages/snap/src/vendors/index.ts`

See the [Vendor Integration Guide](packages/snap/src/vendors/readme.md) for detailed instructions and the [Example Vendor](packages/snap/src/vendors/example.ts) for a template.

#### Current Vendors

- **Revel8** - The primary Intuition explorer and staking interface
