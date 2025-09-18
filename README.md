# Intuition Snap

This is the first draft for a community-driven MetaMask Snap effort for the Intuition network.


## Main Features

<img height="180" alt="image" src="https://github.com/user-attachments/assets/6f599b3b-7198-48d9-ac40-ba33db0d0470" />


- `onTransaction` hook that displays any trust-related information (see details below) and nickname data for the account
- Basic call-to-action (CTA) navigation / functionality. Once third-party vendors (eg Intuition dapps) register their dapps in the `packages/snap/src/vendors/index.ts` file

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

