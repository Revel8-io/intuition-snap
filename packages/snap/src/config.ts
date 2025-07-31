import { base, baseSepolia } from 'viem/chains';

// export const backendUrl = 'https://prod.base.intuition-api.com/v1/graphql';
export const backendUrl =
  'https://prod.base-sepolia.intuition-api.com/v1/graphql';

export const INTUITION_CONTRACT_ADDRESSES = {
  'base-mainnet': '0x430BbF52503Bd4801E51182f4cB9f8F534225DE5',
  'base-sepolia': '0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665',
};

export const BASE_MAINNET = {
  I8N_CONTRACT_ADDRESS: '0x430BbF52503Bd4801E51182f4cB9f8F534225DE5',
  CHAIN_ID: 8453,
  CHAIN_ID_HEX: '0x2105',
  CHAIN_NAME: 'Base Mainnet',
  CHAIN_KEY: 'base-mainnet',
  EXPLORER_DOMAIN: 'https://basescan.org',
  I8N_EXPLORER_DOMAIN: 'https://beta.portal.intuition.systems/app',
  HAS_RELATED_IMAGE_VAULT_ID: '0',
  HAS_RELATED_URL_VAULT_ID: '0',
  CURRENCY_SYMBOL: 'ETH',
  DECIMAL_PRECISION: 18,
  CHAIN: base,
  TARGET_TYPES: {},
  ETH_RPC_URL:
    'https://base-mainnet.g.alchemy.com/v2/xww_HDMOC0nGOVJL-HtXWxn2oqXOtK5v',
};

export const BASE_SEPOLIA = {
  I8N_CONTRACT_ADDRESS: '0x1A6950807E33d5bC9975067e6D6b5Ea4cD661665',
  CHAIN_ID: 84532,
  CHAIN_ID_HEX: '0x14A34',
  CHAIN_NAME: 'Base Sepolia',
  CHAIN_KEY: 'base-sepolia',
  EXPLORER_DOMAIN: 'https://sepolia.basescan.org',
  I8N_EXPLORER_DOMAIN: 'https://dev.portal.intuition.systems/app',
  CURRENCY_SYMBOL: 'ETH',
  DECIMAL_PRECISION: 18,
  CHAIN: baseSepolia,
  HAS_RELATED_IMAGE_VAULT_ID: '20466',
  HAS_RELATED_URL_VAULT_ID: '20467',
  IS_RELEVANT_ATOM_FOR_ID: '20496',
  X_COM_ATOM_ID: '20493',
  EVM_ADDRESS_ATOM_ID: '27414',
  URL_ATOM_ID: '24715',
  OWNS_X_COM_ACCOUNT_ATOM_ID: '23727',
  REVEL8_SNAP_ATOM_ID: '25199',
  MALICIOUS_ATOM_ID: '25202',
  IS_ATOM_ID: '24793',
  ETH_RPC_URL:
    'https://base-sepolia.g.alchemy.com/v2/xww_HDMOC0nGOVJL-HtXWxn2oqXOtK5v',
};

export const CHAIN_CONFIGS = [BASE_MAINNET, BASE_SEPOLIA];

export const getChainConfigByChainId = (chainId: number | string) => {
  let typedChainId = chainId;
  console.log('chainId', chainId);
  if (typeof chainId === 'string') {
    const cleanedChainId = chainId
      .replace('caip10:', '')
      .replace('eip155:', '');
    console.log('cleanedChainId', cleanedChainId);
    typedChainId = parseInt(cleanedChainId, 10);
  }
  const chainConfig = CHAIN_CONFIGS.find(
    (config) => config.CHAIN_ID === typedChainId,
  );
  return chainConfig;
};

export const getChainConfigByChainIdHex = (chainIdHex: string) => {
  return CHAIN_CONFIGS.find((config) => {
    return config.CHAIN_ID_HEX.toLowerCase() === chainIdHex.toLowerCase();
  });
};
