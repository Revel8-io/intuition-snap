import { formatUnits } from 'viem';

export const addressToCaip10 = (
  // input params formatted to fit MetaMask tx params
  address: string, // `0x${string}`,
  chainId: string, // `eip155:${number}`,
): string => {
  return `caip10:${chainId}:${address}`;
};

export const caip10AddressToEvm = (address: string): string => {
  // should handle case of address not being caip10?
  let result = address;
  if (address.includes(':')) {
    const addressParts = address.split(':');
    const numParts = addressParts.length;
    const lastPart = addressParts[numParts - 1];
    if (!lastPart) {
      throw new Error('caip10AddresstoEvm error:Invalid address format');
    }
    result = lastPart;
  }
  return result;
};

export const stringToDecimal = (
  value: string,
  inputDecimals: number,
): number => {
  const valueAsBigInt = BigInt(value);
  const valueAsDecimal = formatUnits(valueAsBigInt, inputDecimals);
  const output: number = parseFloat(valueAsDecimal);
  return output;
};
