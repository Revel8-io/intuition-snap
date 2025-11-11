# Intuition Community Snap MVP

## Background

This PR represents what I consider the best minimum viable product (MVP) for an Intuition [Snap](https://metamask.io/snaps). It spotlights [Intuition](https://intuition.systems)'s ability to quantify trust and general sentiment as they relate to EVM transactions. Additionally, it performs this functionality in a decentralized manner.

When a MetaMask user with the Intuition Snap installed goes to either send money to an EVM user or interact with a smart contract ([`onTransaction`](https://docs.metamask.io/snaps/reference/entry-points/#ontransaction)), the Snap will check the Intuition network for triples related to the address. These "insights" include the following:

*Last updated 2025-11-10
1. [EVM address atom] - has characteristic - trustworthy
"has characteristic" atom ID: [0xdd4320a03fcd85ed6ac29f3171208f05418324d6943f1fac5d3c23cc1ce10eb3](https://portal.intuition.systems/explore/atom/0xdd4320a03fcd85ed6ac29f3171208f05418324d6943f1fac5d3c23cc1ce10eb3?tab=overview)
"trustworthy" atom ID: [0xc8328e91eecabf6bdfc9416b544a7aa2de98e74fa62a84863085ce6d893609b3](https://portal.intuition.systems/explore/atom/0xc8328e91eecabf6bdfc9416b544a7aa2de98e74fa62a84863085ce6d893609b3)

2. [EVM address atom] - has nickname - [atom to show->label]
"has nickname" atom ID: [0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322](0x9e4085b31039564a571d25aeea666d6bd5f9a43182501944c37959ba210daf8d)

Over time we expect the number of insights to grow, and quickly!

### Development

In order to run this Snap locally you need to do the following:
- install [MetaMask Flask](https://docs.metamask.io/snaps/get-started/install-flask)
- Run `pnpm i` in the root of this project
- Run `pnpm start` and a local server should start running on port `8000`
- Browse to `http://localhost:8000`
- Click the "Connect" button
- Approve the connection to the Snap via the MetaMask Extension

Great, now your changes in the code should show up when you are using your version of MetaMask Snap

## How It Works

1. `onTransaction` hook gets triggered with transaction-related data
2. Grab address from transaction and use GraphQL to look for the following:
   1. Atom (CAIP or not) representing the address
   2. Triple for: [address] - has characteristic - trustworthy
   3. Nickname for triple: [address] - has nickname - [nickname]
3. Display related information in the "Intuition Insights" section of the UI
4. Display call-to-action links for third-party "vendors". For example: "Create atom" link leading to vendor's web page that helps users create the atom. This is because we cannot do atom creation from within the MetaMask UI


## Atom Selection

The following is my rationale for choosing the atoms that we have set in the config ([packages/snap/src/config.ts](https://github.com/Revel8-io/intuition-snap/blob/main/packages/snap/src/config.ts)):

- "has characteristic" - used simple text (uri: 'has characteristic') for simplicity. Decided on "has characteristic" because it has less ambiguity than "is". Although "has characteristic" takes up a lot of space in a UI I am of the belief that predicate atom text will be abstracted away in many UI's.
- "trustworthy" - also simple text (uri: 'trustworthy') because it is simple and also umabiguous.
- "has nickname" - simple text (uri: 'has nickname') also because it is not ambiguous

## Vendors

We want to encourage user input (ie creating atoms and triples, and staking). Since we cannot create transactions from within the Snap code ([yet](https://github.com/MetaMask/SIPs/pull/180)) we let vendors insert links to their dapps where users can create those transactions.

Want to add links to your Intuition dapp? Read instructions here ([packages/snap/src/vendors](https://github.com/Revel8-io/intuition-snap/blob/main/packages/snap/src/vendors))

## Areas Possibly Needing Improvement

1. Type-safety

## More Features to Build

1. Snap homepage (who owns?) -  if this is owned by Intuition then we have to take measures to make sure users can trust
2. How to fetch vendors in decentralized fashion? (Smart contract registry?)
3. Display information about websites / dapps (origin) where the transaction originated from
4. Version for mobile app? (Snaps are currently not enabled within MetaMask mobile)
5. SVGs or animations to better convey position distribution
6. We will always need more vendors / third-party dapps for the CTAs since we cannot generate EVM transactions from within the Snap
7. Add support for other fiat currencies (currently just USD)
8. Add translations / internationalization
9. Decide upon code style and enforce code quality via GitHub actions / CI
10. Push MetaMask Snap developers to implement [onActivityItem](https://github.com/MetaMask/SIPs/pull/179) handler
11. SVG image support. Link atoms with `has related SVG image` atom. Image [HAS to be SVG](https://docs.metamask.io/snaps/features/custom-ui/#image) (cannot be PNG or SVG)
12. Let users choose their own GraphQL node? (privacy reasons)

// 0x6E35cF57A41fA15eA0EaE9C33e751b01A784Fe7e
