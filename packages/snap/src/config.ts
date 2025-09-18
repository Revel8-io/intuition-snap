export type ChainConfig = {
  chainId: number;
  chainIdHex: string;
  chainName: string;
  chainKey: string;
  i7nExplorerDomain: string;
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
  i7nExplorerDomain: 'https://localhost:3000',
  isAtomId: '0x9480992aaf84de3ead7ef7bc1eab16473de93647b83dc5c3575146d971b4737d',
  trustworthyAtomId: '0x357a27d54fecf107f717eb144e660914beb907b83628dff7bb3ac0d51856afe8',
  relatedNicknamesAtomId: '0xfed083dd8c0a10780db78d9643f7ee8bdccf8a67ffffee9fdf27dd7d3481dd0b',
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
