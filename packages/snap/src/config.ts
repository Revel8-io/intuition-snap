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

export const BASE_MAINNET = {
  backendUrl: 'https://prod.base.intuition-api.com/v1/graphql',
  chainId: 8453,
  chainIdHex: '0x2105',
  chainName: 'Base Mainnet',
  chainKey: 'base-mainnet',
  i7nExplorerDomain: 'https://beta.portal.intuition.systems/app',
  currencySymbol: 'ETH',
  decimalPrecision: 18,
  trustworthyAtomId: '0', // todo: need to be created
  isAtomId: '0', // todo: need to be created
  relatedNicknamesAtomId: '0',
};

export const BASE_SEPOLIA = {
  backendUrl: 'https://prod.base-sepolia.intuition-api.com/v1/graphql',
  chainId: 84532,
  chainIdHex: '0x14A34',
  chainName: 'Base Sepolia',
  chainKey: 'base-sepolia',
  i7nExplorerDomain: 'https://dev.portal.intuition.systems/app',
  currencySymbol: 'ETH',
  decimalPrecision: 18,
  isAtomId: '26811',
  trustworthyAtomId: '26858',
  relatedNicknamesAtomId: '26813',
};

export const INTUITION_TESTNET = {
  backendUrl: 'https://testnet.intuition.sh/v1/graphql',
  chainId: 13579,
  chainIdHex: '0x350B',
  chainName: 'Intuition Testnet',
  chainKey: 'intuition-testnet',
  currencySymbol: 'TRUST',
  decimalPrecision: 18,
  i7nExplorerDomain: 'https://testnet.trust-scan.io',
  isAtomId: '0',
  trustworthyAtomId: '0',
  relatedNicknamesAtomId: '0',
};

export const CHAIN_CONFIGS = [BASE_MAINNET, BASE_SEPOLIA];

export const chainConfig =
  /* process.env.NODE_ENV === 'production' ? BASE_MAINNET : */ BASE_SEPOLIA;

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
