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
  rpcUrl: string;
};

export const INTUITION_TESTNET = {
  backendUrl: 'https://testnet.intuition.sh/v1/graphql',
  rpcUrl: 'https://testnet.rpc.intuition.systems',
  chainId: 13579,
  chainIdHex: '0x350B',
  chainName: 'Intuition Testnet',
  chainKey: 'intuition-testnet',
  currencySymbol: 'tTRUST',
  decimalPrecision: 18,
  isAtomId: '0x5cc843bd9ba824dbef4e80e7c41ced4ccde30a7b9ac66f0499c5766dc8811801',
  trustworthyAtomId: '0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a',
  relatedNicknamesAtomId: '0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322',
};

export const INTUITION_MAINNET = {
  backendUrl: 'https://mainnet.intuition.sh/v1/graphql',
  rpcUrl: 'https://rpc.intuition.systems',
  chainId: 1155,
  chainIdHex: '0x483',
  chainName: 'Intuition Mainnet',
  chainKey: 'intuition-mainnet',
  currencySymbol: 'TRUST',
  decimalPrecision: 18,
  isAtomId: '0x5cc843bd9ba824dbef4e80e7c41ced4ccde30a7b9ac66f0499c5766dc8811801',
  trustworthyAtomId: '0xe9c0e287737685382bd34d51090148935bdb671c98d20180b2fec15bd263f73a',
  relatedNicknamesAtomId: '0x5a52541056e9440e75c7775e66c4efa0d41719f254135579b69520395baab322',
};

export const CHAIN_CONFIGS = [INTUITION_TESTNET, INTUITION_MAINNET];
export const chainConfig = process.env.CHAIN === 'mainnet' ? INTUITION_MAINNET : INTUITION_TESTNET;

console.log('chainConfig', chainConfig);
