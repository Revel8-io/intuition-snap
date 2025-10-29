# Transaction Origin Insights

## Background

The purpose of this file is to document the desired specifications for implementation of Transaction Origin Insights in parallel with EVM address insights. `transactionOrigin` is a string (eg `metamask` or `https://mydapp.io`) that comes in the `onTransaction` handler as an input param. We would like it to mirror the same sort of queries that the EVM address / account atom performs. Namely:

1. Does an atom exist with a label fitting the `transactionOrigin` ?
2. If so does it have the `is ... trustworthy` triple?
3. If so then display that info like you do for the EVM address. Include calls to action.

Implement the CTAs appropriately in the src/vendors/revel8.ts file
