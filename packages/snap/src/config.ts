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
};

export const CHAIN_CONFIGS = [INTUITION_TESTNET];

export const chainConfig = INTUITION_TESTNET

export const getChainConfigByChainId = (
  chainId: number | string,
): ChainConfig | Error => {
  let typedChainId = chainId;
  if (typeof chainId === 'string') {
    const cleanedChainId = chainId
      .replace('caip10:', '')
      .replace('eip155:', '');
    typedChainId = parseInt(cleanedChainId, 10);
  }
  const chainConfig = CHAIN_CONFIGS.find(
    (config) => config.chainId === typedChainId,
  );
  if (!chainConfig) {
    throw new Error(`Chain config not found for chainId: ${chainId}`);
  }
  return chainConfig;
};
