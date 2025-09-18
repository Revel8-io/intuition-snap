export const addressToCaip10 = (
  // input params formatted to fit MetaMask tx params
  address: string, // `0x${string}`,
  chainId: string, // `eip155:${number}`,
): string => {
  return `caip10:${chainId}:${address}`;
};
