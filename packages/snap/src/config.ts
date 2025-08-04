import { base, baseSepolia } from 'viem/chains';

export type ChainConfig = {
  i7nContract: string;
  chainId: number;
  chainIdHex: string;
  chainName: string;
  chainKey: string;
  explorerDomain: string;
  i8nExplorerDomain: string;
  currencySymbol: string;
  decimalPrecision: number;
  chain: typeof base | typeof baseSepolia;
  ethRpcUrl: string;
  isAtomId: string;
  maliciousAtomId: string;
  backendUrl: string;
};

export const BASE_MAINNET = {
  backendUrl: 'https://prod.base.intuition-api.com/v1/graphql',
  i7nContract: '0x430BbF52503Bd4801E51182f4cB9f8F534225DE5',
  chainId: 8453,
  chainIdHex: '0x2105',
  chainName: 'Base Mainnet',
  chainKey: 'base-mainnet',
  explorerDomain: 'https://basescan.org',
  i8nExplorerDomain: 'https://beta.portal.intuition.systems/app',
  currencySymbol: 'ETH',
  decimalPrecision: 18,
  chain: base,
  maliciousAtomId: '0', // todo: need to be created
  isAtomId: '0', // todo: need to be created
  ethRpcUrl: process.env.BASE_MAINNET_ETH_RPC_URL as string,
};

export const BASE_SEPOLIA = {
  backendUrl: 'https://prod.base-sepolia.intuition-api.com/v1/graphql',
  i7nContract: '0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665',
  chainId: 84532,
  chainIdHex: '0x14A34',
  chainName: 'Base Sepolia',
  chainKey: 'base-sepolia',
  explorerDomain: 'https://sepolia.basescan.org',
  i8nExplorerDomain: 'https://dev.portal.intuition.systems/app',
  currencySymbol: 'ETH',
  decimalPrecision: 18,
  chain: baseSepolia,
  maliciousAtomId: '25202',
  isAtomId: '24793',
  ethRpcUrl: process.env.BASE_SEPOLIA_ETH_RPC_URL as string,
};

export const CHAIN_CONFIGS = [BASE_MAINNET, BASE_SEPOLIA];

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

export const getChainConfigByChainIdHex = (chainIdHex: string) => {
  return CHAIN_CONFIGS.find((config) => {
    return config.chainIdHex.toLowerCase() === chainIdHex.toLowerCase();
  });
};
