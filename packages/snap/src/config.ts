export type ChainConfig = {
  chainId: number;
  chainIdHex: string;
  chainName: string;
  chainKey: string;
  currencySymbol: string;
  decimalPrecision: number;
  isAtomId: string;
  trustworthyAtomId: string;
  relatedNicknamesAtomId: string;
};

export const INTUITION_TESTNET = {
  backendUrl: 'https://testnet.intuition.sh/v1/graphql',
  chainId: 13579,
  chainIdHex: '0x350B',
  chainName: 'Intuition Testnet',
  chainKey: 'intuition-testnet',
  currencySymbol: 'tTRUST',
  decimalPrecision: 18,
  isAtomId: '0xdd4320a03fcd85ed6ac29f3171208f05418324d6943f1fac5d3c23cc1ce10eb3',
  trustworthyAtomId: '0xc8328e91eecabf6bdfc9416b544a7aa2de98e74fa62a84863085ce6d893609b3',
  relatedNicknamesAtomId: '0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322',
  // 0x2Ece8D4dEdcB9918A398528f3fa4688b1d2CAB91
};

export const INTUITION_MAINNET = {
  backendUrl: 'https://mainnet.intuition.sh/v1/graphql',
  chainId: 1155,
  chainIdHex: '0x483',
  chainName: 'Intuition Mainnet',
  chainKey: 'intuition-mainnet',
  currencySymbol: 'TRUST',
  decimalPrecision: 18,
  isAtomId: '0x002ed7734fb63c17873213c5aec5ebbda2cad8c9b6d36fdc686af657d7c4f50a',
  trustworthyAtomId: '0xa037a2b9677c5c19b1bf4df44d0185ffef493dddb9c49572b6637089205110ca',
  relatedNicknamesAtomId: '0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322',
  // 0x2Ece8D4dEdcB9918A398528f3fa4688b1d2CAB91
  // 0x21aade94c04dc591e0806ec862e5aa015e04246f
};

export const CHAIN_CONFIGS = [INTUITION_TESTNET, INTUITION_MAINNET];

export const chainConfig = process.env.CHAIN === 'mainnet' ? INTUITION_MAINNET : INTUITION_TESTNET;

